import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Leaf, Droplet, ShoppingCart, Search, FilterX, LayoutGrid, List } from 'lucide-react';
import { motion } from 'framer-motion';
import ProductCard, { Product } from '@/components/ProductCard';
import { Input } from '@/components/ui/input';

// Sample product data
const allProducts: Product[] = [
  {
    id: 1,
    name: "Full Cream Milk",
    description: "Rich and creamy, perfect for all your culinary needs with high fat content.",
    price: 3.50,
    rating: 4.8,
    category: "Cow Milk",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    popular: true
  },
  {
    id: 2,
    name: "Toned Milk",
    description: "Light and refreshing, ideal for everyday consumption with reduced fat content.",
    price: 2.80,
    rating: 4.2,
    category: "Cow Milk",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 3,
    name: "Organic Milk",
    description: "Certified organic, sourced from sustainable farms with no added hormones.",
    price: 4.50,
    rating: 4.8,
    category: "Cow Milk",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    popular: true
  },
  {
    id: 4,
    name: "Buffalo Milk",
    description: "Thick and nutritious, a traditional favorite with higher protein content.",
    price: 4.00,
    rating: 4.6,
    category: "Buffalo Milk",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    popular: true
  },
  {
    id: 5,
    name: "Low Fat Milk",
    description: "Perfect for health-conscious individuals with reduced fat content.",
    price: 2.90,
    rating: 4.1,
    category: "Cow Milk",
    image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 6,
    name: "A2 Milk",
    description: "Premium milk from indigenous cow breeds with A2 beta-casein protein.",
    price: 5.20,
    rating: 4.9,
    category: "Premium Milk",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    popular: true
  },
  {
    id: 7,
    name: "Farm Fresh Milk",
    description: "Delivered straight from our farms within hours of milking.",
    price: 3.80,
    rating: 4.7,
    category: "Cow Milk",
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  },
  {
    id: 8,
    name: "Premium Buffalo Milk",
    description: "Extra creamy and rich buffalo milk from our premium herds.",
    price: 4.50,
    rating: 4.8,
    category: "Buffalo Milk",
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
  }
];

const ProductFeatures = () => {
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

const Products = () => {
  const [category, setCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const categories = ["All", "Cow Milk", "Buffalo Milk", "Premium Milk"];
  
  const filteredProducts = allProducts.filter(product => {
    const matchesCategory = category === null || category === "All" || product.category === category;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  return (
    <Layout>
      <section className="py-12 bg-gradient-to-b from-white via-lushmilk-cream/5 to-white">
        <div className="container mx-auto px-4">
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-serif font-bold text-lushmilk-richbrown mb-4 relative inline-block">
              Our Products
              <motion.div 
                className="absolute w-full h-1 bg-lushmilk-terracotta bottom-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.5 }}
              ></motion.div>
            </h1>
            <p className="text-lushmilk-brown text-lg max-w-2xl mx-auto">
              Experience the authentic taste of our farm-fresh milk products, crafted with traditional South Indian methods.
            </p>
          </motion.div>
          
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                  <button
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchTerm("")}
                  >
                    <FilterX className="h-5 w-5" />
                  </button>
                )}
              </div>
              
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => (
                  <Button
                    key={cat}
                    variant={category === cat || (cat === "All" && category === null) ? "default" : "outline"}
                    className={
                      category === cat || (cat === "All" && category === null)
                        ? "bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
                        : "border-lushmilk-terracotta text-lushmilk-brown hover:bg-lushmilk-cream/20"
                    }
                    onClick={() => setCategory(cat === "All" ? null : cat)}
                  >
                    {cat}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`${viewMode === 'grid' ? 'bg-lushmilk-cream/20' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4 mr-1" />
                  Grid
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={`${viewMode === 'list' ? 'bg-lushmilk-cream/20' : ''}`}
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4 mr-1" />
                  List
                </Button>
              </div>
            </div>
            
            <ProductFeatures />
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
              {filteredProducts.map((product, index) => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  index={index}
                />
              ))}
            </div>
          ) : (
            <motion.div 
              className="text-center py-16 bg-white rounded-lg shadow-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <FilterX className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h2 className="text-2xl font-medium text-gray-400 mb-4">No products found</h2>
              <p className="text-gray-500 mb-8">Try adjusting your search or filter criteria</p>
              <Button 
                onClick={() => {
                  setCategory(null);
                  setSearchTerm("");
                }}
                className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90"
              >
                Reset Filters
              </Button>
            </motion.div>
          )}
          
          <motion.div 
            className="mt-16 p-8 bg-lushmilk-cream/20 rounded-lg shadow-sm border border-lushmilk-cream/30 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">
              Daily Fresh Deliveries
            </h2>
            <p className="text-lushmilk-brown text-lg mb-6 max-w-2xl mx-auto">
              Subscribe to our daily delivery service and never run out of fresh milk.
              We deliver right to your doorstep before sunrise.
            </p>
            <Button 
              asChild
              className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
            >
              <Link to="/cart" className="flex items-center gap-2">
                <ShoppingCart size={18} />
                Start Subscription
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
