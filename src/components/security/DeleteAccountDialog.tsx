import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, RefreshCw } from 'lucide-react';

interface DeleteAccountDialogProps {
  userEmail: string;
  onAccountDeleted: () => void;
}

export function DeleteAccountDialog({ userEmail, onAccountDeleted }: DeleteAccountDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmationText, setConfirmationText] = useState('');
  
  const expectedConfirmation = `delete-${userEmail}`;
  const isConfirmationValid = confirmationText === expectedConfirmation;
  
  const handleDeleteAccount = async () => {
    if (!isConfirmationValid) return;
    
    try {
      setIsDeleting(true);
      
      // Step 1: Delete all user data from database tables
      const { error: dataError } = await supabase.rpc('delete_user_data', {
        user_id: (await supabase.auth.getUser()).data.user?.id
      });
      
      if (dataError) {
        console.error('Error deleting user data:', dataError);
        toast.error('Failed to delete account data');
        return;
      }
      
      // Step 2: Delete the auth user
      const { error: authError } = await supabase.auth.admin.deleteUser(
        (await supabase.auth.getUser()).data.user?.id || ''
      );
      
      if (authError) {
        // If we can't delete through admin API, try with user session
        const { error: userDeleteError } = await supabase.rpc('delete_user');
        
        if (userDeleteError) {
          console.error('Error deleting user account:', userDeleteError);
          toast.error('Failed to delete account');
          return;
        }
      }
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success('Your account has been deleted');
      setIsOpen(false);
      onAccountDeleted();
      
    } catch (error) {
      console.error('Error in delete account process:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsDeleting(false);
    }
  };
  
  return (
    <AlertDialog open={isOpen} onOpenChange={setIsOpen}>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm" className="w-full">
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Account Permanently?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. All your data will be permanently removed from our servers,
            including your profile, order history, and payment information.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            <p>To confirm, please type <strong>delete-{userEmail}</strong> below</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirmation" className="sr-only">
              Confirmation
            </Label>
            <Input
              id="confirmation"
              placeholder={`delete-${userEmail}`}
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="font-mono"
            />
          </div>
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteAccount}
            disabled={!isConfirmationValid || isDeleting}
            className="bg-destructive hover:bg-destructive/90"
          >
            {isDeleting ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              'Delete Account'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
} 