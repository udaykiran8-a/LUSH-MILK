
import React from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Users, ArrowRight } from 'lucide-react';

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-lushmilk-brown/10 kolam-pattern"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-lushmilk-brown mb-6">Our Story</h1>
            <p className="text-xl text-lushmilk-charcoal/80 mb-8">
              From a small family-run dairy to a trusted milk brand across South India, our journey has been built on trust, quality, and tradition.
            </p>
          </div>
        </div>
      </section>

      {/* Our Journey Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://images.unsplash.com/photo-1529686342540-1b43aec0df75?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Traditional milk collection" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-lushmilk-brown mb-4">Our Journey</h2>
              <p className="text-lushmilk-charcoal/80 mb-4">
                LushMilk began in 2010 as a small dairy operation in Tamil Nadu, founded by Mr. Raghavan, a third-generation dairy farmer with a passion for preserving traditional farming methods while embracing modern quality standards.
              </p>
              <p className="text-lushmilk-charcoal/80 mb-4">
                What started with just five farmers and local deliveries in Coimbatore has now grown to a network of over 100 farmers across South India, serving thousands of families with pure, farm-fresh milk.
              </p>
              <p className="text-lushmilk-charcoal/80 mb-6">
                Despite our growth, we've stayed true to our core values – ethical sourcing, farmer welfare, and delivering pure milk without additives or preservatives.
              </p>
              <div className="space-y-3">
                <div className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-lushmilk-cream flex items-center justify-center text-lushmilk-terracotta mr-3 mt-1">✓</span>
                  <p className="text-lushmilk-charcoal/80">Founded in 2010 in Tamil Nadu</p>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-lushmilk-cream flex items-center justify-center text-lushmilk-terracotta mr-3 mt-1">✓</span>
                  <p className="text-lushmilk-charcoal/80">Network of 100+ farmers across South India</p>
                </div>
                <div className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-lushmilk-cream flex items-center justify-center text-lushmilk-terracotta mr-3 mt-1">✓</span>
                  <p className="text-lushmilk-charcoal/80">Committed to preservative-free milk products</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="section-padding bg-lushmilk-offwhite">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Our Vision & Mission</h2>
            <p className="text-lushmilk-charcoal/80 text-lg">
              Guided by our commitment to purity and sustainability, we're on a mission to transform how South India experiences milk.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">Our Vision</h3>
              <p className="text-lushmilk-charcoal/80 mb-4">
                To be South India's most trusted dairy brand, known for our unwavering commitment to purity, farmer welfare, and sustainable practices.
              </p>
              <p className="text-lushmilk-charcoal/80">
                We envision a future where every family has access to pure, ethically-sourced milk that preserves traditional farming while embracing innovation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h3 className="text-2xl font-serif font-semibold text-lushmilk-brown mb-4">Our Mission</h3>
              <ul className="space-y-3 text-lushmilk-charcoal/80">
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-lushmilk-cream flex items-center justify-center text-lushmilk-terracotta mr-3 mt-1">1</span>
                  <p>Deliver pure, preservative-free milk to urban households</p>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-lushmilk-cream flex items-center justify-center text-lushmilk-terracotta mr-3 mt-1">2</span>
                  <p>Support local farmers with fair compensation and training</p>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-lushmilk-cream flex items-center justify-center text-lushmilk-terracotta mr-3 mt-1">3</span>
                  <p>Implement sustainable practices at every stage of production</p>
                </li>
                <li className="flex items-start">
                  <span className="w-6 h-6 rounded-full bg-lushmilk-cream flex items-center justify-center text-lushmilk-terracotta mr-3 mt-1">4</span>
                  <p>Preserve traditional South Indian dairy heritage</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Farmer Connect Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Farmer Connect</h2>
            <p className="text-lushmilk-charcoal/80 text-lg">
              Meet the hardworking farmers who supply LushMilk with the finest quality milk.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Farmer 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1602602465138-e5886abf76fe?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Farmer Murugan" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Murugan Selvaraj</h3>
                <p className="text-lushmilk-green mb-3 font-medium">Coimbatore, Tamil Nadu</p>
                <p className="text-lushmilk-charcoal/80">
                  A second-generation dairy farmer with over 30 years of experience, Murugan manages a herd of 25 indigenous cows using traditional farming methods.
                </p>
              </div>
            </div>
            
            {/* Farmer 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1595981234058-a9302fb97229?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Farmer Lakshmi" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Lakshmi Narayanan</h3>
                <p className="text-lushmilk-green mb-3 font-medium">Salem, Tamil Nadu</p>
                <p className="text-lushmilk-charcoal/80">
                  One of our first farmer partners, Lakshmi specializes in organic milk production and mentors new farmers joining our network.
                </p>
              </div>
            </div>
            
            {/* Farmer 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="h-64 bg-gray-200">
                <img 
                  src="https://images.unsplash.com/photo-1621153359254-1708dffdca49?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                  alt="Farmer Rajesh" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Rajesh Kumar</h3>
                <p className="text-lushmilk-green mb-3 font-medium">Madurai, Tamil Nadu</p>
                <p className="text-lushmilk-charcoal/80">
                  Rajesh manages a buffalo farm and has won several awards for his innovative approach to sustainable dairy farming.
                </p>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <Button asChild className="btn-primary flex items-center gap-2 mx-auto">
              <a href="#">
                Meet All Our Farmers <ArrowRight size={16} />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* South Indian Cultural Touch */}
      <section className="section-padding bg-lushmilk-brown text-white">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">South Indian Heritage</h2>
              <p className="text-white/90 mb-4">
                Our roots run deep in South Indian culture, where milk holds a sacred place in daily life, festivals, and traditional cuisine.
              </p>
              <p className="text-white/90 mb-6">
                From the traditional brass vessels used to collect milk to the age-old quality testing methods, we preserve our cultural heritage while delivering milk to modern households.
              </p>
              <h3 className="text-xl font-medium mb-3">Festival Specials</h3>
              <div className="space-y-2 mb-6">
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-lushmilk-cream mr-2"></span>
                  <p>Special Pongal celebration packs</p>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-lushmilk-cream mr-2"></span>
                  <p>Traditional milk sweets for Deepavali</p>
                </div>
                <div className="flex items-center">
                  <span className="w-2 h-2 rounded-full bg-lushmilk-cream mr-2"></span>
                  <p>Onam special milk payasam kits</p>
                </div>
              </div>
              <Button asChild className="bg-white text-lushmilk-brown hover:bg-lushmilk-cream">
                <Link to="/products">Explore Seasonal Products</Link>
              </Button>
            </div>
            <div>
              <img 
                src="https://images.unsplash.com/photo-1623228675987-57d5999f6c7f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" 
                alt="Traditional South Indian brass vessel" 
                className="rounded-lg shadow-lg w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-lushmilk-cream/50 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="bg-white p-10 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold text-lushmilk-brown mb-4">Join the LushMilk Family</h2>
            <p className="text-lushmilk-charcoal/80 text-lg mb-8">
              Experience the difference of farm-fresh milk delivered to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button asChild className="btn-primary">
                <Link to="/products">Start Your Subscription</Link>
              </Button>
              <Button asChild variant="outline" className="btn-outline">
                <Link to="/contact">Contact Our Team</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
