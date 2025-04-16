import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Trash2 } from 'lucide-react';

export interface DataExportProps {
  userId: string;
}

export function DataExport({ userId }: DataExportProps) {
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletionReason, setDeletionReason] = useState('');

  const handleExportData = async () => {
    try {
      setLoading(true);
      
      // Fetch user profile data
      const { data: profileData, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (profileError) throw profileError;
      
      // Fetch customer data
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (customerError && customerError.code !== 'PGRST116') throw customerError;
      
      // Fetch order history
      const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select(`
          *,
          payments(*)
        `)
        .eq('customer_id', customerData?.id || '');
      
      if (orderError) throw orderError;
      
      // Compile all data into one object
      const exportData = {
        profile: profileData,
        customer: customerData,
        orders: orderData,
        exportDate: new Date().toISOString(),
      };
      
      // Convert to JSON and create a downloadable file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      // Create and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `lush-milk-data-export-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Your data has been exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Failed to export your data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const requestAccountDeletion = async () => {
    if (!window.confirm('Are you sure you want to permanently delete your account? This action cannot be undone.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Instead of directly deleting, create a deletion request that can be reviewed
      const { error } = await supabase
        .from('deletion_requests')
        .insert({
          user_id: userId,
          reason: deletionReason || 'No reason provided',
          status: 'pending',
          requested_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      // Mark the user account as pending deletion in users table if it exists
      const { error: userUpdateError } = await supabase
        .from('users')
        .update({ deletion_requested: true })
        .eq('id', userId);
      
      if (userUpdateError) throw userUpdateError;
      
      // Sign out the user
      await supabase.auth.signOut();
      
      toast.success('Your account deletion request has been submitted. You will be signed out now.');
      
      // Redirect to homepage after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (error) {
      console.error('Error requesting account deletion:', error);
      toast.error('Failed to submit deletion request. Please contact support.');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="bg-white p-6 border rounded-md">
      <h3 className="text-lg font-medium">Your Data</h3>
      <p className="text-sm text-gray-600 mt-1">
        Export your personal data or request account deletion in compliance with data protection regulations.
      </p>
      
      <div className="mt-6 space-y-6">
        <div>
          <h4 className="font-medium flex items-center">
            <Download className="h-4 w-4 mr-2" />
            Export Your Data
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Download a copy of your personal data including your profile, order history, and preferences.
          </p>
          <button
            onClick={handleExportData}
            className="mt-3 bg-blue-50 text-blue-700 px-4 py-2 rounded hover:bg-blue-100 transition"
            disabled={loading}
          >
            {loading ? 'Preparing data...' : 'Export data (.json)'}
          </button>
        </div>
        
        <div className="pt-4 border-t">
          <h4 className="font-medium flex items-center text-red-600">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Your Account
          </h4>
          <p className="text-sm text-gray-600 mt-1">
            Request permanent deletion of your account and all associated data. This action cannot be undone.
          </p>
          
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="mt-3 bg-red-50 text-red-700 px-4 py-2 rounded hover:bg-red-100 transition"
            >
              Request Account Deletion
            </button>
          ) : (
            <div className="mt-3 bg-red-50 p-4 rounded-md">
              <p className="text-sm font-medium text-red-800">
                Please confirm that you want to delete your account
              </p>
              <div className="mt-3">
                <label htmlFor="deletionReason" className="block text-sm text-gray-700">
                  Reason for leaving (optional)
                </label>
                <textarea
                  id="deletionReason"
                  rows={3}
                  className="mt-1 w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                  placeholder="Help us improve by sharing why you're leaving..."
                  value={deletionReason}
                  onChange={(e) => setDeletionReason(e.target.value)}
                />
              </div>
              <div className="mt-4 flex space-x-3">
                <button
                  onClick={requestAccountDeletion}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                  disabled={loading}
                >
                  {loading ? 'Processing...' : 'Confirm Deletion'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300 transition"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 