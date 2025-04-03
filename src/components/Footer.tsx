
import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-lushmilk-offwhite pt-16 pb-8 border-t border-lushmilk-cream">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo and About */}
          <div>
            <Link to="/" className="inline-block mb-4">
              <span className="text-2xl font-serif font-bold text-lushmilk-brown">Lush<span className="text-lushmilk-terracotta">Milk</span></span>
            </Link>
            <p className="text-lushmilk-charcoal/80 mb-4">
              Bringing farm-fresh pure milk to your doorstep. Sourced ethically from local South Indian farms.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-lushmilk-brown hover:text-lushmilk-terracotta transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-lushmilk-brown hover:text-lushmilk-terracotta transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-lushmilk-brown hover:text-lushmilk-terracotta transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="font-serif text-xl font-semibold mb-4 text-lushmilk-brown">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">About Us</Link></li>
              <li><Link to="/products" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Products</Link></li>
              <li><Link to="/contact" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Contact</Link></li>
              <li><a href="#" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Column 3: Products */}
          <div>
            <h4 className="font-serif text-xl font-semibold mb-4 text-lushmilk-brown">Our Products</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Full Cream Milk</a></li>
              <li><a href="#" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Toned Milk</a></li>
              <li><a href="#" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Organic Milk</a></li>
              <li><a href="#" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Buffalo Milk</a></li>
              <li><a href="#" className="text-lushmilk-charcoal/80 hover:text-lushmilk-terracotta transition-colors">Cow Milk</a></li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="font-serif text-xl font-semibold mb-4 text-lushmilk-brown">Contact Us</h4>
            <div className="space-y-3">
              <p className="flex items-center text-lushmilk-charcoal/80">
                <Phone size={18} className="mr-2 text-lushmilk-terracotta" />
                +91 9876543210
              </p>
              <p className="flex items-center text-lushmilk-charcoal/80">
                <Mail size={18} className="mr-2 text-lushmilk-terracotta" />
                info@lushmilk.com
              </p>
              <div>
                <h5 className="font-medium text-lushmilk-brown mb-2">Newsletter</h5>
                <div className="flex">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="px-3 py-2 border border-lushmilk-cream rounded-l-md focus:outline-none focus:ring-1 focus:ring-lushmilk-terracotta flex-1"
                  />
                  <button className="bg-lushmilk-terracotta text-white px-4 py-2 rounded-r-md hover:bg-lushmilk-brown transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="pt-8 border-t border-lushmilk-cream/50 text-center text-lushmilk-charcoal/70 text-sm">
          <p>&copy; {new Date().getFullYear()} LushMilk. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-lushmilk-terracotta transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-lushmilk-terracotta transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-lushmilk-terracotta transition-colors">Refund Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
