
import React, { useState } from 'react';
import ProductItem, { MilkProduct } from './catalog/ProductItem';
import { motion } from 'framer-motion';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

// Define milk product types and their details
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
    type: 'Full Cream',
    fatPercentage: '6.0%',
    snfPercentage: '9.0%',
    description: 'Our premium full cream milk offers a rich, creamy texture and exceptional taste, perfect for coffee, cooking, and daily enjoyment.',
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
  region: 'default';
  purchaseType: 'regular' | 'subscription';
}

const ProductCatalog: React.FC<ProductCatalogProps> = ({ purchaseType }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl md:text-3xl font-medium text-lushmilk-brown">Our Premium Products</h2>
        
        <div className="flex gap-2 bg-lushmilk-cream/20 p-1 rounded-md">
          <button 
            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            onClick={() => setViewMode('grid')}
          >
            Grid
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-white/50'}`}
            onClick={() => setViewMode('list')}
          >
            List
          </button>
        </div>
      </div>

      <Tabs defaultValue="regular" className="w-full mb-6">
        <TabsList className="w-full max-w-md mx-auto mb-6 bg-lushmilk-cream/20">
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
            Subscription
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="regular" className="space-y-6">
          <motion.div 
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-3 gap-8" : "flex flex-col gap-6"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {milkProducts.map((product, index) => (
              <ProductItem 
                key={product.id}
                product={product}
                index={index}
                purchaseType="regular"
                viewMode={viewMode}
              />
            ))}
          </motion.div>
        </TabsContent>
        
        <TabsContent value="subscription" className="space-y-6">
          <motion.div 
            className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-3 gap-8" : "flex flex-col gap-6"}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {milkProducts.map((product, index) => (
              <ProductItem 
                key={product.id}
                product={product}
                index={index}
                purchaseType="subscription"
                viewMode={viewMode}
              />
            ))}
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductCatalog;
