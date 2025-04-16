import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Separator } from '@/components/ui/separator';
import { User, Settings, Shield, Download, Trash2, Save, RefreshCw } from 'lucide-react';
import { MFASetup } from '../security/MFASetup';
import { OrderHistory } from './OrderHistory';

interface UserProfileSettingsProps {
  user: {
    id: string;
    email: string;
  };
}

interface Profile {
  full_name: string;
  phone: string;
  default_delivery_address: string;
  marketing_emails: boolean;
  order_notifications: boolean;
}

export function UserProfileSettings({ user }: UserProfileSettingsProps) {
  const [profile, setProfile] = useState<Profile>({
    full_name: '',
    phone: '',
    default_delivery_address: '',
    marketing_emails: false,
    order_notifications: true
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadUserProfile();
    }
  }, [user?.id]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setProfile({
          full_name: data.full_name || '',
          phone: data.phone || '',
          default_delivery_address: data.default_delivery_address || '',
          marketing_emails: data.marketing_emails || false,
          order_notifications: data.order_notifications !== false // default to true
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast.error('Failed to load your profile information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProfile(prev => ({ ...prev, [name]: checked }));
  };

  const saveProfile = async () => {
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('customers')
        .update({
          full_name: profile.full_name,
          phone: profile.phone,
          default_delivery_address: profile.default_delivery_address,
          marketing_emails: profile.marketing_emails,
          order_notifications: profile.order_notifications,
          updated_at: new Date()
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const exportUserData = async () => {
    try {
      setIsExporting(true);
      
      // Fetch user data from various tables
      const [profileData, ordersData, paymentsData] = await Promise.all([
        supabase.from('customers').select('*').eq('user_id', user.id).single(),
        supabase.from('orders').select('*').eq('user_id', user.id),
        supabase.from('payments').select('*').eq('user_id', user.id)
      ]);

      // Combine data
      const userData = {
        profile: profileData.data,
        orders: ordersData.data,
        payments: paymentsData.data,
        exportDate: new Date().toISOString()
      };

      // Create and download file
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `lush-milk-user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success('Your data has been exported successfully');
    } catch (error) {
      console.error('Error exporting user data:', error);
      toast.error('Failed to export your data');
    } finally {
      setIsExporting(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      setIsLoading(true);
      
      // First anonymize customer data
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          full_name: '[DELETED]',
          phone: '',
          default_delivery_address: '',
          email: `deleted-${user.id}@example.com`,
          marketing_emails: false,
          order_notifications: false,
          deleted_at: new Date()
        })
        .eq('user_id', user.id);

      if (customerError) throw customerError;

      // Then delete the user account
      const { error: userError } = await supabase.auth.admin.deleteUser(user.id);
      
      if (userError) throw userError;

      // Show success message
      toast.success('Your account has been successfully deleted');
      
      // Redirect to home page after short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Failed to delete your account. Please contact support.');
    } finally {
      setIsLoading(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue="profile" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="profile" className="flex items-center gap-2">
          <User className="h-4 w-4" />
          <span>Profile</span>
        </TabsTrigger>
        <TabsTrigger value="orders" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          <span>Order History</span>
        </TabsTrigger>
        <TabsTrigger value="security" className="flex items-center gap-2">
          <Shield className="h-4 w-4" />
          <span>Security & Privacy</span>
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Manage your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input
                    id="full_name"
                    name="full_name"
                    value={profile.full_name}
                    onChange={handleInputChange}
                    placeholder="Your full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email (cannot be changed)</Label>
                  <Input
                    id="email"
                    value={user.email}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={profile.phone}
                    onChange={handleInputChange}
                    placeholder="Your phone number"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="default_delivery_address">Default Delivery Address</Label>
                <Input
                  id="default_delivery_address"
                  name="default_delivery_address"
                  value={profile.default_delivery_address}
                  onChange={handleInputChange}
                  placeholder="Enter your default delivery address"
                />
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Communication Preferences</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="marketing_emails" className="text-sm font-medium">
                    Marketing Emails
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive emails about new products and promotions
                  </p>
                </div>
                <Switch
                  id="marketing_emails"
                  checked={profile.marketing_emails}
                  onCheckedChange={(checked) => handleSwitchChange('marketing_emails', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="order_notifications" className="text-sm font-medium">
                    Order Notifications
                  </Label>
                  <p className="text-xs text-gray-500">
                    Receive notifications about your orders and deliveries
                  </p>
                </div>
                <Switch
                  id="order_notifications"
                  checked={profile.order_notifications}
                  onCheckedChange={(checked) => handleSwitchChange('order_notifications', checked)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              type="button" 
              onClick={loadUserProfile} 
              disabled={isLoading || isSaving}
            >
              Reset
            </Button>
            <Button 
              type="button" 
              onClick={saveProfile} 
              disabled={isLoading || isSaving}
            >
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </TabsContent>
      
      <TabsContent value="orders" className="mt-6">
        <OrderHistory userId={user.id} />
      </TabsContent>
      
      <TabsContent value="security" className="mt-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>
              Manage your account security and authentication methods
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MFASetup userId={user.id} />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Privacy</CardTitle>
            <CardDescription>
              Manage your personal data and privacy settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Data Export</h3>
              <p className="text-xs text-gray-500">
                Download a copy of all the data we have stored about you
              </p>
              <Button 
                variant="outline" 
                className="mt-2" 
                onClick={exportUserData}
                disabled={isExporting}
              >
                {isExporting ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Export Your Data
                  </>
                )}
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-1">
              <h3 className="text-sm font-medium">Delete Account</h3>
              <p className="text-xs text-gray-500">
                Permanently delete your account and all associated data
              </p>
              <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="mt-2">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      account and remove all your data from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction 
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={handleAccountDeletion}
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
} 