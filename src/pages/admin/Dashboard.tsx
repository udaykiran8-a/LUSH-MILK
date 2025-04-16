import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Search, RefreshCw, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

// Define types for data
interface Order {
  id: string;
  customer_id: string;
  status: string;
  created_at: string;
  milk_type: string;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
  payment?: {
    amount: number;
    status: string;
  };
}

interface Subscription {
  id: string;
  customer_id: string;
  milk_type: string;
  quantity_liters: number;
  status: string;
  start_date: string;
  end_date: string | null;
  customer?: {
    name: string;
    email: string;
    phone: string;
  };
}

const AdminDashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    totalSubscriptions: 0,
    activeSubscriptions: 0,
    revenue: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!user) return;
    
    // Check if user is admin
    if (userProfile?.role === 'admin') {
      setIsAdmin(true);
      fetchData();
    } else {
      setIsAdmin(false);
      setLoading(false);
      toast.error('Unauthorized access');
    }
  }, [user, userProfile]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      // Fetch orders with customer details and payment info
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          customer:customers(
            name,
            email,
            phone
          ),
          payment:payments(
            amount,
            status
          )
        `)
        .order('created_at', { ascending: false });
      
      if (ordersError) throw ordersError;
      
      // Fetch subscriptions with customer details
      const { data: subscriptionsData, error: subsError } = await supabase
        .from('subscriptions')
        .select(`
          *,
          customer:customers(
            name,
            email,
            phone
          )
        `)
        .order('created_at', { ascending: false });
      
      if (subsError) throw subsError;
      
      // Calculate stats
      const pendingOrders = ordersData.filter(o => o.status === 'pending').length;
      const activeSubscriptions = subscriptionsData.filter(s => s.status === 'active').length;
      const totalRevenue = ordersData.reduce((sum, order) => {
        return sum + (order.payment?.[0]?.amount || 0);
      }, 0);
      
      setOrders(ordersData as Order[]);
      setSubscriptions(subscriptionsData as Subscription[]);
      setStats({
        totalOrders: ordersData.length,
        pendingOrders,
        totalSubscriptions: subscriptionsData.length,
        activeSubscriptions,
        revenue: totalRevenue,
      });
    } catch (error) {
      console.error('Error fetching admin data:', error);
      toast.error('Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, table: 'orders' | 'subscriptions', newStatus: string) => {
    try {
      const { error } = await supabase
        .from(table)
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Status updated to ${newStatus}`);
      fetchData(); // Refresh data
    } catch (error) {
      console.error(`Error updating ${table} status:`, error);
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      failed: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800',
      paused: 'bg-purple-100 text-purple-800',
    };
    
    const style = styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800';
    
    return <Badge className={style}>{status}</Badge>;
  };

  const filteredOrders = orders.filter(order => 
    order.id.includes(searchTerm) ||
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.milk_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubscriptions = subscriptions.filter(subscription => 
    subscription.id.includes(searchTerm) ||
    subscription.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subscription.milk_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isAdmin) {
    return (
      <div className="container max-w-7xl mx-auto py-10 px-4">
        <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You need admin privileges to view this page.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>
      
      <Tabs
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-6"
      >
        <TabsList className="w-full max-w-md">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Total Orders</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalOrders}</div>
                <p className="text-sm text-gray-500">
                  {stats.pendingOrders} pending
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Subscriptions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalSubscriptions}</div>
                <p className="text-sm text-gray-500">
                  {stats.activeSubscriptions} active
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-500">Revenue</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">₹{stats.revenue.toFixed(2)}</div>
                <p className="text-sm text-gray-500">
                  All time
                </p>
              </CardContent>
            </Card>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest 5 orders</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orders.slice(0, 5).map(order => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                        <TableCell>{order.customer?.name || 'Unknown'}</TableCell>
                        <TableCell>{getStatusBadge(order.status)}</TableCell>
                        <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                      </TableRow>
                    ))}
                    {orders.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No orders found</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" onClick={() => setActiveTab('orders')}>View All</Button>
              </CardFooter>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>Latest 5 active subscriptions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions
                      .filter(sub => sub.status === 'active')
                      .slice(0, 5)
                      .map(subscription => (
                        <TableRow key={subscription.id}>
                          <TableCell className="font-medium">{subscription.customer?.name || 'Unknown'}</TableCell>
                          <TableCell>{subscription.milk_type}</TableCell>
                          <TableCell>{subscription.quantity_liters}L</TableCell>
                          <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                        </TableRow>
                      ))}
                    {subscriptions.filter(sub => sub.status === 'active').length === 0 && (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-4">No active subscriptions</TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="justify-end">
                <Button variant="ghost" onClick={() => setActiveTab('subscriptions')}>View All</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Order Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search orders..."
                    className="pl-10 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Milk Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrders.map(order => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id.substring(0, 8)}...</TableCell>
                      <TableCell>
                        <div>{order.customer?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{order.customer?.email}</div>
                      </TableCell>
                      <TableCell>{order.milk_type}</TableCell>
                      <TableCell>₹{order.payment?.[0]?.amount.toFixed(2) || '0.00'}</TableCell>
                      <TableCell>{getStatusBadge(order.status)}</TableCell>
                      <TableCell>{format(new Date(order.created_at), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(order.id, 'orders', 'confirmed')}
                            >
                              Mark as Confirmed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(order.id, 'orders', 'completed')}
                            >
                              Mark as Completed
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(order.id, 'orders', 'cancelled')}
                            >
                              Cancel Order
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        {loading ? 'Loading orders...' : 'No orders found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="subscriptions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Subscription Management</CardTitle>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search subscriptions..."
                    className="pl-10 w-[250px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Milk Type</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Start Date</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubscriptions.map(subscription => (
                    <TableRow key={subscription.id}>
                      <TableCell>
                        <div>{subscription.customer?.name || 'Unknown'}</div>
                        <div className="text-xs text-gray-500">{subscription.customer?.email}</div>
                      </TableCell>
                      <TableCell>{subscription.milk_type}</TableCell>
                      <TableCell>{subscription.quantity_liters}L</TableCell>
                      <TableCell>{format(new Date(subscription.start_date), 'MMM d, yyyy')}</TableCell>
                      <TableCell>
                        {subscription.end_date 
                          ? format(new Date(subscription.end_date), 'MMM d, yyyy')
                          : 'No end date'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(subscription.status)}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {subscription.status !== 'active' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(subscription.id, 'subscriptions', 'active')}
                              >
                                Activate
                              </DropdownMenuItem>
                            )}
                            {subscription.status === 'active' && (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(subscription.id, 'subscriptions', 'paused')}
                              >
                                Pause
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleStatusChange(subscription.id, 'subscriptions', 'cancelled')}
                            >
                              Cancel Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredSubscriptions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6">
                        {loading ? 'Loading subscriptions...' : 'No subscriptions found'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard; 