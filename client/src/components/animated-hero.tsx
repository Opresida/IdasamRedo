import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight, PhoneCall } from 'lucide-react';
import { ImagesSlider } from '@/components/ui/images-slider';
import { motion } from 'framer-motion';
import { useLocation } from 'wouter';

const titles = ["sustentável", "inovador", "consciente", "tecnológico", "amazônico"];

// Using the images from the original prompt
const images = [
  "https://images.unsplash.com/photo-1485433592409-9018e83a1f0d?q=80&w=1814&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1483982258113-b72862e6cff6?q=80&w=3456&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1482189349482-3defd547e0e9?q=80&w=2848&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export default function AnimatedHero() {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [, navigate] = useLocation();

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
        setIsVisible(true);
      }, 300);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <ImagesSlider className="h-screen" images={images} data-testid="hero-section">
      <motion.div
        initial={{
          opacity: 0,
          y: -80,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
        className="z-50 flex flex-col justify-center items-center text-center"
      >
        <motion.p className="font-bold text-xl md:text-6xl text-center bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 py-4">
          Idasam - Instituto de Desenvolvimento <br />
          Ambiental e Social da Amazônia
        </motion.p>
        
        <motion.div className="text-3xl md:text-5xl lg:text-6xl font-bold h-16 md:h-20 mb-4">
          <span 
            className={`bg-gradient-to-r from-emerald-300 to-green-400 bg-clip-text text-transparent drop-shadow-lg hero-text-transition ${isVisible ? 'opacity-100' : 'opacity-0'}`}
            data-testid="animated-title"
          >
            {titles[currentTitleIndex]}
          </span>
        </motion.div>

        <motion.p 
          className="text-lg md:text-xl text-white/90 mb-8 max-w-4xl mx-auto leading-relaxed px-4" 
          data-testid="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Contribuir para um futuro mais sustentável através da criação de projetos e plataformas focados na inovação tecnológica para o desenvolvimento da Amazônia.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => navigate('/projetos')}
            className="px-8 py-3 backdrop-blur-sm border bg-emerald-300/10 border-emerald-500/20 text-white mx-auto text-center rounded-full relative hover:bg-emerald-300/20 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              Nossos Projetos
              <MoveRight className="w-4 h-4" />
            </span>
            <div className="absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-emerald-500 to-transparent" />
          </button>
          
          <button 
            onClick={() => window.open('https://wa.me/5592982200093', '_blank')}
            className="px-8 py-3 backdrop-blur-sm border bg-amber-300/10 border-amber-500/20 text-white mx-auto text-center rounded-full relative hover:bg-amber-300/20 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              Fale Conosco
              <PhoneCall className="w-4 h-4" />
            </span>
            <div className="absolute inset-x-0 h-px -bottom-px bg-gradient-to-r w-3/4 mx-auto from-transparent via-amber-500 to-transparent" />
          </button>
        </div>
      </motion.div>
    </ImagesSlider>
  );
}
