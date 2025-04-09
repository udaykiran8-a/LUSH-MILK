
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2, Save, User, Mail, Phone, Fingerprint, Shield, Clock } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';

const UserProfile: React.FC = () => {
  const { user, userProfile, loading, updateUserProfile } = useAuth();
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-lushmilk-terracotta" />
      </div>
    );
  }

  if (!user || !userProfile) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">User profile not found. Please sign in again.</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90"
        >
          Retry
        </Button>
      </div>
    );
  }

  const handleUpdateProfile = async () => {
    try {
      setUpdatingProfile(true);
      
      await updateUserProfile({ phone });
      
    } catch (error) {
      console.error('Error in profile update:', error);
      toast.error('An unexpected error occurred', {
        id: 'profile-update-error',
      });
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information Card */}
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
              <Label htmlFor="name" className="flex items-center">
                <User className="h-4 w-4 mr-1 text-lushmilk-terracotta/70" />
                Full Name
              </Label>
              <Input
                id="name"
                value={userProfile.name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                <Mail className="h-4 w-4 mr-1 text-lushmilk-terracotta/70" />
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                value={userProfile.email || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="auth-id" className="flex items-center">
                <Fingerprint className="h-4 w-4 mr-1 text-lushmilk-terracotta/70" />
                Auth ID
              </Label>
              <Input
                id="auth-id"
                value={userProfile.auth_uid || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client-id" className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-lushmilk-terracotta/70" />
                Client ID
              </Label>
              <Input
                id="client-id"
                value={userProfile.client_id || ''}
                disabled
                className="bg-gray-50"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your unique customer identifier
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role" className="flex items-center">
                <Shield className="h-4 w-4 mr-1 text-lushmilk-terracotta/70" />
                Role
              </Label>
              <Input
                id="role"
                value={userProfile.role || ''}
                disabled
                className="bg-gray-50"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center">
                <Phone className="h-4 w-4 mr-1 text-lushmilk-terracotta/70" />
                Phone Number
              </Label>
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter your phone number"
              />
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Account created: {user.created_at ? format(new Date(user.created_at), 'PPP') : 'N/A'}
            </div>
            
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
