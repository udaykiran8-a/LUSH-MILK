
import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Check, Leaf, Droplet } from 'lucide-react';
import { motion } from 'framer-motion';

const ProductCard = ({ product, index }: { product: any; index: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ 
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.43, 0.13, 0.23, 0.96]
      }}
      whileHover={{ 
        scale: 1.05,
        transition: { duration: 0.3 }
      }}
      whileTap={{ scale: 0.95 }}
    >
      <Card className="product-card transform transition-all duration-300 hover:shadow-xl overflow-hidden bg-white border-lushmilk-terracotta/30">
        <div className="product-image-container">
          <img 
            src={product.image} 
            alt={product.name} 
            className="product-image"
          />
          <Badge className="product-badge bg-lushmilk-terracotta hover:bg-lushmilk-deepred text-white">
            {product.category}
          </Badge>
        </div>
        <CardHeader className="pb-2">
          <CardTitle className="product-title text-lushmilk-richbrown">
            {product.name}
          </CardTitle>
          <CardDescription className="text-lushmilk-charcoal font-medium">
            {product.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-4 h-4 ${i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                />
              ))}
              <span className="ml-1 text-sm text-lushmilk-brown">
                {product.rating}
              </span>
            </div>
          </div>
          <p className="product-price text-lushmilk-terracotta font-bold">
            ₹{product.price * 70} <span className="text-sm font-normal text-lushmilk-brown">per liter</span>
          </p>
        </CardContent>
        <CardFooter className="pt-0">
          <Button 
            className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown text-white transition-colors flex items-center justify-center gap-2 rounded-md"
            onClick={(e) => {
              // Add a small popup effect on click
              const el = e.currentTarget;
              el.classList.add('animate-bounce-small');
              setTimeout(() => {
                el.classList.remove('animate-bounce-small');
              }, 500);
            }}
          >
            <ShoppingCart size={16} />
            <span>Add to Cart</span>
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

const ProductFeatures = () => {
  return (
    <div className="bg-white/95 rounded-lg shadow-lg p-6 mb-8 border border-lushmilk-cream">
      <Tabs defaultValue="benefits" className="w-full">
        <TabsList className="w-full mb-4 bg-lushmilk-cream/50">
          <TabsTrigger 
            value="benefits" 
            className="flex-1 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white"
          >
            Benefits
          </TabsTrigger>
          <TabsTrigger 
            value="quality" 
            className="flex-1 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white"
          >
            Quality
          </TabsTrigger>
          <TabsTrigger 
            value="sustainability" 
            className="flex-1 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white"
          >
            Sustainability
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="benefits" className="border border-lushmilk-cream/30 rounded-lg p-4 bg-white">
          <div className="space-y-4">
            <p className="text-lushmilk-richbrown text-lg">
              Our milk is packed with essential nutrients, vitamins, and minerals, providing a natural energy boost and supporting overall health.
            </p>
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Check className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>Rich in Calcium for strong bones and teeth</span>
              </li>
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Check className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>High in Protein for muscle development and repair</span>
              </li>
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Check className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>Source of Vitamin D for immune support</span>
              </li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="quality" className="border border-lushmilk-cream/30 rounded-lg p-4 bg-white">
          <div className="space-y-4">
            <p className="text-lushmilk-richbrown text-lg">
              We adhere to the highest quality standards, ensuring that our milk is pure, fresh, and free from additives and preservatives.
            </p>
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Check className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>Sourced from local South Indian farms</span>
              </li>
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Check className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>No artificial hormones or antibiotics</span>
              </li>
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Check className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>Regularly tested for purity and freshness</span>
              </li>
            </ul>
          </div>
        </TabsContent>
        
        <TabsContent value="sustainability" className="border border-lushmilk-cream/30 rounded-lg p-4 bg-white">
          <div className="space-y-4">
            <p className="text-lushmilk-richbrown text-lg">
              We are committed to sustainable farming practices that protect the environment and support local communities.
            </p>
            <ul className="list-none space-y-2">
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Leaf className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>Eco-friendly packaging that's biodegradable</span>
              </li>
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Droplet className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>Water conservation practices on all our farms</span>
              </li>
              <li className="flex items-start gap-2 text-lushmilk-charcoal">
                <Check className="mt-1 h-5 w-5 text-lushmilk-green flex-shrink-0" />
                <span>Support for local farmers and their families</span>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Full Cream Milk",
      description: "Rich and creamy, perfect for all your culinary needs.",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Cow Milk",
      rating: 4.5,
      price: 3.50,
    },
    {
      id: 2,
      name: "Toned Milk",
      description: "Light and refreshing, ideal for everyday consumption.",
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Cow Milk",
      rating: 4.2,
      price: 2.80,
    },
    {
      id: 3,
      name: "Organic Milk",
      description: "Certified organic, sourced from sustainable farms.",
      image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Cow Milk",
      rating: 4.8,
      price: 4.50,
    },
    {
      id: 4,
      name: "Buffalo Milk",
      description: "Thick and nutritious, a traditional favorite.",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
      category: "Buffalo Milk",
      rating: 4.6,
      price: 4.00,
    },
  ];

  return (
    <Layout>
      <section className="bg-lushmilk-offwhite py-12">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-serif font-bold text-lushmilk-richbrown mb-4 relative inline-block">
              Our Products
              <div className="absolute w-full h-1 bg-lushmilk-terracotta bottom-0 left-0 rounded-full"></div>
            </h1>
            <p className="text-lushmilk-brown text-lg max-w-2xl mx-auto">
              Experience the authentic taste of our farm-fresh milk products, crafted with traditional South Indian methods.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product, index) => (
              <ProductCard key={product.id} product={product} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-lushmilk-offwhite to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-semibold text-lushmilk-richbrown mb-2">
              Why Choose LushMilk?
            </h2>
            <p className="text-lushmilk-brown text-lg max-w-2xl mx-auto">
              Our milk is more than just a beverage - it's a tradition of quality and purity.
            </p>
          </motion.div>
          <ProductFeatures />
        </div>
      </section>

      <section className="bg-lushmilk-cream py-16">
        <div className="container mx-auto px-4 text-center">
          <motion.div 
            className="max-w-2xl mx-auto bg-white/95 p-8 rounded-lg shadow-lg border border-lushmilk-terracotta/20"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-serif font-semibold text-lushmilk-richbrown mb-4">
              Ready to Experience the Taste of Purity?
            </h2>
            <p className="text-lushmilk-brown text-lg mb-6">
              Order now and get farm-fresh milk delivered to your doorstep within hours.
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button className="bg-lushmilk-terracotta hover:bg-lushmilk-brown text-white transition-colors flex items-center justify-center gap-2 px-8 py-6 text-lg rounded-md">
                <ShoppingCart size={20} />
                <span>Order Now</span>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
