
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Receipt, Wallet, Loader2, BanknoteIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface PaymentHistoryProps {
  userId?: string;
}

interface PaymentRecord {
  id: string;
  amount: number;
  description: string;
  payment_date: string;
  payment_method: string | null;
  status: string;
  transaction_id: string | null;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);

  useEffect(() => {
    const fetchPaymentHistory = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        
        // Use the generic query instead of the typed one since we have schema issues
        const { data, error } = await supabase
          .from('payment_history')
          .select('*')
          .eq('user_id', userId)
          .order('payment_date', { ascending: false });
        
        if (error) throw error;
        
        // Explicitly cast the data as PaymentRecord[]
        setPayments((data || []) as PaymentRecord[]);
      } catch (error) {
        console.error('Error fetching payment history:', error);
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };
    
    fetchPaymentHistory();
  }, [userId]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Receipt className="mr-2 h-5 w-5 text-lushmilk-terracotta" />
            Payment History
          </CardTitle>
          <CardDescription>
            Your transaction history with LushMilk
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-lushmilk-terracotta" />
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <Wallet className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600">No transactions yet</h3>
              <p className="text-gray-500 mt-1">
                Your payment history will appear here once you make a purchase.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-gray-50">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Description</th>
                    <th className="px-4 py-3">Amount</th>
                    <th className="px-4 py-3">Payment Method</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {payments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-4 py-3">{payment.description}</td>
                      <td className="px-4 py-3 font-medium">
                        <span className="flex items-center">
                          <BanknoteIcon className="mr-1 h-3.5 w-3.5 text-gray-500" />
                          {formatCurrency(payment.amount)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{payment.payment_method || 'N/A'}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;
