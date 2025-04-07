
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, User, CreditCard, LogOut, Trash2, ArrowLeft } from 'lucide-react';
import Layout from '../components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import SocialLogin from '@/components/auth/SocialLogin';
import PaymentHistory from '@/components/account/PaymentHistory';
import UserProfile from '@/components/account/UserProfile';

const Account = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirmLoading, setDeleteConfirmLoading] = useState(false);
  const { user, session, signOut, loading: authLoading, isAuthenticated } = useAuth();

  // Check if user is already logged in
  useEffect(() => {
    if (authLoading) return;
    
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session && window.location.pathname === '/account/profile') {
        navigate('/account');
      }
    };
    
    checkSession();
  }, [navigate, authLoading, isAuthenticated]);

  const handleDeleteAccount = async () => {
    try {
      setDeleteConfirmLoading(true);
      
      // Delete the user's account
      const { error } = await supabase.auth.admin.deleteUser(user?.id || '');
      
      if (error) throw error;
      
      toast.success("Your account has been deleted successfully");
      await signOut();
      navigate('/');
    } catch (error) {
      console.error("Error deleting account:", error);
      toast.error("Failed to delete account. Please contact support.");
    } finally {
      setDeleteConfirmLoading(false);
      setDeleteDialogOpen(false);
    }
  };

  if (authLoading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-lushmilk-terracotta" />
        </div>
      </Layout>
    );
  }

  if (isAuthenticated) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-64px)] pt-8 pb-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-lushmilk-cream/5 to-white">
          <div className="max-w-4xl mx-auto">
            <div className="mb-6">
              <Button 
                variant="ghost" 
                className="text-lushmilk-terracotta hover:text-lushmilk-terracotta/80"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Button>
            </div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white p-6 rounded-xl shadow-lg border border-gray-100"
            >
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-lushmilk-brown">My Account</h1>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Account
                  </Button>
                  <Button 
                    variant="outline" 
                    className="text-lushmilk-terracotta border-lushmilk-terracotta/30 hover:bg-lushmilk-terracotta/10"
                    onClick={signOut}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log Out
                  </Button>
                </div>
              </div>
              
              <Tabs defaultValue="profile" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger value="profile" className="flex items-center justify-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger value="payment-history" className="flex items-center justify-center">
                    <CreditCard className="mr-2 h-4 w-4" />
                    Payment History
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="profile">
                  <UserProfile user={user} />
                </TabsContent>
                
                <TabsContent value="payment-history">
                  <PaymentHistory userId={user?.id} />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
          
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="text-red-600">Delete Account</DialogTitle>
                <DialogDescription>
                  Are you sure you want to delete your account? This action cannot be undone
                  and all your data will be permanently removed.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2 sm:justify-end mt-4">
                <Button
                  variant="outline"
                  onClick={() => setDeleteDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={handleDeleteAccount}
                  disabled={deleteConfirmLoading}
                >
                  {deleteConfirmLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Account
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white via-lushmilk-cream/5 to-white">
        <motion.div 
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="text-center">
            <img
              className="mx-auto h-16 w-16"
              src="/lovable-uploads/3907e856-b011-4bd0-8422-7cff5037d830.png"
              alt="LushMilk Logo"
            />
            <h2 className="mt-4 text-3xl font-bold text-lushmilk-brown">
              Welcome to LushMilk
            </h2>
            <p className="mt-2 text-gray-600">
              Sign in to your account or create a new one
            </p>
          </div>
          
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <LoginForm loading={loading} setLoading={setLoading} />
            </TabsContent>
            
            <TabsContent value="register">
              <SignupForm loading={loading} setLoading={setLoading} />
            </TabsContent>
          </Tabs>
          
          <SocialLogin googleLoading={googleLoading} setGoogleLoading={setGoogleLoading} />
        </motion.div>
      </div>
    </Layout>
  );
};

export default Account;
