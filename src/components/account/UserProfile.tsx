import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { trackPerformanceAsync } from '@/lib/monitoring';
import MFASetup from '@/components/MFASetup';
import { toast } from 'sonner';
import Link from 'next/link';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { User, Mail, ShieldCheck, Database, ShoppingBag } from 'lucide-react';
import DataExport from './DataExport';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { OrderService } from '@/services/OrderService';

interface UserProfileProps {
  userId: string;
}

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  phone_number: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface OrderHistoryItem {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  payment_status: string;
  order_items?: {
    product_id: string;
    quantity: number;
    price: number;
    name: string;
  }[];
}

export default function UserProfile({ userId }: UserProfileProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    delivery_address: '',
  });
  const [orderHistory, setOrderHistory] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Get user data from Supabase Auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }
        
        // Get additional profile data from customers table
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('user_id', userId)
          .single();
          
        if (customerError) {
          console.error('Error fetching customer data:', customerError);
        }
        
        // Get user from users table
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userId)
          .single();
          
        if (userError) {
          console.error('Error fetching user data:', userError);
        }
        
        const combined = {
          id: user.id,
          email: user.email,
          full_name: userData?.full_name || '',
          phone: customerData?.phone || '',
          delivery_address: customerData?.delivery_address || '',
          created_at: user.created_at,
          last_sign_in_at: user.last_sign_in_at,
        };
        
        setProfileData(combined);
        setFormData({
          full_name: combined.full_name,
          email: combined.email || '',
          phone: combined.phone || '',
          delivery_address: combined.delivery_address || '',
        });

        // Fetch order history
        fetchOrderHistory();
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Failed to load profile data');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  const saveProfileChanges = async () => {
    try {
      toast.loading('Saving profile changes...');
      
      // Update user data in users table
      const { error: userError } = await supabase
        .from('users')
        .update({
          full_name: formData.full_name,
        })
        .eq('id', userId);
        
      if (userError) throw userError;
      
      // Update customer data
      const { error: customerError } = await supabase
        .from('customers')
        .update({
          phone: formData.phone,
          delivery_address: formData.delivery_address,
        })
        .eq('user_id', userId);
        
      if (customerError) throw customerError;
      
      // Update email if changed
      if (formData.email !== profileData?.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: formData.email,
        });
        
        if (emailError) throw emailError;
        toast.success('Verification email sent to your new email address');
      }
      
      setProfileData({
        ...profileData,
        ...formData,
      });
      
      setIsEditing(false);
      toast.dismiss();
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.dismiss();
      toast.error('Failed to update profile');
    }
  };
  
  const cancelEditing = () => {
    setFormData({
      full_name: profileData?.full_name || '',
      email: profileData?.email || '',
      phone: profileData?.phone || '',
      delivery_address: profileData?.delivery_address || '',
    });
    setIsEditing(false);
  };
  
  const fetchOrderHistory = async () => {
    try {
      const orders = await OrderService.getOrderHistory(userId);
      setOrderHistory(orders);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load your order history');
    }
  };
  
  if (isLoading) {
    return (
      <div className="w-full p-6 flex justify-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded w-full mb-6"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h2 className="text-2xl font-bold mb-6">Your Account</h2>
      
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" /> Orders
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Your Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Manage your profile details and contact information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="text-gray-500">Name:</div>
                    <div className="font-medium">{profileData?.full_name || 'Not provided'}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="text-gray-500">Email:</div>
                    <div className="font-medium flex items-center">
                      {profileData?.email}
                      <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Verified</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="text-gray-500">Phone:</div>
                    <div className="font-medium">{profileData?.phone || 'Not provided'}</div>
                  </div>
                  <div className="grid grid-cols-[100px_1fr] gap-2">
                    <div className="text-gray-500">Joined:</div>
                    <div className="font-medium">{profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString() : '-'}</div>
                  </div>
                  
                  <Button 
                    onClick={() => setIsEditing(true)} 
                    className="mt-6"
                  >
                    Edit Profile
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={profileData?.email || ''}
                      disabled
                      className="mt-1 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  
                  <div className="flex gap-3 mt-6">
                    <Button 
                      onClick={saveProfileChanges} 
                      className="mt-6"
                    >
                      Save Changes
                    </Button>
                    <Button 
                      onClick={cancelEditing} 
                      variant="outline"
                      className="mt-6"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Account Security</CardTitle>
              <CardDescription>
                Manage your account security settings and two-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MFASetup userId={userId} />
              
              <div className="mt-8 pt-6 border-t">
                <h3 className="text-lg font-medium">Password</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Change your password to keep your account secure
                </p>
                <Button 
                  onClick={() => toast.info('Password reset email sent to your email address')} 
                  variant="outline"
                  className="mt-3"
                >
                  Reset Password
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View and track your past orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {orderHistory.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-300" />
                  <p className="mt-4">You haven't placed any orders yet</p>
                  <Button variant="outline" className="mt-4" onClick={() => window.location.href = '/shop'}>
                    Browse Products
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {orderHistory.map((order) => (
                    <div key={order.id} className="border rounded-md p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">Order #{order.id.slice(0, 8)}</div>
                          <div className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(order.total_amount)}</div>
                          <div className="text-sm">
                            <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                              order.status === 'completed' 
                                ? 'bg-green-100 text-green-800' 
                                : order.status === 'processing' 
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="text-sm font-medium mb-2">Items</div>
                          {order.order_items.map((item, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <div>{item.quantity}x {item.name}</div>
                              <div>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(item.price * item.quantity)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      <div className="mt-4 pt-4 border-t flex justify-between">
                        <div className="text-sm text-gray-500">
                          Payment Status: <span className={`font-medium ${
                            order.payment_status === 'paid' 
                              ? 'text-green-600' 
                              : order.payment_status === 'pending' 
                              ? 'text-yellow-600'
                              : 'text-red-600'
                          }`}>
                            {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                          </span>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Your Data</CardTitle>
              <CardDescription>
                Manage your personal data and account preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DataExport supabase={supabase} userId={userId} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
