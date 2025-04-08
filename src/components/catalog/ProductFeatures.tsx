
import React from 'react';
import { Check, Leaf, Droplet } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProductFeatures: React.FC = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-8 border border-lushmilk-cream/30">
      <Tabs defaultValue="benefits" className="w-full">
        <TabsList className="w-full mb-4 bg-lushmilk-cream/20">
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
                <span>Supporting local farming communities</span>
              </li>
            </ul>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductFeatures;
