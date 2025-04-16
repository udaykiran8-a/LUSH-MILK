import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Trash2, Info } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export interface DataManagementProps {
  userId: string;
}

export function DataManagement({ userId }: DataManagementProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  // Export user data as JSON file
  const exportUserData = async () => {
    try {
      setIsExporting(true);
      
      // Fetch user profile data
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (userError) throw userError;
      
      // Fetch customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (customerError && customerError.code !== 'PGRST116') throw customerError;
      
      // Fetch order history
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          payments(*)
        `)
        .eq('customer_id', customerData?.id || '')
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Fetch payment history
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (paymentsError) throw paymentsError;
      
      // Create a complete user data object
      const completeUserData = {
        userData: {
          ...userData,
          // Remove sensitive information
          password: undefined,
          reset_token: undefined
        },
        customerData,
        orderHistory: ordersData,
        paymentHistory: paymentsData,
        exportDate: new Date().toISOString(),
        dataVersion: '1.0'
      };
      
      // Convert to JSON and create download
      const dataStr = JSON.stringify(completeUserData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `lush-milk-user-data-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success('Your data has been exported successfully');
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast.error('Failed to export your data. Please try again later.');
    } finally {
      setIsExporting(false);
    }
  };

  // Handle account deletion process
  const handleDeleteAccount = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm account deletion');
      return;
    }
    
    try {
      setIsDeleting(true);
      
      // First anonymize user data in customer table
      const { data: customerData, error: customerFetchError } = await supabase
        .from('customers')
        .select('id')
        .eq('user_id', userId)
        .single();
      
      if (customerFetchError && customerFetchError.code !== 'PGRST116') throw customerFetchError;
      
      if (customerData) {
        // Anonymize customer data
        const { error: customerUpdateError } = await supabase
          .from('customers')
          .update({
            email: `deleted-${Date.now()}@example.com`,
            first_name: 'Deleted',
            last_name: 'User',
            phone: null,
            address: null,
            gdpr_deleted: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerData.id);
        
        if (customerUpdateError) throw customerUpdateError;
      }
      
      // Anonymize user data in users table
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({
          email: `deleted-${Date.now()}@example.com`,
          name: 'Deleted User',
          is_active: false,
          gdpr_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (userUpdateError) throw userUpdateError;
      
      // Sign out the user
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      
      toast.success('Your account has been successfully deleted');
      
      // Redirect to home page after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete your account. Please contact support.');
      setIsDeleting(false);
      setConfirmDelete(false);
      setConfirmText('');
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-blue-100">
            <Download className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Export Your Data</h3>
            <p className="text-sm text-gray-600 mt-1">
              Download a copy of all your personal data, orders, and payment history.
            </p>
            <Button 
              onClick={exportUserData} 
              disabled={isExporting} 
              className="mt-3"
            >
              {isExporting ? 'Exporting...' : 'Export Your Data'}
            </Button>
          </div>
        </div>
        
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            The exported file will contain your personal information, order history, and payment records in JSON format.
          </AlertDescription>
        </Alert>
      </div>
      
      <div className="space-y-4 pt-4 border-t">
        <div className="flex items-start gap-4">
          <div className="p-2 rounded-full bg-red-100">
            <Trash2 className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium">Delete Your Account</h3>
            <p className="text-sm text-gray-600 mt-1">
              Permanently delete your account and all associated data from our systems.
            </p>
            
            <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
              <DialogTrigger asChild>
                <Button 
                  variant="destructive" 
                  className="mt-3"
                >
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete your account 
                    and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Alert className="mb-4 bg-red-50 border-red-200 text-red-800">
                    <AlertDescription>
                      <ul className="list-disc list-inside space-y-1">
                        <li>Your profile information will be anonymized</li>
                        <li>You will lose access to order history</li>
                        <li>You won't be able to recover this account</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-delete" className="text-sm font-medium">
                      Type DELETE to confirm
                    </Label>
                    <Input 
                      id="confirm-delete"
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value)}
                      className="border-red-300"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setConfirmDelete(false)}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || confirmText !== 'DELETE'}
                  >
                    {isDeleting ? 'Deleting...' : 'Permanently Delete Account'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
} 