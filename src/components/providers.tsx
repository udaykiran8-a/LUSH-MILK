import React from 'react';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/contexts/CartContext";
import ErrorBoundary from "@/components/ErrorBoundary";

// Create a client with better error handling
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
  },
});

export interface ProvidersProps {
  children: React.ReactNode;
}

/**
 * App providers wrapper component that ensures all providers have proper children
 */
export function Providers({ children }: ProvidersProps) {
  return (
    <ErrorBoundary children={
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <CartProvider>
            <TooltipProvider>
              {children}
            </TooltipProvider>
          </CartProvider>
        </BrowserRouter>
      </QueryClientProvider>
    } />
  );
} 