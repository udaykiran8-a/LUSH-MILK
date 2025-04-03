
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white/80 backdrop-blur-md py-4 px-6 fixed w-full z-50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="flex items-center space-x-2">
          <img 
            src="/lovable-uploads/3907e856-b011-4bd0-8422-7cff5037d830.png" 
            alt="LushMilk Logo" 
            className="h-12 w-12 bg-white rounded-full p-1"
          />
          <span className="text-2xl font-serif font-bold text-lushmilk-brown">Lush<span className="text-lushmilk-terracotta">Milk</span></span>
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors">Home</Link>
          <Link to="/about" className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors">About Us</Link>
          <Link to="/products" className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors">Products</Link>
          <Link to="/contact" className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors">Contact</Link>
          
          <Button className="bg-lushmilk-terracotta hover:bg-lushmilk-brown text-white transition-colors flex items-center gap-2">
            <ShoppingCart size={18} />
            <span>Order Now</span>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-lushmilk-charcoal focus:outline-none"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-md py-4 px-6 z-20 animate-fade-in">
          <div className="flex flex-col space-y-4">
            <Link 
              to="/" 
              className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/about" 
              className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              About Us
            </Link>
            <Link 
              to="/products" 
              className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Products
            </Link>
            <Link 
              to="/contact" 
              className="text-lushmilk-charcoal hover:text-lushmilk-terracotta transition-colors py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Contact
            </Link>
            
            <Button className="bg-lushmilk-terracotta hover:bg-lushmilk-brown text-white transition-colors w-full flex items-center justify-center gap-2">
              <ShoppingCart size={18} />
              <span>Order Now</span>
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
