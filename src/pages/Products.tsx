
import React from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Star, Plus, ArrowRight } from 'lucide-react';

const Products = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-lushmilk-brown/5 kolam-pattern"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-lushmilk-brown mb-6">Our Products</h1>
            <p className="text-xl text-lushmilk-charcoal/80 mb-8">
              Discover our range of farm-fresh milk products, sourced ethically from local South Indian farms.
            </p>
          </div>
        </div>
      </section>

      {/* Products Tabs Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full max-w-xl mx-auto mb-12 bg-lushmilk-cream/30">
              <TabsTrigger value="all" className="flex-1">All Products</TabsTrigger>
              <TabsTrigger value="cow" className="flex-1">Cow Milk</TabsTrigger>
              <TabsTrigger value="buffalo" className="flex-1">Buffalo Milk</TabsTrigger>
              <TabsTrigger value="organic" className="flex-1">Organic</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Product 1 */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Full Cream Milk" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-lushmilk-terracotta text-white px-3 py-1 rounded-full text-sm">Popular</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Full Cream Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(124)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      Rich and creamy milk with full nutritional benefits, perfect for growing children and adults alike.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹60 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹15</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹30</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹60</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* Product 2 */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Organic Milk" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-lushmilk-green text-white px-3 py-1 rounded-full text-sm">Organic</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Organic Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(98)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      100% organic milk from grass-fed cows, free from hormones and antibiotics.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹80 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹20</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹40</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹80</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* Product 3 */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Buffalo Milk" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Buffalo Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(156)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      Creamy and rich buffalo milk, higher in protein and calcium than regular cow milk.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹70 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹18</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹35</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹70</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* Product 4 */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1591057459351-12c5a6c6677b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Toned Milk" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Toned Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(87)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      Balanced milk with reduced fat content but all essential nutrients preserved, ideal for daily consumption.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹50 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹13</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹25</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹50</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* Product 5 */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1629926613530-a2bcb5803f6a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="A2 Milk" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-lushmilk-green text-white px-3 py-1 rounded-full text-sm">Premium</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">A2 Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(72)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      Premium milk from indigenous cows producing only A2 protein, easier to digest and great for sensitive stomachs.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹90 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹23</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹45</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹90</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* Product 6 */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1628088273273-4c232ab960a8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Double Toned Milk" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Double Toned Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(64)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      Low-fat milk option with all essential nutrients, perfect for weight-conscious individuals.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹45 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹12</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹23</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹45</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="cow" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Show only cow milk products here */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Full Cream Milk" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-lushmilk-terracotta text-white px-3 py-1 rounded-full text-sm">Popular</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Full Cream Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(124)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      Rich and creamy milk with full nutritional benefits, perfect for growing children and adults alike.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹60 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹15</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹30</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹60</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* More cow milk products would go here */}
              </div>
            </TabsContent>
            
            <TabsContent value="buffalo" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Show only buffalo milk products here */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Buffalo Milk" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Buffalo Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(156)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      Creamy and rich buffalo milk, higher in protein and calcium than regular cow milk.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹70 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹18</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹35</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹70</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* More buffalo milk products would go here */}
              </div>
            </TabsContent>
            
            <TabsContent value="organic" className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Show only organic milk products here */}
                <div className="product-card">
                  <div className="h-56 bg-gray-200 relative overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                      alt="Organic Milk" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-lushmilk-green text-white px-3 py-1 rounded-full text-sm">Organic</div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Organic Milk</h3>
                    <div className="flex items-center mb-3">
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500 fill-yellow-500" size={16} />
                      <Star className="text-yellow-500" size={16} />
                      <span className="text-sm text-lushmilk-charcoal/60 ml-2">(98)</span>
                    </div>
                    <p className="text-lushmilk-charcoal/80 mb-4">
                      100% organic milk from grass-fed cows, free from hormones and antibiotics.
                    </p>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lushmilk-terracotta font-medium">From ₹80 / liter</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">250ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹20</p>
                      </div>
                      <div className="border border-lushmilk-cream rounded p-2 text-center cursor-pointer hover:border-lushmilk-terracotta transition-colors">
                        <p className="text-lushmilk-charcoal font-medium">500ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹40</p>
                      </div>
                      <div className="border border-lushmilk-terracotta bg-lushmilk-cream/20 rounded p-2 text-center cursor-pointer">
                        <p className="text-lushmilk-charcoal font-medium">1000ml</p>
                        <p className="text-sm text-lushmilk-charcoal/60">₹80</p>
                      </div>
                    </div>
                    <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown flex items-center justify-center gap-2">
                      <Plus size={16} /> Add to Cart
                    </Button>
                  </div>
                </div>
                
                {/* More organic milk products would go here */}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section className="section-padding bg-lushmilk-cream/30">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Subscription Plans</h2>
            <p className="text-lushmilk-charcoal/80 text-lg">
              Never run out of milk with our flexible subscription plans, delivered right to your doorstep.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Daily Plan */}
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-lushmilk-terracotta">
              <h3 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-2">Daily Delivery</h3>
              <p className="text-lushmilk-green font-medium mb-4">Most Popular</p>
              <p className="text-lushmilk-charcoal/80 mb-6">
                Fresh milk delivered to your doorstep every morning, just in time for breakfast.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Delivery between 5AM - 7AM</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">10% discount on monthly billing</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Easy pause or modify options</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Free delivery</p>
                </li>
              </ul>
              <Button className="w-full bg-lushmilk-terracotta hover:bg-lushmilk-brown">Subscribe Now</Button>
            </div>
            
            {/* Weekly Plan */}
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-lushmilk-brown">
              <h3 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-2">Weekly Delivery</h3>
              <p className="text-lushmilk-green font-medium mb-4">For Occasional Users</p>
              <p className="text-lushmilk-charcoal/80 mb-6">
                Get a weekly supply of fresh milk delivered in special insulated packaging.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Delivery on your chosen day</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">5% discount on monthly billing</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Special long-life packaging</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Free delivery for orders above ₹500</p>
                </li>
              </ul>
              <Button className="w-full border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta hover:text-white" variant="outline">Subscribe Now</Button>
            </div>
            
            {/* Monthly Plan */}
            <div className="bg-white rounded-lg shadow-md p-8 border-t-4 border-lushmilk-green">
              <h3 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-2">Monthly Supply</h3>
              <p className="text-lushmilk-green font-medium mb-4">Best Value</p>
              <p className="text-lushmilk-charcoal/80 mb-6">
                Bulk delivery of our special long-life milk with the same farm-fresh taste.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Single monthly delivery</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">15% discount on total bill</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Premium long-life packaging</p>
                </li>
                <li className="flex items-start">
                  <span className="text-lushmilk-terracotta mr-2">✓</span>
                  <p className="text-lushmilk-charcoal/80">Free delivery + 1 free product sample</p>
                </li>
              </ul>
              <Button className="w-full border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta hover:text-white" variant="outline">Subscribe Now</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Nutritional Benefits */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-8 md:p-12">
                <h2 className="text-3xl font-bold text-lushmilk-brown mb-6">Nutritional Benefits</h2>
                <p className="text-lushmilk-charcoal/80 mb-6">
                  Our farm-fresh milk is packed with essential nutrients that support overall health and wellness for your entire family.
                </p>
                
                <div className="space-y-4">
                  <div className="bg-lushmilk-cream/30 p-4 rounded-md">
                    <h3 className="font-medium text-lushmilk-brown mb-2">Protein Content</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lushmilk-charcoal/80">Full Cream Milk</span>
                      <span className="font-medium text-lushmilk-terracotta">3.2g per 100ml</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lushmilk-charcoal/80">Buffalo Milk</span>
                      <span className="font-medium text-lushmilk-terracotta">4.3g per 100ml</span>
                    </div>
                  </div>
                  
                  <div className="bg-lushmilk-cream/30 p-4 rounded-md">
                    <h3 className="font-medium text-lushmilk-brown mb-2">Fat Content</h3>
                    <div className="flex justify-between items-center">
                      <span className="text-lushmilk-charcoal/80">Full Cream Milk</span>
                      <span className="font-medium text-lushmilk-terracotta">3.5% - 4.0%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lushmilk-charcoal/80">Toned Milk</span>
                      <span className="font-medium text-lushmilk-terracotta">3.0%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-lushmilk-charcoal/80">Double Toned Milk</span>
                      <span className="font-medium text-lushmilk-terracotta">1.5%</span>
                    </div>
                  </div>
                  
                  <div className="bg-lushmilk-cream/30 p-4 rounded-md">
                    <h3 className="font-medium text-lushmilk-brown mb-2">Calcium & Vitamins</h3>
                    <p className="text-lushmilk-charcoal/80 mb-2">
                      All our milk products are rich in:
                    </p>
                    <ul className="space-y-1 text-lushmilk-charcoal/80">
                      <li>• Calcium (essential for bone health)</li>
                      <li>• Vitamin D (supports calcium absorption)</li>
                      <li>• Vitamin B12 (important for brain function)</li>
                      <li>• Vitamin A (supports eye health)</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="bg-lushmilk-brown/10 p-8 md:p-12 flex items-center">
                <img 
                  src="https://images.unsplash.com/photo-1596458598717-8fbde274ec1f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Milk glass and bottle" 
                  className="w-full h-auto rounded-lg shadow-md"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-lushmilk-terracotta text-white text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Start Your Milk Subscription Today</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of families who enjoy farm-fresh milk delivered to their doorstep.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-white text-lushmilk-terracotta hover:bg-lushmilk-cream flex items-center gap-2">
              <a href="#">
                Subscribe Now <ArrowRight size={16} />
              </a>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/20">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
