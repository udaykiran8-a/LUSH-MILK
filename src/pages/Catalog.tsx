import React, { useState } from 'react';
import Layout from '@/components/Layout';
import ProductCatalog from '@/components/ProductCatalog';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, Calendar, Truck, Info, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';

const Catalog = () => {
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

          <motion.div 
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="border border-lushmilk-cream/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl font-serif text-lushmilk-brown flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-lushmilk-terracotta" />
                  Pricing Information
                </CardTitle>
                <CardDescription>
                  Compare our pricing across different package sizes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="pricing">
                    <AccordionTrigger className="text-lushmilk-brown font-medium">
                      View Detailed Price Comparison
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                          <thead className="bg-lushmilk-cream/20">
                            <tr>
                              <th className="p-3 border border-lushmilk-cream/30 text-left text-lushmilk-brown">Milk Type</th>
                              <th className="p-3 border border-lushmilk-cream/30 text-left text-lushmilk-brown">Size</th>
                              <th className="p-3 border border-lushmilk-cream/30 text-left text-lushmilk-brown">Price</th>
                              <th className="p-3 border border-lushmilk-cream/30 text-left text-lushmilk-brown">Price per Liter</th>
                              <th className="p-3 border border-lushmilk-cream/30 text-left text-lushmilk-brown">Subscription (5% off)</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Farm Fresh */}
                            <tr>
                              <td rowSpan={3} className="p-3 border border-lushmilk-cream/30 font-medium">Farm Fresh<br/><Badge className="bg-lushmilk-cream/40 text-lushmilk-brown border-lushmilk-cream">3.5% Fat, 8.5% SNF</Badge></td>
                              <td className="p-3 border border-lushmilk-cream/30">250ml</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹25</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹100/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">N/A</td>
                            </tr>
                            <tr>
                              <td className="p-3 border border-lushmilk-cream/30">500ml</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹45</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹90/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">N/A</td>
                            </tr>
                            <tr>
                              <td className="p-3 border border-lushmilk-cream/30">1L</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹85</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹85/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹81 per day</td>
                            </tr>
                            
                            {/* Low Fat */}
                            <tr>
                              <td rowSpan={3} className="p-3 border border-lushmilk-cream/30 font-medium">Low Fat<br/><Badge className="bg-lushmilk-cream/40 text-lushmilk-brown border-lushmilk-cream">1.5% Fat, 9.0% SNF</Badge></td>
                              <td className="p-3 border border-lushmilk-cream/30">250ml</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹20</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹80/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">N/A</td>
                            </tr>
                            <tr>
                              <td className="p-3 border border-lushmilk-cream/30">500ml</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹38</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹76/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">N/A</td>
                            </tr>
                            <tr>
                              <td className="p-3 border border-lushmilk-cream/30">1L</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹70</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹70/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹67 per day</td>
                            </tr>
                            
                            {/* Toned Milk */}
                            <tr>
                              <td rowSpan={3} className="p-3 border border-lushmilk-cream/30 font-medium">Full Cream<br/><Badge className="bg-lushmilk-cream/40 text-lushmilk-brown border-lushmilk-cream">6.0% Fat, 9.0% SNF</Badge></td>
                              <td className="p-3 border border-lushmilk-cream/30">250ml</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹30</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹120/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">N/A</td>
                            </tr>
                            <tr>
                              <td className="p-3 border border-lushmilk-cream/30">500ml</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹55</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹110/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">N/A</td>
                            </tr>
                            <tr>
                              <td className="p-3 border border-lushmilk-cream/30">1L</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹105</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹105/L</td>
                              <td className="p-3 border border-lushmilk-cream/30">₹100 per day</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-4 text-sm text-lushmilk-charcoal/80">
                        <p className="flex items-center mb-2">
                          <Info className="h-4 w-4 mr-2 text-lushmilk-terracotta" />
                          Monthly subscriptions receive a 5% discount on the regular price
                        </p>
                        <p className="flex items-center">
                          <Info className="h-4 w-4 mr-2 text-lushmilk-terracotta" />
                          Price per liter is calculated based on the package size
                        </p>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </motion.div>
          
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
              <ProductCatalog region="default" purchaseType="regular" />
            </TabsContent>
            
            <TabsContent value="subscription" className="focus-visible:outline-none focus-visible:ring-0">
              <ProductCatalog region="default" purchaseType="subscription" />
            </TabsContent>
          </Tabs>
          
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">
              Learn More About Our Milk Types
            </h2>
            <p className="text-lushmilk-brown text-lg mb-6 max-w-2xl mx-auto">
              Discover the unique properties and benefits of our different milk varieties
            </p>
            <Button 
              asChild
              className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
            >
              <Link to="/milk-types" className="flex items-center gap-2">
                Explore Our Milk Types
              </Link>
            </Button>
          </motion.div>
          
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
