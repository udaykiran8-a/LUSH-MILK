
import React from 'react';
import { useCart } from '@/contexts/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const CartButton = () => {
  const { getItemCount } = useCart();
  const itemCount = getItemCount();

  return (
    <Button 
      asChild
      variant="ghost" 
      className="relative"
    >
      <Link to="/cart">
        <ShoppingCart className="h-5 w-5 mr-1" />
        <span className="sr-only">Shopping cart</span>
        {itemCount > 0 && (
          <motion.span 
            className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            key={itemCount}
          >
            {itemCount}
          </motion.span>
        )}
      </Link>
    </Button>
  );
};

export default CartButton;
