
import React from 'react';
import Layout from '@/components/Layout';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, BookOpen } from 'lucide-react';

const blogPosts = [
  {
    id: 'understanding-snf',
    title: 'Understanding SNF (Solids-Not-Fat) in Milk',
    summary: 'Learn about the importance of SNF in milk and how it affects taste, nutrition, and quality.',
    date: 'April 5, 2025',
    readTime: '5 min read',
    category: 'Education',
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    featured: true,
  },
  {
    id: 'health-benefits',
    title: 'The Complete Health Benefits of Fresh Milk',
    summary: 'Explore the numerous health benefits of including fresh milk in your daily diet, from bone health to immune support.',
    date: 'April 2, 2025',
    readTime: '7 min read',
    category: 'Nutrition',
    image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    featured: false,
  },
  {
    id: 'storing-fresh-milk',
    title: 'How to Properly Store Fresh Milk',
    summary: 'Tips and best practices for storing fresh milk to maintain its taste, freshness, and nutritional value for longer.',
    date: 'March 28, 2025',
    readTime: '4 min read',
    category: 'Tips',
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    featured: false,
  },
  {
    id: 'milk-for-children',
    title: 'Choosing the Right Milk for Your Children',
    summary: "A guide for parents on selecting the best milk variety based on children's age, dietary needs, and health considerations.",
    date: 'March 20, 2025',
    readTime: '6 min read',
    category: 'Parenting',
    image: 'https://images.unsplash.com/photo-1629393940600-8fc3d3379255?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    featured: false,
  },
  {
    id: 'farm-to-table',
    title: 'Our Farm-to-Table Process',
    summary: 'Take a journey through our ethical sourcing and delivery process, from farm collection to doorstep delivery.',
    date: 'March 15, 2025',
    readTime: '8 min read',
    category: 'Behind the Scenes',
    image: 'https://images.unsplash.com/photo-1516732799352-a685633f8249?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    featured: false,
  },
  {
    id: 'cooking-with-milk',
    title: 'Cooking with Different Milk Types',
    summary: 'Discover how different milk varieties can enhance your cooking and baking with recipes and techniques.',
    date: 'March 8, 2025',
    readTime: '10 min read',
    category: 'Recipes',
    image: 'https://images.unsplash.com/photo-1515823662972-da6a2e4d3d4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVuZDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    featured: false,
  },
];

const categories = [
  'All',
  'Education',
  'Nutrition',
  'Tips',
  'Parenting',
  'Recipes',
  'Behind the Scenes',
];

const Blog = () => {
  const [activeCategory, setActiveCategory] = React.useState('All');
  
  const filteredPosts = activeCategory === 'All' 
    ? blogPosts 
    : blogPosts.filter(post => post.category === activeCategory);
  
  const featuredPost = blogPosts.find(post => post.featured);
  
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
              The Milk Blog
              <motion.div 
                className="absolute w-full h-1 bg-lushmilk-terracotta bottom-0 left-0 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ delay: 0.5, duration: 0.5 }}
              ></motion.div>
            </h1>
            <p className="text-lushmilk-brown text-lg max-w-2xl mx-auto">
              Explore our educational resources to learn more about milk, nutrition, and our sustainable farming practices
            </p>
          </motion.div>
          
          {featuredPost && (
            <motion.div 
              className="mb-16"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative rounded-lg overflow-hidden">
                <img 
                  src={featuredPost.image} 
                  alt={featuredPost.title} 
                  className="w-full h-[400px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-8">
                  <Badge className="mb-3 bg-lushmilk-terracotta text-white border-none self-start">
                    Featured Article
                  </Badge>
                  <h2 className="text-3xl font-serif font-bold text-white mb-3">{featuredPost.title}</h2>
                  <p className="text-white/80 text-lg mb-4 max-w-2xl">{featuredPost.summary}</p>
                  <div className="flex items-center text-white/70 mb-4">
                    <Calendar size={16} className="mr-2" />
                    <span className="mr-4">{featuredPost.date}</span>
                    <Clock size={16} className="mr-2" />
                    <span>{featuredPost.readTime}</span>
                  </div>
                  <Button 
                    asChild
                    className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white w-fit"
                  >
                    <Link to={`/blog/${featuredPost.id}`} className="flex items-center gap-2">
                      Read Article <ChevronRight size={16} />
                    </Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
          
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Badge
                key={category}
                className={`cursor-pointer px-4 py-2 ${
                  activeCategory === category
                    ? 'bg-lushmilk-terracotta text-white'
                    : 'bg-lushmilk-cream/20 text-lushmilk-brown hover:bg-lushmilk-cream/40'
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </Badge>
            ))}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {filteredPosts
              .filter(post => !post.featured || activeCategory !== 'All')
              .map((post, index) => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                >
                  <Card className="h-full flex flex-col border-lushmilk-cream/30 hover:border-lushmilk-terracotta/30 transition-colors">
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="w-full h-full object-cover transition-transform hover:scale-105 duration-500"
                      />
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center mb-2">
                        <Badge variant="outline" className="bg-lushmilk-cream/10 text-lushmilk-brown border-lushmilk-cream/30">
                          {post.category}
                        </Badge>
                        <div className="flex items-center text-lushmilk-charcoal/60 text-sm">
                          <Clock size={14} className="mr-1" />
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-serif text-lushmilk-brown">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <p className="text-lushmilk-charcoal/80 text-sm">
                        {post.summary}
                      </p>
                    </CardContent>
                    <CardFooter className="pt-0">
                      <div className="w-full flex items-center justify-between">
                        <div className="text-lushmilk-charcoal/60 text-sm flex items-center">
                          <Calendar size={14} className="mr-1" />
                          <span>{post.date}</span>
                        </div>
                        <Button 
                          asChild 
                          variant="ghost" 
                          className="p-0 h-auto text-lushmilk-terracotta hover:text-lushmilk-terracotta/80 hover:bg-transparent"
                        >
                          <Link to={`/blog/${post.id}`} className="flex items-center gap-1">
                            Read more <ChevronRight size={14} />
                          </Link>
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
          </div>
          
          <motion.div 
            className="mt-16 p-8 bg-lushmilk-cream/20 rounded-lg shadow-sm border border-lushmilk-cream/30 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <BookOpen className="h-12 w-12 text-lushmilk-terracotta mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">
              Want to Learn More?
            </h2>
            <p className="text-lushmilk-brown text-lg mb-6 max-w-2xl mx-auto">
              Subscribe to our newsletter for weekly articles on milk nutrition, 
              sustainable farming practices, and exclusive recipes.
            </p>
            <div className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-grow px-4 py-2 border border-lushmilk-cream rounded-lg focus:outline-none focus:ring-2 focus:ring-lushmilk-terracotta/50"
                />
                <Button className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white">
                  Subscribe
                </Button>
              </div>
              <p className="text-lushmilk-charcoal/60 text-xs mt-2">
                By subscribing, you agree to receive our newsletter. You can unsubscribe at any time.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
