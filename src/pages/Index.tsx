import React from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Star, ArrowRight, Users, ShoppingCart, Calendar, MapPin } from 'lucide-react';
import SouthIndianHero from '@/components/SouthIndianHero';
import CulturalBackground from '@/components/CulturalBackground';
import MapComponent from '@/components/MapComponent';
const Index = () => {
  return <Layout>
      {/* Hero Section */}
      <SouthIndianHero title="LushMilk – The Taste of Purity" subtitle="Experience the goodness of farm-fresh milk, delivered directly to your doorstep." ctaText="Order Now" ctaLink="/products" secondaryCtaText="Learn More" secondaryCtaLink="/about" backgroundImage="https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=2070&auto=format&fit=crop" />

      {/* About Section */}
      <CulturalBackground variant="kolam">
        <section className="section-padding bg-lushmilk-offwhite">
          <div className="container mx-auto bg-white/[0.31]">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Our Story</h2>
              <p className="text-lushmilk-charcoal/80 text-lg">
                LushMilk began with a simple vision – to deliver pure, farm-fresh milk to urban households while supporting local South Indian farmers. Our journey has been built on trust, quality, and tradition.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="feature-card text-center">
                <div className="w-16 h-16 bg-lushmilk-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="text-lushmilk-terracotta" size={24} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Farmer Connect</h3>
                <p className="text-lushmilk-charcoal/80">
                  We partner directly with over 100 local farmers, ensuring fair compensation and sustainable farming practices.
                </p>
              </div>
              
              <div className="feature-card text-center">
                <div className="w-16 h-16 bg-lushmilk-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingCart className="text-lushmilk-terracotta" size={24} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Quality Process</h3>
                <p className="text-lushmilk-charcoal/80">
                  Our milk undergoes stringent quality checks while maintaining its natural goodness, with no additives or preservatives.
                </p>
              </div>
              
              <div className="feature-card text-center">
                <div className="w-16 h-16 bg-lushmilk-cream rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="text-lushmilk-terracotta" size={24} />
                </div>
                <h3 className="text-xl font-serif font-semibold text-lushmilk-brown mb-2">Daily Delivery</h3>
                <p className="text-lushmilk-charcoal/80">
                  Enjoy fresh milk delivered to your doorstep daily, ensuring you receive the perfect start to your morning.
                </p>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button asChild className="btn-outline">
                <Link to="/about" className="flex items-center gap-2">
                  Read Our Full Story <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </CulturalBackground>

      {/* Products Section */}
      <CulturalBackground variant="temple">
        <section className="section-padding">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Our Milk Products</h2>
              <p className="text-lushmilk-charcoal/80 text-lg">
                We offer a variety of milk options to suit your taste and nutritional needs, sourced from the finest cows and buffaloes.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Product Card 1 */}
              <div className="product-card">
                <div className="h-56 bg-gray-200 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Full Cream Milk" className="w-full h-full object-cover" />
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
                    Rich and creamy milk with full nutritional benefits, perfect for growing children.
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-lushmilk-terracotta font-medium">From ₹60 / liter</span>
                    <Button variant="outline" className="border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta hover:text-white">
                      View
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Product Card 2 */}
              <div className="product-card">
                <div className="h-56 bg-gray-200 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1563636619-e9143da7973b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Organic Milk" className="w-full h-full object-cover" />
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
                  <div className="flex justify-between items-center">
                    <span className="text-lushmilk-terracotta font-medium">From ₹80 / liter</span>
                    <Button variant="outline" className="border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta hover:text-white">
                      View
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Product Card 3 */}
              <div className="product-card">
                <div className="h-56 bg-gray-200 relative overflow-hidden">
                  <img src="https://images.unsplash.com/photo-1628088062854-d1870b4553da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80" alt="Buffalo Milk" className="w-full h-full object-cover" />
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
                  <div className="flex justify-between items-center">
                    <span className="text-lushmilk-terracotta font-medium">From ₹70 / liter</span>
                    <Button variant="outline" className="border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta hover:text-white">
                      View
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-center mt-12">
              <Button asChild className="btn-primary">
                <Link to="/products" className="flex items-center gap-2">
                  View All Products <ArrowRight size={16} />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </CulturalBackground>

      {/* Map Section */}
      <section className="section-padding bg-white">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Where We Operate</h2>
            <p className="text-lushmilk-charcoal/80 text-lg">
              Our farms and distribution centers are strategically located across South India to ensure the freshest dairy products reach your doorstep.
            </p>
          </div>
          
          <div className="rounded-xl overflow-hidden shadow-xl border border-lushmilk-cream/30">
            <MapComponent className="w-full h-[500px]" />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-white p-4 rounded-lg shadow-md border border-lushmilk-cream/20">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-lushmilk-terracotta" size={20} />
                <h3 className="font-semibold text-lushmilk-brown">Bangalore</h3>
              </div>
              <p className="text-sm text-lushmilk-charcoal/80">Main dairy farm with over 500 cows and buffalos</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border border-lushmilk-cream/20">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-lushmilk-terracotta" size={20} />
                <h3 className="font-semibold text-lushmilk-brown">Chennai</h3>
              </div>
              <p className="text-sm text-lushmilk-charcoal/80">Distribution center serving Tamil Nadu region</p>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow-md border border-lushmilk-cream/20">
              <div className="flex items-center gap-3 mb-2">
                <MapPin className="text-lushmilk-terracotta" size={20} />
                <h3 className="font-semibold text-lushmilk-brown">Hyderabad</h3>
              </div>
              <p className="text-sm text-lushmilk-charcoal/80">Processing facility and distribution hub</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <CulturalBackground variant="rangoli">
        <section className="section-padding bg-lushmilk-cream/30">
          <div className="container mx-auto">
            <div className="max-w-3xl mx-auto text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">What Our Customers Say</h2>
              <p className="text-lushmilk-charcoal/80 text-lg">
                Hear from families who have made LushMilk a part of their daily routine.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Testimonial 1 */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                </div>
                <p className="text-lushmilk-charcoal/80 mb-6 italic">
                  "The taste of LushMilk reminds me of my childhood visits to my grandparents' village. Pure, fresh, and full of natural goodness. My kids love it too!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-lushmilk-green/20 rounded-full flex items-center justify-center text-lushmilk-green font-medium">
                    RS
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-lushmilk-brown">Ramya Subramanian</h4>
                    <p className="text-sm text-lushmilk-charcoal/60">Chennai</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 2 */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                </div>
                <p className="text-lushmilk-charcoal/80 mb-6 italic">
                  "As a fitness enthusiast, I'm particular about what I consume. LushMilk's buffalo milk has been perfect for my protein needs. The subscription service is super convenient!"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-lushmilk-green/20 rounded-full flex items-center justify-center text-lushmilk-green font-medium">
                    AK
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-lushmilk-brown">Arun Kumar</h4>
                    <p className="text-sm text-lushmilk-charcoal/60">Bangalore</p>
                  </div>
                </div>
              </div>
              
              {/* Testimonial 3 */}
              <div className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-3">
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                  <Star className="text-yellow-500 fill-yellow-500" size={16} />
                </div>
                <p className="text-lushmilk-charcoal/80 mb-6 italic">
                  "We switched to LushMilk's organic option for our 3-year-old daughter, and we've noticed a positive difference in her health. The traditional South Indian values of the brand resonate with our family."
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-lushmilk-green/20 rounded-full flex items-center justify-center text-lushmilk-green font-medium">
                    VJ
                  </div>
                  <div className="ml-3">
                    <h4 className="font-medium text-lushmilk-brown">Vishal Jayaraman</h4>
                    <p className="text-sm text-lushmilk-charcoal/60">Coimbatore</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </CulturalBackground>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-lushmilk-terracotta text-white text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Experience Pure Goodness?</h2>
          <p className="text-xl mb-8 text-white/90">
            Join thousands of families who start their day with LushMilk.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild className="bg-white text-lushmilk-terracotta hover:bg-lushmilk-cream">
              <Link to="/products">Order Now</Link>
            </Button>
            <Button asChild variant="outline" className="border-white text-white hover:bg-white/20">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>;
};
export default Index;