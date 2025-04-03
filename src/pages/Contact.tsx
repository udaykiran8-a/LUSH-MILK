
import React from 'react';
import Layout from '../components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

const Contact = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-32 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-lushmilk-brown/5 kolam-pattern"></div>
        <div className="container mx-auto relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-lushmilk-brown mb-6">Contact Us</h1>
            <p className="text-xl text-lushmilk-charcoal/80 mb-8">
              We'd love to hear from you! Reach out with questions, feedback, or to place an order.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-lushmilk-brown mb-6">Get in Touch</h2>
              <p className="text-lushmilk-charcoal/80 mb-8">
                Have questions about our products, delivery areas, or anything else? Fill out the form and our team will get back to you as soon as possible.
              </p>
              
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-lushmilk-charcoal font-medium mb-2">Your Name</label>
                    <Input 
                      id="name" 
                      type="text" 
                      placeholder="Enter your name" 
                      className="border-lushmilk-cream focus:border-lushmilk-terracotta"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-lushmilk-charcoal font-medium mb-2">Email Address</label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="Enter your email" 
                      className="border-lushmilk-cream focus:border-lushmilk-terracotta"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="phone" className="block text-lushmilk-charcoal font-medium mb-2">Phone Number</label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="Enter your phone number" 
                    className="border-lushmilk-cream focus:border-lushmilk-terracotta"
                  />
                </div>
                
                <div>
                  <label htmlFor="subject" className="block text-lushmilk-charcoal font-medium mb-2">Subject</label>
                  <Input 
                    id="subject" 
                    type="text" 
                    placeholder="What is this regarding?" 
                    className="border-lushmilk-cream focus:border-lushmilk-terracotta"
                  />
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-lushmilk-charcoal font-medium mb-2">Your Message</label>
                  <Textarea 
                    id="message" 
                    placeholder="Type your message here" 
                    className="border-lushmilk-cream focus:border-lushmilk-terracotta min-h-[150px]"
                  />
                </div>
                
                <Button className="bg-lushmilk-terracotta hover:bg-lushmilk-brown w-full md:w-auto">
                  Send Message
                </Button>
              </form>
            </div>
            
            <div>
              <div className="bg-lushmilk-cream/30 p-8 rounded-lg h-full">
                <h2 className="text-3xl font-bold text-lushmilk-brown mb-6">Contact Information</h2>
                
                <div className="space-y-8">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-lushmilk-terracotta/10 rounded-full flex items-center justify-center mr-4">
                      <Phone className="text-lushmilk-terracotta" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-lushmilk-brown mb-1">Phone</h3>
                      <p className="text-lushmilk-charcoal/80">Customer Support: +91 9876543210</p>
                      <p className="text-lushmilk-charcoal/80">Order Helpline: +91 9876543211</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-lushmilk-terracotta/10 rounded-full flex items-center justify-center mr-4">
                      <Mail className="text-lushmilk-terracotta" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-lushmilk-brown mb-1">Email</h3>
                      <p className="text-lushmilk-charcoal/80">Customer Support: support@lushmilk.com</p>
                      <p className="text-lushmilk-charcoal/80">Orders & Inquiries: orders@lushmilk.com</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-lushmilk-terracotta/10 rounded-full flex items-center justify-center mr-4">
                      <MapPin className="text-lushmilk-terracotta" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-lushmilk-brown mb-1">Our Office</h3>
                      <p className="text-lushmilk-charcoal/80">
                        123 Milk Valley, Coimbatore,<br />
                        Tamil Nadu, India - 641001
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-lushmilk-terracotta/10 rounded-full flex items-center justify-center mr-4">
                      <Clock className="text-lushmilk-terracotta" size={20} />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-lushmilk-brown mb-1">Operating Hours</h3>
                      <p className="text-lushmilk-charcoal/80">Monday - Saturday: 8AM - 8PM</p>
                      <p className="text-lushmilk-charcoal/80">Sunday: 8AM - 2PM</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-10">
                  <h3 className="text-lg font-medium text-lushmilk-brown mb-4">Connect With Us</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="w-10 h-10 bg-lushmilk-brown text-white rounded-full flex items-center justify-center hover:bg-lushmilk-terracotta transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-lushmilk-brown text-white rounded-full flex items-center justify-center hover:bg-lushmilk-terracotta transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
                    </a>
                    <a href="#" className="w-10 h-10 bg-lushmilk-brown text-white rounded-full flex items-center justify-center hover:bg-lushmilk-terracotta transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-youtube"><path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"/><path d="m10 15 5-3-5-3z"/></svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Store Locator Section */}
      <section className="section-padding bg-lushmilk-offwhite">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Store Locator</h2>
            <p className="text-lushmilk-charcoal/80 text-lg">
              Find LushMilk stores and collection points near you.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-300 rounded-lg overflow-hidden">
              {/* Placeholder for map */}
              <div className="w-full h-full flex items-center justify-center bg-lushmilk-brown/10 text-lushmilk-charcoal/60">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2" size={32} />
                  <p>Interactive Map Will Load Here</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-lushmilk-brown mb-4">Our Locations</h3>
              
              <div className="space-y-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-lushmilk-brown mb-2">LushMilk Main Store - Coimbatore</h4>
                  <p className="text-lushmilk-charcoal/80 mb-2">123 Milk Valley, Coimbatore, Tamil Nadu - 641001</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-lushmilk-green">Open Now</span>
                    <span className="text-lushmilk-charcoal/60">8AM - 8PM</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-lushmilk-brown mb-2">LushMilk Store - Chennai</h4>
                  <p className="text-lushmilk-charcoal/80 mb-2">456 Gandhi Street, Chennai, Tamil Nadu - 600028</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-lushmilk-green">Open Now</span>
                    <span className="text-lushmilk-charcoal/60">8AM - 8PM</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-lushmilk-brown mb-2">LushMilk Store - Bangalore</h4>
                  <p className="text-lushmilk-charcoal/80 mb-2">789 MG Road, Bangalore, Karnataka - 560001</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-lushmilk-green">Open Now</span>
                    <span className="text-lushmilk-charcoal/60">8AM - 8PM</span>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <h4 className="font-medium text-lushmilk-brown mb-2">LushMilk Store - Madurai</h4>
                  <p className="text-lushmilk-charcoal/80 mb-2">321 Temple Road, Madurai, Tamil Nadu - 625001</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-lushmilk-green">Open Now</span>
                    <span className="text-lushmilk-charcoal/60">8AM - 8PM</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="section-padding">
        <div className="container mx-auto">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-lushmilk-brown mb-4">Frequently Asked Questions</h2>
            <p className="text-lushmilk-charcoal/80 text-lg">
              Find answers to our most commonly asked questions.
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-lushmilk-brown mb-2">What areas do you deliver to?</h3>
              <p className="text-lushmilk-charcoal/80">
                We currently deliver to most areas in Coimbatore, Chennai, Bangalore, and Madurai. Enter your pincode on the order page to check if we deliver to your location.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-lushmilk-brown mb-2">How fresh is your milk?</h3>
              <p className="text-lushmilk-charcoal/80">
                Our milk is collected from farms daily and delivered to you within 24 hours of collection, ensuring you receive the freshest milk possible.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-lushmilk-brown mb-2">Can I pause my subscription?</h3>
              <p className="text-lushmilk-charcoal/80">
                Yes, you can easily pause, modify, or cancel your subscription through your account dashboard or by contacting our customer service team.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-lushmilk-brown mb-2">What if I'm not home for delivery?</h3>
              <p className="text-lushmilk-charcoal/80">
                You can specify a safe place for our delivery team to leave your milk, or reschedule the delivery for a time when you'll be home.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-lushmilk-brown mb-2">How do you ensure milk quality?</h3>
              <p className="text-lushmilk-charcoal/80">
                We perform multiple quality checks at the farm level, during collection, processing, and before delivery to ensure you receive only the highest quality milk.
              </p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-xl font-medium text-lushmilk-brown mb-2">What payment methods do you accept?</h3>
              <p className="text-lushmilk-charcoal/80">
                We accept UPI, credit/debit cards, digital wallets, and cash on delivery (COD) for your convenience.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-lushmilk-terracotta text-white text-center">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Start Your LushMilk Journey?</h2>
          <p className="text-xl mb-8 text-white/90">
            Experience the taste of farm-fresh milk delivered to your doorstep.
          </p>
          <Button asChild className="bg-white text-lushmilk-terracotta hover:bg-lushmilk-cream">
            <a href="#">Get Started Today</a>
          </Button>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
