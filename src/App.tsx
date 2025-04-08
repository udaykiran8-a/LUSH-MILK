
import React from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "./contexts/CartContext";

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

// Components
import ClickAnimation from "./components/ClickAnimation";
import CursorSparkle from "./components/CursorSparkle";
import CookieConsent from "./components/CookieConsent";
import { useAuth } from "./hooks/useAuth";

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/account" replace />;
};

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const AppRoutes = () => {
  const { user } = useAuth();
  
  return (
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
        <ProtectedRoute>
          <Cart />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <CartProvider>
        <BrowserRouter>
          <TooltipProvider>
            <ClickAnimation />
            <CursorSparkle />
            <Toaster position="top-right" richColors closeButton />
            <AppRoutes />
            <CookieConsent />
          </TooltipProvider>
        </BrowserRouter>
      </CartProvider>
    </QueryClientProvider>
  );
};

export default App;
