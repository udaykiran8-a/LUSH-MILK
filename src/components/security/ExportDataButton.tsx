import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Download, RefreshCw } from 'lucide-react';

export function ExportDataButton() {
  const [isExporting, setIsExporting] = useState(false);

  const exportUserData = async () => {
    try {
      setIsExporting(true);
      toast.info('Preparing your data export...');

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in to export your data');
        return;
      }

      // Fetch user profile
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
      }

      // Fetch customer data
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (customerError) {
        console.error('Error fetching customer data:', customerError);
      }

      // Fetch order history
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          payments(*)
        `)
        .eq('user_id', user.id);

      if (ordersError) {
        console.error('Error fetching order history:', ordersError);
      }

      // Fetch payment history
      const { data: paymentHistory, error: paymentHistoryError } = await supabase
        .from('payment_history')
        .select('*')
        .eq('user_id', user.id);

      if (paymentHistoryError) {
        console.error('Error fetching payment history:', paymentHistoryError);
      }

      // Compile all data
      const userData = {
        profile: {
          email: user.email,
          ...profile
        },
        customer,
        orders,
        paymentHistory
      };

      // Convert to JSON and create download
      const dataStr = JSON.stringify(userData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create a link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `lush-milk-data-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Your data has been exported');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export your data. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={exportUserData}
      disabled={isExporting}
      className="w-full"
    >
      {isExporting ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <Download className="mr-2 h-4 w-4" />
          Export My Data
        </>
      )}
    </Button>
  );
} 