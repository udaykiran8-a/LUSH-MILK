import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, ShoppingCart, Check, Leaf, Droplet } from 'lucide-react';

const ProductCard = ({ product }: { product: any }) => {
  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{product.name}</CardTitle>
        <CardDescription>{product.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-4" />
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">{product.category}</Badge>
          <div className="flex items-center">
            <Star className="mr-1 h-5 w-5 text-yellow-500" />
            <span>{product.rating}</span>
          </div>
        </div>
        <p className="text-gray-700">${product.price}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center">
        <Button className="bg-lushmilk-terracotta hover:bg-lushmilk-brown text-white transition-colors flex items-center gap-2">
          <ShoppingCart size={16} />
          <span>Add to Cart</span>
        </Button>
      </CardFooter>
    </Card>
  );
};

const ProductFeatures = () => {
  return (
    <Tabs defaultValue="benefits" className="w-full">
      <TabsList>
        <TabsTrigger value="benefits">Benefits</TabsTrigger>
        <TabsTrigger value="quality">Quality</TabsTrigger>
        <TabsTrigger value="sustainability">Sustainability</TabsTrigger>
      </TabsList>
      <TabsContent value="benefits">
        <div className="space-y-4">
          <p className="text-gray-800">
            Our milk is packed with essential nutrients, vitamins, and minerals, providing a natural energy boost and supporting overall health.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Rich in Calcium for strong bones and teeth</li>
            <li>High in Protein for muscle development and repair</li>
            <li>Source of Vitamin D for immune support</li>
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="quality">
        <div className="space-y-4">
          <p className="text-gray-800">
            We adhere to the highest quality standards, ensuring that our milk is pure, fresh, and free from additives and preservatives.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Sourced from local South Indian farms</li>
            <li>No artificial hormones or antibiotics</li>
            <li>Regularly tested for purity and freshness <Check className="inline-block h-4 w-4 text-green-500 ml-1" /></li>
          </ul>
        </div>
      </TabsContent>
      <TabsContent value="sustainability">
        <div className="space-y-4">
          <p className="text-gray-800">
            We are committed to sustainable farming practices that protect the environment and support local communities.
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Eco-friendly packaging <Leaf className="inline-block h-4 w-4 text-green-500 ml-1" /></li>
            <li>Reduced carbon footprint</li>
            <li>Support for local farmers and their families</li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  );
};

const Products = () => {
  const products = [
    {
      id: 1,
      name: "Full Cream Milk",
      description: "Rich and creamy, perfect for all your culinary needs.",
      image: "https://via.placeholder.com/400x300",
      category: "Cow Milk",
      rating: 4.5,
      price: 3.50,
    },
    {
      id: 2,
      name: "Toned Milk",
      description: "Light and refreshing, ideal for everyday consumption.",
      image: "https://via.placeholder.com/400x300",
      category: "Cow Milk",
      rating: 4.2,
      price: 2.80,
    },
    {
      id: 3,
      name: "Organic Milk",
      description: "Certified organic, sourced from sustainable farms.",
      image: "https://via.placeholder.com/400x300",
      category: "Cow Milk",
      rating: 4.8,
      price: 4.50,
    },
    {
      id: 4,
      name: "Buffalo Milk",
      description: "Thick and nutritious, a traditional favorite.",
      image: "https://via.placeholder.com/400x300",
      category: "Buffalo Milk",
      rating: 4.6,
      price: 4.00,
    },
  ];

  return (
    <Layout>
      <section className="bg-lushmilk-offwhite py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-serif font-bold text-lushmilk-brown text-center mb-8">
            Our Products
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown text-center mb-8">
            Why Choose LushMilk?
          </h2>
          <ProductFeatures />
        </div>
      </section>

      <section className="bg-lushmilk-cream py-12">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">
            Ready to Experience the Taste of Purity?
          </h2>
          <p className="text-gray-800 mb-6">
            Order now and get farm-fresh milk delivered to your doorstep.
          </p>
          <Button className="bg-lushmilk-terracotta hover:bg-lushmilk-brown text-white transition-colors flex items-center justify-center gap-2">
            <ShoppingCart size={18} />
            <span>Order Now</span>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Products;
