
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PresentationControls, useTexture } from '@react-three/drei';
import { Product } from './ProductCard';
import { motion } from 'framer-motion';
import { ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import * as THREE from 'three';

interface MilkCarton3DProps {
  color: string;
  isSelected: boolean;
  texture: THREE.Texture;
}

const MilkCarton3D: React.FC<MilkCarton3DProps> = ({ color, isSelected, texture }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime()) * 0.05;
      
      if (!isSelected) {
        // Gentle rotation when not selected
        meshRef.current.rotation.y += 0.005;
      }
    }
  });

  // Create material with texture
  const materials = [
    new THREE.MeshStandardMaterial({ map: texture }), // Front
    new THREE.MeshStandardMaterial({ map: texture }), // Back
    new THREE.MeshStandardMaterial({ color: color }), // Top
    new THREE.MeshStandardMaterial({ color: color }), // Bottom
    new THREE.MeshStandardMaterial({ map: texture }), // Right
    new THREE.MeshStandardMaterial({ map: texture }), // Left
  ];

  return (
    <mesh ref={meshRef} castShadow receiveShadow scale={isSelected ? 1.2 : 1}>
      <boxGeometry args={[1, 1.5, 0.8]} />
      {materials.map((material, index) => (
        <primitive object={material} attach={`material-${index}`} key={index} />
      ))}
    </mesh>
  );
};

interface Product3DCardProps {
  product: Product;
  index: number;
}

const Product3DCard: React.FC<Product3DCardProps> = ({ product, index }) => {
  const { addToCart } = useCart();
  const [isSelected, setIsSelected] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
    });
    
    toast.success(`${product.name} added to cart`, {
      description: "Go to cart to complete your purchase",
      position: "top-center",
      duration: 2000,
      id: `add-to-cart-${product.id}`,
    });
  };

  // Get milk color based on product name
  const getMilkColor = () => {
    if (product.name.includes("Low Fat")) return "#f0f4f8";
    if (product.name.includes("Full Cream")) return "#f8e0b0";
    if (product.name.includes("Organic")) return "#e0f8e0";
    if (product.name.includes("Buffalo")) return "#f0e0b0";
    if (product.name.includes("A2")) return "#f5e7d3";
    return "#ffffff";
  };

  // Calculate price to display
  const displayPrice = product.priceInRupees || (product.price * 70);
  
  // Create component for texture loading
  const TexturedMilkCarton = () => {
    // Create a blank canvas to draw product info on
    const generateTexture = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 256;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        // Background color
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Brand name
        ctx.fillStyle = '#8B5D33';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('LushMilk', canvas.width / 2, 60);
        
        // Product name
        ctx.fillStyle = '#333333';
        ctx.font = '24px Arial';
        ctx.fillText(product.name.length > 12 ? product.name.slice(0, 12) + '...' : product.name, canvas.width / 2, 120);
        
        // Price
        ctx.fillStyle = '#E75B2E';
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`₹${displayPrice}`, canvas.width / 2, 180);
        
        // Small cow image or logo
        ctx.beginPath();
        ctx.arc(canvas.width / 2, 300, 40, 0, Math.PI * 2);
        ctx.fillStyle = '#E75B2E';
        ctx.fill();
      }
      
      return canvas;
    };
    
    // Create texture from canvas
    const texture = new THREE.CanvasTexture(generateTexture());
    
    return <MilkCarton3D color={getMilkColor()} isSelected={isSelected} texture={texture} />;
  };

  return (
    <motion.div
      className="bg-white rounded-lg shadow-md overflow-hidden border border-lushmilk-cream/30 hover:shadow-xl transition-all duration-300 hover:border-lushmilk-terracotta/30 flex flex-col h-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5,
          delay: index * 0.1
        }
      }}
      whileHover={{ y: -5 }}
      viewport={{ once: true, margin: "-50px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => setIsSelected(!isSelected)}
    >
      <div className="relative h-64 w-full overflow-hidden">
        <Canvas shadows camera={{ position: [0, 0, 5], fov: 45 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
          <PresentationControls
            enabled={isHovered || isSelected}
            global
            zoom={1}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
          >
            <TexturedMilkCarton />
          </PresentationControls>
          {isSelected && <OrbitControls enableZoom={false} />}
        </Canvas>
        
        {product.popular && (
          <Badge className="absolute top-2 right-2 bg-lushmilk-terracotta text-white">
            Popular
          </Badge>
        )}
      </div>
      
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex items-center mb-1">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < Math.floor(product.rating)
                  ? "text-yellow-500 fill-yellow-500"
                  : "text-gray-300"
              }`}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({product.rating.toFixed(1)})</span>
        </div>
        
        <h3 className="text-lg font-serif font-semibold text-lushmilk-brown mb-1">
          {product.name}
        </h3>
        
        <p className="text-sm text-gray-600 mb-4 flex-grow">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mt-auto">
          <span className="text-lushmilk-terracotta font-semibold">
            ₹{displayPrice} <span className="text-xs text-gray-500">/liter</span>
          </span>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              className="bg-lushmilk-terracotta/90 hover:bg-lushmilk-terracotta text-white"
              size="sm"
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              Add
            </Button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Product3DCard;
