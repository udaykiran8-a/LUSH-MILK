
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Award, CircleCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

export interface MilkProduct {
  id: string;
  type: string;
  fatPercentage: string;
  snfPercentage: string;
  description: string;
  benefits: string[];
  image: string;
  popular?: boolean;
  pricing: {
    default: {
      '250ml'?: number;
      '500ml'?: number;
      '1L'?: number;
    };
    subscription?: {
      monthly1L?: number;
      monthly2L?: number;
    };
  };
}

interface PriceOptionProps {
  size: string;
  price: number;
  onClick: () => void;
}

const PriceOption: React.FC<PriceOptionProps> = ({ size, price, onClick }) => (
  <motion.div 
    className="flex justify-between items-center p-2 bg-lushmilk-cream/10 rounded-md"
    whileHover={{ backgroundColor: 'rgba(240, 231, 219, 0.2)' }}
    whileTap={{ scale: 0.98 }}
  >
    <span className="font-medium text-lushmilk-brown">{size}</span>
    <div className="flex items-center gap-3">
      <span className="text-lushmilk-terracotta font-semibold">₹{price}</span>
      <Button 
        size="sm" 
        className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 h-8"
        onClick={onClick}
      >
        <ShoppingCart className="h-3.5 w-3.5 mr-1" />
        Add
      </Button>
    </div>
  </motion.div>
);

interface SubscriptionOptionProps {
  quantity: string;
  period: string;
  originalPrice: number;
  discountedPrice: number;
  onClick: () => void;
}

const SubscriptionOption: React.FC<SubscriptionOptionProps> = ({ 
  quantity, 
  period, 
  originalPrice, 
  discountedPrice, 
  onClick 
}) => (
  <motion.div 
    className="flex justify-between items-center p-3 bg-lushmilk-cream/10 rounded-md border border-lushmilk-cream/20"
    whileHover={{ backgroundColor: 'rgba(240, 231, 219, 0.2)', borderColor: 'rgba(226, 190, 159, 0.3)' }}
    whileTap={{ scale: 0.98 }}
  >
    <div>
      <span className="font-medium text-lushmilk-brown">{quantity}</span>
      <p className="text-xs text-lushmilk-charcoal/80">({period})</p>
    </div>
    <div className="flex items-center gap-3">
      <div className="text-right">
        <div className="flex items-center gap-1">
          <span className="text-xs line-through text-lushmilk-charcoal/60">
            ₹{originalPrice}
          </span>
          <Badge className="bg-green-100 text-green-800 text-xs">-5%</Badge>
        </div>
        <span className="text-lushmilk-terracotta font-semibold">₹{discountedPrice}</span>
      </div>
      <Button 
        size="sm" 
        className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 h-8"
        onClick={onClick}
      >
        Subscribe
      </Button>
    </div>
  </motion.div>
);

interface ProductItemProps {
  product: MilkProduct;
  index: number;
  purchaseType: 'regular' | 'subscription';
  viewMode: 'grid' | 'list';
}

const ProductItem: React.FC<ProductItemProps> = ({ product, index, purchaseType, viewMode }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (size: string, price: number) => {
    addToCart({
      id: `${product.id}-${size}`,
      name: `${product.type} Milk (${size})`,
      price: price,
      image: product.image,
    });
    
    toast.success(`${product.type} Milk (${size}) added to cart`, {
      description: "Go to cart to complete your purchase",
      position: "top-center",
      duration: 2000,
    });
  };

  const handleAddSubscription = (quantity: string, price: number) => {
    addToCart({
      id: `${product.id}-subscription-${quantity}`,
      name: `${product.type} Milk Monthly Subscription (${quantity})`,
      price: price,
      image: product.image,
      isSubscription: true
    });
    
    toast.success(`${product.type} Milk Monthly Subscription added to cart`, {
      description: "5% discount applied! Go to cart to complete your purchase",
      position: "top-center",
      duration: 3000,
    });
  };

  // Apply different classes based on view mode
  const cardClassName = viewMode === 'list' 
    ? "flex flex-row h-full overflow-hidden border-lushmilk-cream/30 hover:border-lushmilk-terracotta/30 transition-colors"
    : "h-full flex flex-col overflow-hidden border-lushmilk-cream/30 hover:border-lushmilk-terracotta/30 transition-colors";

  const imageContainerClassName = viewMode === 'list'
    ? "relative h-auto w-1/3 min-w-[200px] overflow-hidden"
    : "relative h-48 overflow-hidden";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full"
    >
      <Card className={cardClassName}>
        <div className={imageContainerClassName}>
          <motion.img 
            src={product.image} 
            alt={product.type} 
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          />
          {product.popular && (
            <Badge className="absolute top-2 right-2 bg-lushmilk-terracotta text-white">
              Popular Choice
            </Badge>
          )}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent text-white p-3">
            <div className="flex items-center gap-1">
              <Award className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium">Premium Quality</span>
            </div>
          </div>
        </div>
        
        <div className={viewMode === 'list' ? "flex flex-col flex-grow" : ""}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-xl font-serif text-lushmilk-brown">
                {product.type} Milk
              </CardTitle>
              <div className="flex items-center">
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              </div>
            </div>
            <div className="flex gap-2 mt-1">
              <Badge variant="outline" className="bg-lushmilk-cream/20 text-lushmilk-brown border-lushmilk-cream">
                Fat: {product.fatPercentage}
              </Badge>
              <Badge variant="outline" className="bg-lushmilk-cream/20 text-lushmilk-brown border-lushmilk-cream">
                SNF: {product.snfPercentage}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-grow">
            <p className="text-lushmilk-charcoal/80 text-sm mb-4">
              {product.description}
            </p>
            
            <div className="space-y-2">
              {product.benefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <CircleCheck className="h-4 w-4 text-lushmilk-green mt-0.5 flex-shrink-0" />
                  <span className="text-xs text-lushmilk-charcoal">{benefit}</span>
                </div>
              ))}
            </div>
            
            {purchaseType === 'regular' && (
              <div className="mt-4 grid grid-cols-1 gap-2">
                {Object.entries(product.pricing.default).map(([size, price]) => (
                  <PriceOption
                    key={size}
                    size={size}
                    price={price}
                    onClick={() => handleAddToCart(size, price)}
                  />
                ))}
              </div>
            )}
            
            {purchaseType === 'subscription' && (
              <div className="mt-4 grid grid-cols-1 gap-3">
                <SubscriptionOption
                  quantity="1L Daily"
                  period="30 days"
                  originalPrice={Math.round((product.pricing.subscription?.monthly1L || 0) / 0.95)}
                  discountedPrice={product.pricing.subscription?.monthly1L || 0}
                  onClick={() => handleAddSubscription('1L Daily', product.pricing.subscription?.monthly1L || 0)}
                />
                
                <SubscriptionOption
                  quantity="2L Daily"
                  period="30 days"
                  originalPrice={Math.round((product.pricing.subscription?.monthly2L || 0) / 0.95)}
                  discountedPrice={product.pricing.subscription?.monthly2L || 0}
                  onClick={() => handleAddSubscription('2L Daily', product.pricing.subscription?.monthly2L || 0)}
                />
              </div>
            )}
          </CardContent>
          
          <CardFooter className="pt-0 pb-4">
            {purchaseType === 'regular' ? (
              <p className="text-xs text-lushmilk-charcoal/60 text-center w-full">
                Free delivery on orders above ₹200
              </p>
            ) : (
              <p className="text-xs text-lushmilk-charcoal/60 text-center w-full">
                Subscribe once, enjoy fresh milk every morning for a month
              </p>
            )}
          </CardFooter>
        </div>
      </Card>
    </motion.div>
  );
};

export default ProductItem;
