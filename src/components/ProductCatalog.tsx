
import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Star, Award, CircleCheck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

// Define milk product types and their details
interface MilkProduct {
  id: string;
  type: string;
  fatPercentage: string;
  snfPercentage: string;
  description: string;
  benefits: string[];
  image: string;
  popular?: boolean;
  pricing: {
    // Remove chennai from pricing structure
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

const milkProducts: MilkProduct[] = [
  {
    id: 'farm-fresh',
    type: 'Farm Fresh',
    fatPercentage: '3.5%',
    snfPercentage: '8.5%',
    description: 'Our signature farm-fresh milk, sourced directly from grass-fed cows and delivered within hours of milking.',
    benefits: [
      'Rich in essential nutrients and vitamins',
      'No preservatives or additives',
      'Supports immune system health'
    ],
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    popular: true,
    pricing: {
      default: {
        '250ml': 25,
        '500ml': 45,
        '1L': 85
      },
      subscription: {
        monthly1L: 2565, // ₹85 x 30 - 5%
        monthly2L: 5130  // ₹85 x 60 - 5%
      }
    }
  },
  {
    id: 'low-fat',
    type: 'Low Fat',
    fatPercentage: '1.5%',
    snfPercentage: '9.0%',
    description: 'Perfect for health-conscious individuals, our low-fat milk retains all essential nutrients while reducing fat content.',
    benefits: [
      'Lower in calories without sacrificing taste',
      'Perfect for weight management',
      'High calcium content for bone health'
    ],
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    pricing: {
      default: {
        '250ml': 20,
        '500ml': 38,
        '1L': 70
      },
      subscription: {
        monthly1L: 1995, // ₹70 x 30 - 5%
        monthly2L: 3990  // ₹70 x 60 - 5%
      }
    }
  },
  {
    id: 'toned-milk',
    type: 'Toned Milk',
    fatPercentage: '6.0%',
    snfPercentage: '9.0%',
    description: 'Our premium toned milk offers a rich, creamy texture and exceptional taste, perfect for coffee, cooking, and daily enjoyment.',
    benefits: [
      'Extra creamy and rich taste',
      'Ideal for culinary applications',
      'Higher protein content for muscle development'
    ],
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    popular: true,
    pricing: {
      default: {
        '250ml': 30,
        '500ml': 55,
        '1L': 105
      },
      subscription: {
        monthly1L: 2992.5, // ₹105 x 30 - 5%
        monthly2L: 5985    // ₹105 x 60 - 5%
      }
    }
  },
];

interface ProductCatalogProps {
  region: 'default'; // Updated to only use default region
  purchaseType: 'regular' | 'subscription';
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ region, purchaseType }) => {
  const { addToCart } = useCart();
  
  const handleAddToCart = (product: MilkProduct, size: string, price: number) => {
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

  const handleAddSubscription = (product: MilkProduct, quantity: string, price: number) => {
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

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {milkProducts.map((product, index) => (
        <motion.div
          key={product.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          whileHover={{ y: -5 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col overflow-hidden border-lushmilk-cream/30 hover:border-lushmilk-terracotta/30 transition-colors">
            <div className="relative h-48 overflow-hidden">
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
                    <motion.div 
                      key={size} 
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
                          onClick={() => handleAddToCart(product, size, price)}
                        >
                          <ShoppingCart className="h-3.5 w-3.5 mr-1" />
                          Add
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {purchaseType === 'subscription' && (
                <div className="mt-4 grid grid-cols-1 gap-3">
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-lushmilk-cream/10 rounded-md border border-lushmilk-cream/20"
                    whileHover={{ backgroundColor: 'rgba(240, 231, 219, 0.2)', borderColor: 'rgba(226, 190, 159, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <span className="font-medium text-lushmilk-brown">1L Daily</span>
                      <p className="text-xs text-lushmilk-charcoal/80">(30 days)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-xs line-through text-lushmilk-charcoal/60">
                            ₹{Math.round((product.pricing.subscription?.monthly1L || 0) / 0.95)}
                          </span>
                          <Badge className="bg-green-100 text-green-800 text-xs">-5%</Badge>
                        </div>
                        <span className="text-lushmilk-terracotta font-semibold">₹{product.pricing.subscription?.monthly1L}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 h-8"
                        onClick={() => handleAddSubscription(product, '1L Daily', product.pricing.subscription?.monthly1L || 0)}
                      >
                        Subscribe
                      </Button>
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    className="flex justify-between items-center p-3 bg-lushmilk-cream/10 rounded-md border border-lushmilk-cream/20"
                    whileHover={{ backgroundColor: 'rgba(240, 231, 219, 0.2)', borderColor: 'rgba(226, 190, 159, 0.3)' }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div>
                      <span className="font-medium text-lushmilk-brown">2L Daily</span>
                      <p className="text-xs text-lushmilk-charcoal/80">(30 days)</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-1">
                          <span className="text-xs line-through text-lushmilk-charcoal/60">
                            ₹{Math.round((product.pricing.subscription?.monthly2L || 0) / 0.95)}
                          </span>
                          <Badge className="bg-green-100 text-green-800 text-xs">-5%</Badge>
                        </div>
                        <span className="text-lushmilk-terracotta font-semibold">₹{product.pricing.subscription?.monthly2L}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 h-8"
                        onClick={() => handleAddSubscription(product, '2L Daily', product.pricing.subscription?.monthly2L || 0)}
                      >
                        Subscribe
                      </Button>
                    </div>
                  </motion.div>
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
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

export default ProductCatalog;
