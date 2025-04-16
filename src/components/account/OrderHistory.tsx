import { useState, useEffect } from 'react';
import { trackPerformanceAsync } from '@/lib/monitoring';
import { toast } from 'sonner';
import Link from 'next/link';

interface OrderHistoryProps {
  supabase: any;
  userId: string;
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  order_items?: OrderItem[];
  payment?: Payment;
}

interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name: string;
}

interface Payment {
  id: string;
  status: string;
  amount: number;
  payment_method: string;
}

export default function OrderHistory({ supabase, userId }: OrderHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchOrderHistory();
    }
  }, [userId]);

  const fetchOrderHistory = async () => {
    try {
      setLoading(true);
      const { data, error } = await trackPerformanceAsync(
        'order',
        'fetchOrderHistory',
        async () => await supabase
          .from('orders')
          .select(`
            *,
            order_items (
              id,
              product_id,
              quantity,
              price,
              product:products (name)
            ),
            payments (
              id,
              status,
              amount,
              payment_method
            )
          `)
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
      );

      if (error) throw error;
      
      // Process data to have a flattened structure
      const processedOrders = data.map((order: any) => {
        return {
          ...order,
          order_items: order.order_items.map((item: any) => ({
            ...item,
            product_name: item.product?.name || 'Unknown Product'
          })),
          payment: order.payments && order.payments.length > 0 ? order.payments[0] : null
        };
      });
      
      setOrders(processedOrders);
    } catch (error) {
      console.error('Error fetching order history:', error);
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const toggleOrderDetails = (orderId: string) => {
    if (expandedOrder === orderId) {
      setExpandedOrder(null);
    } else {
      setExpandedOrder(orderId);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusClass = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Order History</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
            <Link href="/products" className="text-primary hover:underline">
              Browse our products
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="border rounded-lg overflow-hidden">
                <div 
                  className="bg-gray-50 p-4 flex flex-wrap justify-between items-center cursor-pointer"
                  onClick={() => toggleOrderDetails(order.id)}
                >
                  <div>
                    <span className="text-sm text-gray-500">Order ID: {order.id.slice(-8)}</span>
                    <h3 className="font-medium">{formatDate(order.created_at)}</h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusClass(order.status)}`}>
                      {order.status}
                    </span>
                    <span className="font-bold">{formatCurrency(order.total_amount)}</span>
                    <button 
                      className="text-primary hover:underline text-sm ml-2"
                      aria-expanded={expandedOrder === order.id}
                    >
                      {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
                    </button>
                  </div>
                </div>
                
                {expandedOrder === order.id && (
                  <div className="p-4 border-t">
                    <div className="mb-4">
                      <h4 className="font-medium mb-2">Order Items</h4>
                      <table className="min-w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                            <th className="py-2 px-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subtotal</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {order.order_items?.map((item) => (
                            <tr key={item.id}>
                              <td className="py-2 px-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.product_name}</td>
                              <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                              <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.price)}</td>
                              <td className="py-2 px-3 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.price * item.quantity)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <td colSpan={3} className="py-2 px-3 text-right font-medium">Total:</td>
                            <td className="py-2 px-3 font-bold">{formatCurrency(order.total_amount)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                    
                    {order.payment && (
                      <div>
                        <h4 className="font-medium mb-2">Payment Information</h4>
                        <div className="bg-gray-50 p-3 rounded">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <span className="text-xs text-gray-500">Payment Method</span>
                              <p>{order.payment.payment_method}</p>
                            </div>
                            <div>
                              <span className="text-xs text-gray-500">Payment Status</span>
                              <p className={`${getStatusClass(order.payment.status)} inline-block px-2 py-1 rounded-full text-xs mt-1`}>
                                {order.payment.status}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    <div className="mt-4 flex justify-end">
                      <Link 
                        href={`/account/orders/${order.id}`}
                        className="text-sm bg-primary text-white py-1 px-3 rounded hover:bg-primary-dark transition"
                      >
                        View Full Details
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 