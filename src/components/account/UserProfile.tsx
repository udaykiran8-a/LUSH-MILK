
import React, { useState, useEffect } from 'react';
import { User as AuthUser } from '@supabase/supabase-js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, User } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserProfileProps {
  user: AuthUser | null;
}

interface UserData {
  name: string;
  email: string;
  phone: string | null;
  client_id: string | null;
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Use a raw query to get user data
        const { data, error } = await supabase
          .from('users')
          .select('name, email, phone, client_id, auth_uid')
          .eq('auth_uid', user.id)
          .single();
        
        if (error) {
          console.error('Error fetching user data:', error);
          toast.error('Failed to load user profile');
          return;
        }
        
        // Now we safely type the data
        const typedData = data as unknown as UserData;
        setUserData(typedData);
        setPhone(typedData.phone || '');
      } catch (error) {
        console.error('Error in user data fetch:', error);
        toast.error('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (!user || !userData) return;
    
    try {
      setUpdatingProfile(true);
      
      // Update the user's phone number
      const { error } = await supabase
        .from('users')
        .update({ phone })
        .eq('auth_uid', user.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully');
      setUserData({ ...userData, phone });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setUpdatingProfile(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-lushmilk-terracotta" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 h-5 w-5 text-lushmilk-terracotta" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your personal account details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={userData?.name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={userData?.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-id">Client ID</Label>
              <Input
                id="client-id"
                value={userData?.client_id || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your unique customer identifier
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button 
              onClick={handleUpdateProfile} 
              disabled={updatingProfile}
              className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90"
            >
              {updatingProfile ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfile;
