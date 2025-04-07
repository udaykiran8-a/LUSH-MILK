
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Cookie } from 'lucide-react';
import { Link } from 'react-router-dom';

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem('cookieConsent');
    
    if (!hasConsented) {
      // Show the cookie consent banner after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  const acceptAll = () => {
    localStorage.setItem('cookieConsent', 'all');
    setIsVisible(false);
  };
  
  const acceptEssential = () => {
    localStorage.setItem('cookieConsent', 'essential');
    setIsVisible(false);
  };
  
  if (!isVisible) return null;
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-0 left-0 right-0 z-50 bg-white shadow-lg border-t border-gray-200"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="container mx-auto p-4 md:p-6">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="flex items-center text-lushmilk-terracotta">
                <Cookie size={28} className="mr-3" />
                <h3 className="text-lg font-semibold">Cookie Consent</h3>
              </div>
              
              <div className="flex-1">
                <p className="text-lushmilk-charcoal/80 text-sm md:text-base">
                  We use cookies to enhance your browsing experience, provide personalized content, 
                  and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                  You can manage your preferences by clicking "Customize" or visit our {' '}
                  <Link to="/terms" className="text-lushmilk-terracotta hover:underline">
                    Terms and Conditions
                  </Link> to learn more.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10"
                  onClick={acceptEssential}
                >
                  Essential Only
                </Button>
                <Button 
                  size="sm"
                  className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
                  onClick={acceptAll}
                >
                  Accept All
                </Button>
              </div>
              
              <button 
                className="absolute top-2 right-2 md:relative md:top-auto md:right-auto text-gray-500 hover:text-gray-700"
                onClick={() => setIsVisible(false)}
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CookieConsent;
