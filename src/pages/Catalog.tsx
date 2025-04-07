
import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProductCatalog from '@/components/ProductCatalog';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Calendar, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Catalog = () => {
  const [region, setRegion] = useState<'default' | 'chennai'>('default');
  
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-b from-white via-lushmilk-cream/5 to-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-serif font-bold text-lushmilk-richbrown mb-4 relative inline-block">
              Premium Milk Catalog
              <motion.div 
                className="absolute w-full h-1 bg-lushmilk-terracotta bottom-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.5 }}
              ></motion.div>
            </h1>
            <p className="text-lushmilk-brown text-lg max-w-2xl mx-auto">
              Experience the purity of farm-fresh milk, sourced ethically and delivered with care
            </p>
          </motion.div>
          
          <div className="mb-12 bg-white rounded-lg shadow-md p-8 border border-lushmilk-cream/30">
            <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-6 text-center">
              What Makes Our Milk Special
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                className="text-center p-6 rounded-lg border border-lushmilk-cream/30 hover:border-lushmilk-terracotta/30 transition-colors"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
              >
                <div className="w-16 h-16 bg-lushmilk-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package className="text-lushmilk-terracotta" size={24} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Premium Quality</h3>
                <p className="text-lushmilk-charcoal/80">
                  Our milk is sourced from grass-fed cows and strict quality standards ensure rich, pure taste.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 rounded-lg border border-lushmilk-cream/30 hover:border-lushmilk-terracotta/30 transition-colors"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-lushmilk-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-lushmilk-terracotta" size={24} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Subscription Savings</h3>
                <p className="text-lushmilk-charcoal/80">
                  Enjoy a 5% discount on all monthly subscriptions with guaranteed daily delivery.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center p-6 rounded-lg border border-lushmilk-cream/30 hover:border-lushmilk-terracotta/30 transition-colors"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
              >
                <div className="w-16 h-16 bg-lushmilk-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Truck className="text-lushmilk-terracotta" size={24} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Doorstep Delivery</h3>
                <p className="text-lushmilk-charcoal/80">
                  Fresh milk delivered right to your doorstep before sunrise, every single day.
                </p>
              </motion.div>
            </div>
          </div>
          
          <div className="mb-8 flex justify-center">
            <div className="bg-white rounded-lg inline-flex p-1 border border-lushmilk-cream/30 shadow-sm">
              <Button 
                variant={region === 'default' ? 'default' : 'ghost'}
                className={region === 'default' ? 'bg-lushmilk-terracotta' : ''}
                onClick={() => setRegion('default')}
              >
                Standard Pricing
              </Button>
              <Button 
                variant={region === 'chennai' ? 'default' : 'ghost'}
                className={region === 'chennai' ? 'bg-lushmilk-terracotta' : ''}
                onClick={() => setRegion('chennai')}
              >
                Chennai Pricing
              </Button>
            </div>
          </div>
          
          <Tabs defaultValue="regular" className="mb-16">
            <TabsList className="w-full max-w-md mx-auto mb-8 bg-lushmilk-cream/20">
              <TabsTrigger 
                value="regular" 
                className="flex-1 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white"
              >
                Regular Purchase
              </TabsTrigger>
              <TabsTrigger 
                value="subscription" 
                className="flex-1 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white"
              >
                Monthly Subscription
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="regular" className="focus-visible:outline-none focus-visible:ring-0">
              <ProductCatalog region={region} purchaseType="regular" />
            </TabsContent>
            
            <TabsContent value="subscription" className="focus-visible:outline-none focus-visible:ring-0">
              <ProductCatalog region={region} purchaseType="subscription" />
            </TabsContent>
          </Tabs>
          
          <motion.div 
            className="mt-16 p-8 bg-lushmilk-cream/20 rounded-lg shadow-sm border border-lushmilk-cream/30 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">
              Ready to Experience Premium Milk?
            </h2>
            <p className="text-lushmilk-brown text-lg mb-6 max-w-2xl mx-auto">
              Start your journey with LushMilk today and taste the difference that ethically sourced, 
              premium quality milk can make in your life.
            </p>
            <Button 
              asChild
              className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
            >
              <Link to="/cart" className="flex items-center gap-2">
                Get Started
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Catalog;
