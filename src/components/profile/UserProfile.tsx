import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, User, Shield, History, Database } from 'lucide-react';
import { MFASetup } from '@/components/security/MFASetup';
import { DataManagement } from '@/components/data/DataManagement';
import { getOrderHistory } from '@/services/OrderService';

interface UserData {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  updated_at: string;
}

interface OrderSummary {
  id: string;
  order_number: string;
  total_amount: number;
  status: string;
  created_at: string;
  payments: {
    id: string;
    amount: number;
    status: string;
  }[];
}

export function UserProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadUserData();
      loadOrderHistory();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', user?.id)
        .single();
      
      if (error) throw error;
      
      setUserData(data);
      setName(data.name || '');
      setEmail(data.email || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load profile data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadOrderHistory = async () => {
    if (!user?.id) return;
    
    try {
      setOrdersLoading(true);
      const orders = await getOrderHistory(user.id);
      setOrders(orders);
    } catch (error) {
      console.error('Error loading order history:', error);
      toast.error('Failed to load order history.');
    } finally {
      setOrdersLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user?.id || !userData) return;
    
    try {
      setIsSaving(true);
      
      // Validate email format
      if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
        toast.error('Please enter a valid email address');
        return;
      }
      
      const updates = {
        name,
        email,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Update auth email if changed
      if (email !== userData.email) {
        const { error: authError } = await supabase.auth.updateUser({
          email
        });
        
        if (authError) throw authError;
        
        toast.info('Email verification has been sent to your new email address');
      }
      
      toast.success('Profile updated successfully');
      loadUserData();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl font-semibold mb-2">Not Logged In</h2>
        <p>Please sign in to view your profile.</p>
        <Button className="mt-4" asChild>
          <a href="/login">Sign In</a>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="personal" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Personal Info
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Security
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <History className="h-4 w-4" /> Order History
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Your Data
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal details and how we can reach you
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={userData.avatar_url || ''} alt={name} />
                  <AvatarFallback>{name?.slice(0, 2).toUpperCase() || 'U'}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-gray-500">
                    Profile picture managed through your email provider
                  </p>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                  />
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button 
                  onClick={updateProfile}
                  disabled={isSaving}
                >
                  {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security and authentication methods
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.id && <MFASetup userId={user.id} />}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Order History</CardTitle>
              <CardDescription>
                View your past orders and payment status
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ordersLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">Order #{order.order_number}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
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
                      
                      <div className="mt-3 flex justify-between">
                        <span className="text-sm">
                          Payment: {
                            order.payments?.[0]?.status === 'completed' 
                              ? 'Paid' 
                              : 'Pending'
                          }
                        </span>
                        <span className="font-medium">
                          ${order.total_amount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">You haven't placed any orders yet.</p>
                  <Button className="mt-4" asChild>
                    <a href="/shop">Start Shopping</a>
                  </Button>
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
                Manage your personal data including export and deletion options
              </CardDescription>
            </CardHeader>
            <CardContent>
              {user?.id && <DataManagement userId={user.id} />}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 