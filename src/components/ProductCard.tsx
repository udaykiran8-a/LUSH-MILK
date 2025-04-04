
import React from 'react';
import { motion } from 'framer-motion';
import { Star, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  category: string;
  popular?: boolean;
}

interface ProductCardProps {
  product: Product;
  index: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, index }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    
    toast.success(`${product.name} added to cart`, {
      description: "Go to cart to complete your purchase",
      position: "top-center",
      duration: 2000,
    });
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden border border-lushmilk-cream/30 hover:shadow-xl transition-all duration-300 hover:border-lushmilk-terracotta/30 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5,
          delay: index * 0.1
        }
      }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, margin: "-50px" }}
    >
      <div className="relative h-48 md:h-56 overflow-hidden">
        <motion.img 
          src={product.image} 
          alt={product.name} 
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.05 }}
          transition={{ duration: 0.5 }}
        />
        {product.popular && (
          <Badge className="absolute top-2 right-2 bg-lushmilk-terracotta text-white">
            Popular
          </Badge>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-center mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating)
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.rating.toFixed(1)})</span>
        </div>
        
        <h3 className="text-lg font-serif font-semibold text-lushmilk-brown mb-1">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lushmilk-terracotta font-semibold">
            ₹{product.price * 70} <span className="text-xs text-gray-500">/liter</span>
          </span>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={handleAddToCart}
              className="bg-lushmilk-terracotta/90 hover:bg-lushmilk-terracotta text-white"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
