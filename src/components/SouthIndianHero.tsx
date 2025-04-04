
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface SouthIndianHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
}

const SouthIndianHero: React.FC<SouthIndianHeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
  backgroundImage = "https://images.unsplash.com/photo-1628088062854-d1870b4553da?q=80&w=2070&auto=format&fit=crop"
}) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 overflow-hidden bg-gradient-to-b from-lushmilk-cream/20 to-white">
      {/* Clean, subtle texture background */}
      <div 
        className="absolute inset-0 z-0 opacity-10" 
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23a78b71' stroke-width='1' stroke-opacity='0.2'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '80px 80px',
        }}
      ></div>
      
      {/* Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-lushmilk-brown animate-fade-in p-8 rounded-lg">
        <img 
          src="/lovable-uploads/3907e856-b011-4bd0-8422-7cff5037d830.png" 
          alt="LushMilk Logo" 
          className="h-24 w-24 mx-auto mb-6 drop-shadow-lg animate-float"
        />
        <h1 className="text-4xl md:text-6xl font-bold mb-6">{title}</h1>
        <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-lushmilk-richbrown">{subtitle}</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
          <Button asChild className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white px-8 py-6 text-lg shadow-lg animate-pop">
            <Link to={ctaLink} className="flex items-center gap-2">{ctaText} <ArrowRight size={18} /></Link>
          </Button>
          {secondaryCtaText && secondaryCtaLink && (
            <Button asChild variant="outline" className="border-2 border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10 px-8 py-6 text-lg shadow-lg animate-pop">
              <Link to={secondaryCtaLink}>{secondaryCtaText}</Link>
            </Button>
          )}
        </div>
        
        <div className="flex flex-wrap justify-center gap-8 text-lushmilk-brown">
          <span className="flex items-center gap-2 text-lg bg-lushmilk-cream/30 px-4 py-2 rounded-full backdrop-blur-sm animate-pop">
            <span className="w-3 h-3 rounded-full bg-lushmilk-terracotta"></span>
            Farm Fresh
          </span>
          <span className="flex items-center gap-2 text-lg bg-lushmilk-cream/30 px-4 py-2 rounded-full backdrop-blur-sm animate-pop">
            <span className="w-3 h-3 rounded-full bg-lushmilk-terracotta"></span>
            No Preservatives
          </span>
          <span className="flex items-center gap-2 text-lg bg-lushmilk-cream/30 px-4 py-2 rounded-full backdrop-blur-sm animate-pop">
            <span className="w-3 h-3 rounded-full bg-lushmilk-terracotta"></span>
            Direct from Farmers
          </span>
        </div>
      </div>
    </section>
  );
};

export default SouthIndianHero;
