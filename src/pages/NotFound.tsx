
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowLeft, Search } from 'lucide-react';
import Layout from '../components/Layout';

const NotFound = () => {
  return (
    <Layout>
      <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white via-lushmilk-cream/5 to-white">
        <motion.div
          className="w-full max-w-md text-center space-y-6 bg-white p-8 rounded-xl shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="mx-auto w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
              <Search className="h-12 w-12 text-lushmilk-terracotta opacity-70" />
            </div>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold text-lushmilk-brown mb-2">404</h1>
            <h2 className="text-2xl font-medium text-lushmilk-brown mb-4">Page Not Found</h2>
            <p className="text-lushmilk-charcoal mb-8">
              Oops! The page you are looking for doesn't exist or has been moved.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-3"
          >
            <Button asChild className="w-full bg-lushmilk-terracotta">
              <Link to="/" className="inline-flex items-center">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Home
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/products">Browse Products</Link>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default NotFound;
