
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ShoppingCart, User, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import CartButton from './CartButton';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/hooks/useAuth';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { getItemCount } = useCart();
  const itemCount = getItemCount();
  const { user, signOut, isAuthenticated } = useAuth();

  // Close menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuVariants = {
    hidden: { 
      opacity: 0,
      y: -20,
      transition: {
        staggerChildren: 0.05,
        staggerDirection: -1
      }
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleLogout = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white shadow-md py-2' : 'bg-white py-4'
      }`}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link 
          to="/" 
          className="flex items-center space-x-2"
        >
          <motion.img 
            src="/lovable-uploads/3907e856-b011-4bd0-8422-7cff5037d830.png" 
            alt="LushMilk Logo" 
            className="h-10 w-10"
            whileHover={{ rotate: 10, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400 }}
          />
          <span className="text-xl font-serif font-bold text-lushmilk-brown">
            Lush<span className="text-lushmilk-terracotta">Milk</span>
          </span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About Us</NavLink>
          <NavLink to="/products">Products</NavLink>
          <NavLink to="/contact">Contact</NavLink>
          
          <div className="flex items-center space-x-2">
            <CartButton />
            
            {isAuthenticated ? (
              <Button 
                variant="outline"
                className="border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10"
                asChild
              >
                <Link to="/account">
                  <User size={18} className="mr-1" />
                  Account
                </Link>
              </Button>
            ) : (
              <Button 
                variant="outline"
                className="border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10"
                asChild
              >
                <Link to="/account">
                  <User size={18} className="mr-1" />
                  Log In
                </Link>
              </Button>
            )}
            
            <Button 
              className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
              asChild
            >
              <Link to="/products">
                <ShoppingCart size={18} className="mr-1" />
                Shop Now
              </Link>
            </Button>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center md:hidden space-x-4">
          <CartButton />
          
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-lushmilk-brown focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="md:hidden absolute top-full left-0 right-0 bg-white shadow-lg py-4 px-6 z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
          >
            <div className="flex flex-col space-y-4">
              <MobileNavLink to="/" variants={itemVariants}>Home</MobileNavLink>
              <MobileNavLink to="/about" variants={itemVariants}>About Us</MobileNavLink>
              <MobileNavLink to="/products" variants={itemVariants}>Products</MobileNavLink>
              <MobileNavLink to="/contact" variants={itemVariants}>Contact</MobileNavLink>
              
              <motion.div variants={itemVariants} className="pt-2 space-y-3">
                {isAuthenticated ? (
                  <>
                    <Button 
                      variant="outline"
                      className="w-full border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10"
                      asChild
                    >
                      <Link to="/account" className="flex items-center justify-center">
                        <User size={18} className="mr-2" />
                        Account
                      </Link>
                    </Button>
                    <Button 
                      variant="outline"
                      className="w-full border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10"
                      onClick={handleLogout}
                    >
                      <LogOut size={18} className="mr-2" />
                      Log Out
                    </Button>
                  </>
                ) : (
                  <Button 
                    variant="outline"
                    className="w-full border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10"
                    asChild
                  >
                    <Link to="/account" className="flex items-center justify-center">
                      <User size={18} className="mr-2" />
                      Log In
                    </Link>
                  </Button>
                )}
                
                <Button 
                  className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
                  asChild
                >
                  <Link to="/products" className="flex items-center justify-center">
                    <ShoppingCart size={18} className="mr-2" />
                    Shop Now
                  </Link>
                </Button>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const NavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`relative transition-colors py-1 ${
        isActive 
          ? 'text-lushmilk-terracotta font-medium' 
          : 'text-lushmilk-charcoal hover:text-lushmilk-terracotta'
      }`}
    >
      {children}
      {isActive && (
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-lushmilk-terracotta"
          layoutId="navbar-indicator"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
    </Link>
  );
};

const MobileNavLink = ({ 
  to, 
  children,
  variants 
}: { 
  to: string; 
  children: React.ReactNode;
  variants?: any;
}) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <motion.div variants={variants}>
      <Link 
        to={to} 
        className={`block py-2 px-3 text-lg rounded-md ${
          isActive 
            ? 'bg-lushmilk-cream/30 text-lushmilk-terracotta font-medium' 
            : 'text-lushmilk-charcoal hover:bg-gray-50'
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export default NavBar;
