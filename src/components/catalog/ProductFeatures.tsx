
import React from 'react';
import { Check, Leaf, Droplet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

const ProductFeatures: React.FC = () => {
  const featureVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-lushmilk-cream/30">
      <Tabs defaultValue="benefits" className="w-full">
        <TabsList className="w-full mb-6 bg-lushmilk-cream/20 p-1 rounded-md overflow-hidden">
          <TabsTrigger 
            value="benefits" 
            className="flex-1 py-2.5 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white rounded-md transition-all"
          >
            Benefits
          </TabsTrigger>
          <TabsTrigger 
            value="quality" 
            className="flex-1 py-2.5 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white rounded-md transition-all"
          >
            Quality
          </TabsTrigger>
          <TabsTrigger 
            value="sustainability" 
            className="flex-1 py-2.5 data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white rounded-md transition-all"
          >
            Sustainability
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="benefits" className="border border-lushmilk-cream/30 rounded-lg p-6 bg-white">
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="text-lushmilk-richbrown text-lg mb-6" variants={featureVariants}>
              Our milk is packed with essential nutrients, vitamins, and minerals, providing a natural energy boost and supporting overall health.
            </motion.p>
            <ul className="space-y-4">
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>Rich in Calcium for strong bones and teeth</span>
              </motion.li>
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>High in Protein for muscle development and repair</span>
              </motion.li>
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>Source of Vitamin D for immune support</span>
              </motion.li>
            </ul>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="quality" className="border border-lushmilk-cream/30 rounded-lg p-6 bg-white">
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="text-lushmilk-richbrown text-lg mb-6" variants={featureVariants}>
              We adhere to the highest quality standards, ensuring that our milk is pure, fresh, and free from additives and preservatives.
            </motion.p>
            <ul className="space-y-4">
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>Sourced from local South Indian farms</span>
              </motion.li>
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>No artificial hormones or antibiotics</span>
              </motion.li>
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-green text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>Regularly tested for purity and freshness</span>
              </motion.li>
            </ul>
          </motion.div>
        </TabsContent>
        
        <TabsContent value="sustainability" className="border border-lushmilk-cream/30 rounded-lg p-6 bg-white">
          <motion.div 
            className="space-y-6"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.p className="text-lushmilk-richbrown text-lg mb-6" variants={featureVariants}>
              We are committed to sustainable farming practices that protect the environment and support local communities.
            </motion.p>
            <ul className="space-y-4">
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-terracotta text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Leaf className="h-4 w-4" />
                </span>
                <span>Eco-friendly packaging that's biodegradable</span>
              </motion.li>
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-terracotta text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Droplet className="h-4 w-4" />
                </span>
                <span>Water conservation practices on all our farms</span>
              </motion.li>
              <motion.li className="flex items-start gap-3 text-lushmilk-charcoal" variants={featureVariants}>
                <span className="mt-1 h-6 w-6 bg-lushmilk-terracotta text-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check className="h-4 w-4" />
                </span>
                <span>Supporting local farming communities</span>
              </motion.li>
            </ul>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductFeatures;
