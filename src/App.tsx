import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { initErrorMonitoring } from "./utils/errorMonitoring";
import { useAuth } from "./hooks/useAuth";
import LoadingSpinner from "./components/LoadingSpinner";
import { initializeAutomatedEmails } from '@/services/AutomatedEmailService';
import { Providers } from './components/providers';
import ErrorBoundary from "./components/ErrorBoundary";

// Pages
import Index from "./pages/Index";
import About from "./pages/About";
import Products from "./pages/Products";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import Catalog from "./pages/Catalog";
import Terms from "./pages/Terms";
import RefundPolicy from "./pages/RefundPolicy";
import MilkTypes from "./pages/MilkTypes";
import Blog from "./pages/Blog";
import SubscriptionManagement from "./pages/SubscriptionManagement";

// Lazy loaded pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));

// Components
import ClickAnimation from "./components/ClickAnimation";
import CookieConsent from "./components/CookieConsent";
import CursorSparkle from "./components/CursorSparkle";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/account" replace />;
};

// Admin-only route
const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading, userProfile } = useAuth();
  
  if (loading) {
    return <LoadingSpinner />;
  }
  
  const isAdmin = isAuthenticated && userProfile?.role === 'admin';
  
  return isAdmin ? <>{children}</> : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  const { user } = useAuth();
  
  // Initialize error monitoring with user ID when available
  useEffect(() => {
    initErrorMonitoring(user?.id);
  }, [user]);
  
  // Initialize automated email system
  useEffect(() => {
    // Set up and return cleanup function
    const cleanup = initializeAutomatedEmails();
    
    return () => {
      // Clean up event listeners and timers on unmount
      cleanup();
    };
  }, []);
  
  const routesContent = (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/about" element={<About />} />
      <Route path="/products" element={<Products />} />
      <Route path="/catalog" element={<Catalog />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/account" element={<Account />} />
      <Route path="/account/*" element={<Account />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/milk-types" element={<MilkTypes />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:id" element={<Blog />} />
      <Route path="/cart" element={
        <ProtectedRoute children={<Cart />} />
      } />
      <Route path="/subscriptions" element={
        <ProtectedRoute children={<SubscriptionManagement />} />
      } />
      <Route path="/admin" element={
        <AdminRoute children={
          <Suspense fallback={<LoadingSpinner />} children={<AdminDashboard />} />
        } />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
  
  return <ErrorBoundary children={routesContent} />;
};

const App = () => {
  return (
    <Providers children={
      <Suspense fallback={<LoadingSpinner />} children={
        <>
          <CursorSparkle />
          <ClickAnimation />
          <Toaster position="top-right" richColors closeButton />
          <AppRoutes />
          <CookieConsent />
        </>
      } />
    } />
  );
};

export default App;
