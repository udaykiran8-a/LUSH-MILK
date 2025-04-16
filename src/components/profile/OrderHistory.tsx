import { useState, useEffect } from 'react';
import { getOrderHistory } from '@/services/OrderService';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { ClipboardList, PackageCheck, Calendar, Download, RefreshCw } from 'lucide-react';

interface OrderHistoryProps {
  userId: string;
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: string;
  delivery_address: string;
  items: any[];
  payment_status: string;
}

export function OrderHistory({ userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrderHistory();
  }, [userId]);

  const loadOrderHistory = async () => {
    try {
      setIsLoading(true);
      const orderHistory = await getOrderHistory(userId);
      setOrders(orderHistory);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load order history');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'refunded':
        return 'bg-purple-100 text-purple-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleDownloadInvoice = (orderId: string) => {
    // This would typically generate and download an invoice PDF
    toast.info(`Downloading invoice for order #${orderId.slice(0, 8)}...`);
    setTimeout(() => {
      toast.success('Invoice downloaded successfully');
    }, 1500);
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-medium">Order History</h3>
            <p className="text-sm text-gray-500">
              View your past orders and their status
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={loadOrderHistory}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {orders.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-12 flex flex-col items-center justify-center text-center">
            <PackageCheck className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-1">No orders yet</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-4">
              You haven't placed any orders yet. Start shopping to see your orders here.
            </p>
            <Button variant="default" asChild>
              <a href="/products">Browse Products</a>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {selectedOrder ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Order Details</CardTitle>
                    <CardDescription>
                      Order #{selectedOrder.id.slice(0, 8)} • {formatDate(selectedOrder.created_at)}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" onClick={() => setSelectedOrder(null)}>
                    Back to Orders
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-wrap gap-4 md:gap-6">
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <PackageCheck className="h-4 w-4" /> Order Status
                    </h4>
                    <Badge className={getStatusColor(selectedOrder.status)}>
                      {selectedOrder.status}
                    </Badge>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Calendar className="h-4 w-4" /> Order Date
                    </h4>
                    <p className="text-sm">{formatDate(selectedOrder.created_at)}</p>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <h4 className="text-sm font-medium mb-2">Payment Status</h4>
                    <Badge className={getPaymentStatusColor(selectedOrder.payment_status)}>
                      {selectedOrder.payment_status}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Delivery Address</h4>
                  <p className="text-sm bg-gray-50 p-3 rounded">
                    {selectedOrder.delivery_address || 'No address provided'}
                  </p>
                </div>

                <div>
                  <h4 className="text-sm font-medium mb-2">Order Items</h4>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(selectedOrder.items || []).map((item, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-xs text-gray-500">{item.product_description}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{item.quantity}</TableCell>
                          <TableCell className="text-right">{formatCurrency(item.unit_price)}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(item.unit_price * item.quantity)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between">
                    <span className="font-medium">Total Amount</span>
                    <span className="font-bold">{formatCurrency(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="justify-between">
                <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                  Back to Orders
                </Button>
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2"
                  onClick={() => handleDownloadInvoice(selectedOrder.id)}
                >
                  <Download className="h-4 w-4" />
                  Download Invoice
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Table>
              <TableCaption>A list of your recent orders.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.slice(0, 8)}</TableCell>
                    <TableCell>{formatDate(order.created_at)}</TableCell>
                    <TableCell>{formatCurrency(order.total_amount)}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPaymentStatusColor(order.payment_status)}>
                        {order.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => viewOrderDetails(order)}
                        >
                          View
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDownloadInvoice(order.id)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </div>
  );
} 