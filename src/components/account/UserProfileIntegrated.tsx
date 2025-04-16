import React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { ExportDataButton } from '@/components/security/ExportDataButton';
import { DeleteAccountDialog } from '@/components/security/DeleteAccountDialog';
import { MFASetup } from '@/components/security/MFASetup';
import { OrderDatabase, UserDatabase } from '@/services/DatabaseService';
import { User, UserCircle, ShoppingBag, Shield, LogOut } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

interface UserProfileProps {
  userId: string;
}

interface ProfileData {
  full_name: string;
  phone: string;
  address: string;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product_name: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items?: OrderItem[];
  // Add other order properties as needed
}

/**
 * Integrated UserProfile component that uses the centralized database service
 */
export function UserProfileIntegrated({ userId }: UserProfileProps) {
  const { user, signOut } = useAuth();
  const [profileData, setProfileData] = useState<ProfileData>({
    full_name: '',
    phone: '',
    address: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (userId) {
      fetchProfileData();
      fetchOrderHistory();
    }
  }, [userId]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const response = await UserDatabase.getCustomerData(userId);

      if (response.success && response.data) {
        const customerData = response.data;
        setProfileData({
          full_name: customerData.full_name || '',
          phone: customerData.phone || '',
          address: customerData.address || ''
        });
      }
    } catch (error) {
      console.error('Error in fetchProfileData:', error);
      toast.error('An error occurred while loading your profile');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      if (!userId) return;
      
      const response = await OrderDatabase.getOrderHistory(userId);
      if (response.success) {
        setOrders(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load your order history');
    }
  };

  const handleProfileUpdate = async (e: any) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      
      const profileUpdate = {
        full_name: profileData.full_name,
        address: profileData.address
      };
      
      // Only add phone if it has a value
      if (profileData.phone) {
        profileUpdate['phone'] = profileData.phone;
      }
      
      const response = await UserDatabase.updateCustomer(userId, profileUpdate);

      if (!response.success) {
        throw response.error;
      }

      toast.success('Your profile has been updated');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update your profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('You have been signed out');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    }
  };

  const handleAccountDeleted = () => {
    toast.success('Your account has been deleted. We hope to see you again soon!');
  };

  if (!userId) {
    return (
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>Please sign in to view your profile</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">Your Profile</CardTitle>
          <CardDescription>
            Manage your account settings and preferences
          </CardDescription>
        </CardHeader>
        
        <Tabs defaultValue="profile" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" /> Profile</TabsTrigger>
            <TabsTrigger value="orders"><ShoppingBag className="w-4 h-4 mr-2" /> Orders</TabsTrigger>
            <TabsTrigger value="security"><Shield className="w-4 h-4 mr-2" /> Security</TabsTrigger>
            <TabsTrigger value="account"><UserCircle className="w-4 h-4 mr-2" /> Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <CardContent>
              <form onSubmit={handleProfileUpdate}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" value={user?.email || ''} disabled />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input 
                      id="full_name" 
                      name="full_name"
                      value={profileData.full_name}
                      onChange={handleInputChange}
                      placeholder="Your full name"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone"
                      value={profileData.phone}
                      onChange={handleInputChange}
                      placeholder="Your phone number"
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input 
                      id="address" 
                      name="address"
                      value={profileData.address}
                      onChange={handleInputChange}
                      placeholder="Your delivery address"
                    />
                  </div>
                  
                  <Button type="submit" disabled={isSaving || isLoading}>
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="orders">
            <CardContent>
              <h3 className="text-lg font-medium mb-4">Order History</h3>
              
              {orders.length === 0 ? (
                <p className="text-muted-foreground text-center py-6">
                  You haven't placed any orders yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order: Order) => (
                    <Card key={order.id}>
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">Order #{order.id.substring(0, 8)}</p>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(order.created_at)}
                            </p>
                            <p className="mt-2">
                              <span className={`px-2 py-1 text-xs rounded ${
                                order.status === 'completed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : order.status === 'processing'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {order.status}
                              </span>
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{formatCurrency(order.total_amount)}</p>
                            <p className="text-sm text-muted-foreground">
                              {(order.items?.length || 0)} items
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </TabsContent>
          
          <TabsContent value="security">
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-1">Authentication Security</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Secure your account with additional verification methods
                </p>
                
                <div className="space-y-4">
                  <MFASetup userId={userId} />
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-1">Data Privacy</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your personal data and privacy settings
                </p>
                
                <ExportDataButton />
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-medium mb-1">Connected Devices</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage devices that have accessed your account
                </p>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">Current Device</p>
                        <p className="text-sm text-muted-foreground">
                          Last active: {new Date().toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">Revoke</Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </TabsContent>
          
          <TabsContent value="account">
            <CardContent>
              <h3 className="text-lg font-medium">Account Management</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Manage your account settings and preferences
              </p>
              
              <div className="grid gap-4">
                <div>
                  <Button 
                    onClick={handleSignOut} 
                    variant="outline" 
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
                
                <Separator className="my-2" />
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-destructive">Danger Zone</h4>
                  <DeleteAccountDialog 
                    userEmail={user?.email || ''} 
                    onAccountDeleted={handleAccountDeleted}
                  />
                </div>
              </div>
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
} 