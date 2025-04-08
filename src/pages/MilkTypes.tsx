
import React from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Baby, Users, ChefHat, Heart, Droplet, Award, Info, Salad } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const milkTypes = [
  {
    id: 'farm-fresh',
    name: 'Farm Fresh',
    fatPercentage: '3.5%',
    snfPercentage: '8.5%',
    description: 'Our signature farm-fresh milk, sourced directly from grass-fed cows and delivered within hours of milking.',
    benefits: [
      'Balanced fat and protein content, perfect for everyday use',
      'Rich in calcium and essential vitamins A, D, and B12',
      'Naturally sweet flavor ideal for drinking, cereals, and coffee',
    ],
    recommendedFor: [
      { icon: <Users size={18} />, text: 'Entire family' },
      { icon: <Heart size={18} />, text: 'General health' },
      { icon: <ChefHat size={18} />, text: 'Versatile cooking' },
    ],
    nutritionalInfo: {
      calories: '67 per 100ml',
      protein: '3.2g per 100ml',
      calcium: '120mg per 100ml',
      vitaminD: '40IU per 100ml',
    },
    color: 'bg-blue-50',
    iconColor: 'text-blue-500',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'low-fat',
    name: 'Low Fat',
    fatPercentage: '1.5%',
    snfPercentage: '9.0%',
    description: 'Perfect for health-conscious individuals, our low-fat milk retains all essential nutrients while reducing fat content.',
    benefits: [
      'Lower in calories without sacrificing taste',
      'Higher protein-to-fat ratio for better muscle recovery',
      'All essential nutrients with reduced saturated fat',
    ],
    recommendedFor: [
      { icon: <Heart size={18} />, text: 'Weight management' },
      { icon: <Salad size={18} />, text: 'Fitness enthusiasts' },
      { icon: <Users size={18} />, text: 'Heart health conscious' },
    ],
    nutritionalInfo: {
      calories: '42 per 100ml',
      protein: '3.4g per 100ml',
      calcium: '125mg per 100ml',
      vitaminD: '40IU per 100ml',
    },
    color: 'bg-green-50',
    iconColor: 'text-green-500',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
  {
    id: 'full-cream',
    name: 'Full Cream',
    fatPercentage: '6.0%',
    snfPercentage: '9.0%',
    description: 'Our premium full cream milk offers a rich, creamy texture and exceptional taste, perfect for coffee, cooking, and daily enjoyment.',
    benefits: [
      'Rich and creamy texture ideal for barista-style coffee',
      'Superior taste for desserts and creamy sauces',
      'Higher fat-soluble vitamin content (A, D, E, K)',
    ],
    recommendedFor: [
      { icon: <Baby size={18} />, text: 'Growing children' },
      { icon: <ChefHat size={18} />, text: 'Culinary experts' },
      { icon: <Info size={18} />, text: 'Energy-dense needs' },
    ],
    nutritionalInfo: {
      calories: '89 per 100ml',
      protein: '3.3g per 100ml',
      calcium: '118mg per 100ml',
      vitaminD: '44IU per 100ml',
    },
    color: 'bg-amber-50',
    iconColor: 'text-amber-500',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
  },
];

const MilkTypes = () => {
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
              Our Milk Types
              <motion.div 
                className="absolute w-full h-1 bg-lushmilk-terracotta bottom-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.5 }}
              ></motion.div>
            </h1>
            <p className="text-lushmilk-brown text-lg max-w-2xl mx-auto">
              Explore our different milk varieties, each with unique properties and benefits to suit your specific needs
            </p>
          </motion.div>

          <div className="mb-16">
            <Tabs defaultValue="farm-fresh" className="w-full">
              <TabsList className="w-full max-w-2xl mx-auto mb-8 bg-lushmilk-cream/20 grid grid-cols-3">
                {milkTypes.map((type) => (
                  <TabsTrigger 
                    key={type.id}
                    value={type.id}
                    className="data-[state=active]:bg-lushmilk-terracotta data-[state=active]:text-white"
                  >
                    {type.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {milkTypes.map((type, index) => (
                <TabsContent key={type.id} value={type.id} className="focus-visible:outline-none focus-visible:ring-0">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center mb-8">
                      <div className="rounded-lg overflow-hidden h-64 md:h-96">
                        <img src={type.image} alt={type.name} className="w-full h-full object-cover" />
                      </div>
                      
                      <div>
                        <div className="flex items-center mb-4">
                          <h2 className="text-3xl font-serif font-bold text-lushmilk-brown">{type.name} Milk</h2>
                          <div className="ml-4 flex gap-2">
                            <Badge className="bg-lushmilk-cream/40 text-lushmilk-brown border-lushmilk-cream">
                              {type.fatPercentage} Fat
                            </Badge>
                            <Badge className="bg-lushmilk-cream/40 text-lushmilk-brown border-lushmilk-cream">
                              {type.snfPercentage} SNF
                            </Badge>
                          </div>
                        </div>
                        
                        <p className="text-lushmilk-charcoal/90 mb-6 text-lg">
                          {type.description}
                        </p>
                        
                        <div className="mb-6">
                          <h3 className="text-lushmilk-brown font-semibold mb-3 flex items-center">
                            <Award className="mr-2 text-lushmilk-terracotta" size={20} />
                            Key Benefits
                          </h3>
                          <ul className="space-y-2">
                            {type.benefits.map((benefit, idx) => (
                              <li key={idx} className="flex items-start">
                                <div className="h-5 w-5 rounded-full bg-lushmilk-terracotta/10 flex items-center justify-center mr-2 mt-0.5">
                                  <span className="text-lushmilk-terracotta text-xs">•</span>
                                </div>
                                <span className="text-lushmilk-charcoal/80">{benefit}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div className="mb-6">
                          <h3 className="text-lushmilk-brown font-semibold mb-3 flex items-center">
                            <Users className="mr-2 text-lushmilk-terracotta" size={20} />
                            Recommended For
                          </h3>
                          <div className="flex flex-wrap gap-3">
                            {type.recommendedFor.map((item, idx) => (
                              <Badge key={idx} variant="outline" className="py-1.5 bg-lushmilk-cream/10">
                                <span className="mr-1.5 text-lushmilk-terracotta">{item.icon}</span>
                                {item.text}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        <Button 
                          asChild
                          className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
                        >
                          <Link to="/catalog" className="flex items-center gap-2">
                            Order {type.name} Milk
                          </Link>
                        </Button>
                      </div>
                    </div>
                    
                    <Card className={`${type.color} border border-lushmilk-cream/30`}>
                      <CardHeader>
                        <CardTitle className="text-xl font-serif text-lushmilk-brown flex items-center">
                          <Droplet className={`h-5 w-5 mr-2 ${type.iconColor}`} />
                          Nutritional Information (per 100ml)
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-3 rounded-lg bg-white/50 border border-lushmilk-cream/20">
                            <div className="text-lushmilk-terracotta font-bold text-lg">{type.nutritionalInfo.calories}</div>
                            <div className="text-lushmilk-charcoal/70 text-sm">Calories</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/50 border border-lushmilk-cream/20">
                            <div className="text-lushmilk-terracotta font-bold text-lg">{type.nutritionalInfo.protein}</div>
                            <div className="text-lushmilk-charcoal/70 text-sm">Protein</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/50 border border-lushmilk-cream/20">
                            <div className="text-lushmilk-terracotta font-bold text-lg">{type.nutritionalInfo.calcium}</div>
                            <div className="text-lushmilk-charcoal/70 text-sm">Calcium</div>
                          </div>
                          <div className="text-center p-3 rounded-lg bg-white/50 border border-lushmilk-cream/20">
                            <div className="text-lushmilk-terracotta font-bold text-lg">{type.nutritionalInfo.vitaminD}</div>
                            <div className="text-lushmilk-charcoal/70 text-sm">Vitamin D</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </TabsContent>
              ))}
            </Tabs>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16"
          >
            <Card className="border border-lushmilk-cream/30">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-serif text-lushmilk-brown">
                  Understanding Milk Composition
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif text-lushmilk-brown mb-2 flex items-center">
                      <span className="flex h-8 w-8 rounded-full bg-lushmilk-terracotta text-white items-center justify-center mr-2">F</span>
                      Fat Content
                    </h3>
                    <p className="text-lushmilk-charcoal/80">
                      Fat content refers to the percentage of milk fat in the liquid. Higher fat content gives milk a creamier taste and texture, while also providing fat-soluble vitamins (A, D, E, and K).
                    </p>
                    <ul className="space-y-2">
                      <li className="text-lushmilk-charcoal/80 flex items-start">
                        <span className="text-lushmilk-terracotta mr-2">•</span>
                        <span><strong>Low fat (1.5%)</strong>: Lower calories, lighter taste</span>
                      </li>
                      <li className="text-lushmilk-charcoal/80 flex items-start">
                        <span className="text-lushmilk-terracotta mr-2">•</span>
                        <span><strong>Regular (3.5%)</strong>: Balanced taste and nutrition</span>
                      </li>
                      <li className="text-lushmilk-charcoal/80 flex items-start">
                        <span className="text-lushmilk-terracotta mr-2">•</span>
                        <span><strong>Full cream (6.0%)</strong>: Rich flavor, ideal for cooking</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-xl font-serif text-lushmilk-brown mb-2 flex items-center">
                      <span className="flex h-8 w-8 rounded-full bg-lushmilk-terracotta text-white items-center justify-center mr-2">S</span>
                      SNF (Solid-Not-Fat)
                    </h3>
                    <p className="text-lushmilk-charcoal/80">
                      SNF refers to all the solid components in milk excluding fat. This includes proteins, lactose, minerals, and vitamins. Higher SNF indicates more nutritional value beyond just fat content.
                    </p>
                    <ul className="space-y-2">
                      <li className="text-lushmilk-charcoal/80 flex items-start">
                        <span className="text-lushmilk-terracotta mr-2">•</span>
                        <span><strong>8.5% SNF</strong>: Standard nutritional profile</span>
                      </li>
                      <li className="text-lushmilk-charcoal/80 flex items-start">
                        <span className="text-lushmilk-terracotta mr-2">•</span>
                        <span><strong>9.0% SNF</strong>: Higher protein and mineral content</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div 
            className="mt-16 p-8 bg-lushmilk-cream/20 rounded-lg shadow-sm border border-lushmilk-cream/30 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">
              Ready to Experience the Difference?
            </h2>
            <p className="text-lushmilk-brown text-lg mb-6 max-w-2xl mx-auto">
              Choose the milk that's right for you and your family. All our varieties are sourced ethically, 
              tested rigorously, and delivered fresh to your doorstep.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                asChild
                className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white"
              >
                <Link to="/catalog">
                  View Our Catalog
                </Link>
              </Button>
              <Button 
                asChild
                variant="outline"
                className="border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10"
              >
                <Link to="/blog">
                  Read Our Milk Blog
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default MilkTypes;
