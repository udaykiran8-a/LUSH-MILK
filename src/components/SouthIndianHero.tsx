
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface SouthIndianHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
  backgroundImage?: string;
}

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8 }
  }
};

const buttonVariants = {
  initial: { scale: 0.9, opacity: 0 },
  animate: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      delay: 0.4,
      duration: 0.5 
    }
  },
  hover: { 
    scale: 1.05,
    transition: { 
      duration: 0.3,
      type: "spring",
      stiffness: 400
    }
  },
  tap: { scale: 0.95 }
};

const SouthIndianHero: React.FC<SouthIndianHeroProps> = ({
  title,
  subtitle,
  ctaText,
  ctaLink,
  secondaryCtaText,
  secondaryCtaLink,
}) => {
  return (
    <section className="relative min-h-screen flex flex-col justify-center items-center text-center px-4 bg-white">
      {/* Content */}
      <motion.div 
        className="relative z-20 max-w-4xl mx-auto bg-white p-10 rounded-2xl shadow-lg"
        initial="initial"
        animate="animate"
        variants={fadeIn}
      >
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-6"
        >
          <img 
            src="/lovable-uploads/3907e856-b011-4bd0-8422-7cff5037d830.png" 
            alt="LushMilk Logo" 
            className="h-32 w-32 mx-auto mb-6" 
          />
        </motion.div>
        
        <motion.h1 
          className="text-4xl md:text-6xl font-bold mb-6 text-lushmilk-brown"
          variants={fadeIn}
          custom={1}
        >
          {title}
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-lushmilk-richbrown"
          variants={fadeIn}
          custom={2}
        >
          {subtitle}
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 mb-12"
        >
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button asChild className="bg-lushmilk-terracotta hover:bg-lushmilk-terracotta/90 text-white px-8 py-6 text-lg shadow-lg">
              <Link to={ctaLink} className="flex items-center gap-2">{ctaText} <ArrowRight size={18} /></Link>
            </Button>
          </motion.div>
          
          {secondaryCtaText && secondaryCtaLink && (
            <motion.div
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              custom={1}
            >
              <Button asChild variant="outline" className="border-2 border-lushmilk-terracotta text-lushmilk-terracotta hover:bg-lushmilk-terracotta/10 px-8 py-6 text-lg shadow-lg">
                <Link to={secondaryCtaLink}>{secondaryCtaText}</Link>
              </Button>
            </motion.div>
          )}
        </motion.div>
        
        <motion.div 
          className="flex flex-wrap justify-center gap-4 md:gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ 
            opacity: 1, 
            y: 0,
            transition: { 
              delay: 0.6,
              duration: 0.5,
              staggerChildren: 0.1
            }
          }}
        >
          <motion.span 
            className="flex items-center gap-2 text-lg bg-white px-4 py-2 rounded-full shadow-sm text-lushmilk-brown"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.6 }}
          >
            <span className="w-3 h-3 rounded-full bg-lushmilk-terracotta"></span>
            Farm Fresh
          </motion.span>
          
          <motion.span 
            className="flex items-center gap-2 text-lg bg-white px-4 py-2 rounded-full shadow-sm text-lushmilk-brown"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.7 }}
          >
            <span className="w-3 h-3 rounded-full bg-lushmilk-terracotta"></span>
            No Preservatives
          </motion.span>
          
          <motion.span 
            className="flex items-center gap-2 text-lg bg-white px-4 py-2 rounded-full shadow-sm text-lushmilk-brown"
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            initial="hidden"
            animate="show"
            transition={{ delay: 0.8 }}
          >
            <span className="w-3 h-3 rounded-full bg-lushmilk-terracotta"></span>
            Direct from Farmers
          </motion.span>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default SouthIndianHero;
