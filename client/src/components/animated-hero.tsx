import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight, PhoneCall } from 'lucide-react';
import { motion } from 'framer-motion';

const titles = ["sustentável", "inovador", "consciente", "tecnológico", "amazônico"];

export default function AnimatedHero() {
  const [currentTitleIndex, setCurrentTitleIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

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
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-green-800 to-teal-900" data-testid="hero-section">
      {/* Background pattern overlay */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
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
        className="relative z-10 text-center px-4 max-w-6xl mx-auto"
      >
        <motion.div className="mb-8">
          <motion.h1 
            className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4" 
            data-testid="hero-title"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Idasam - Instituto de Desenvolvimento
          </motion.h1>
          <motion.h2 
            className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4" 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Ambiental e Social da Amazônia
          </motion.h2>
          <div className="text-3xl md:text-5xl lg:text-6xl font-bold h-16 md:h-20">
            <span 
              className={`bg-gradient-to-r from-green-300 to-emerald-400 bg-clip-text text-transparent drop-shadow-lg hero-text-transition ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              data-testid="animated-title"
            >
              {titles[currentTitleIndex]}
            </span>
          </div>
        </motion.div>
        
        <motion.p 
          className="text-lg md:text-xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed" 
          data-testid="hero-description"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          Contribuir para um futuro mais sustentável através da criação de projetos e plataformas focados na inovação tecnológica para o desenvolvimento da Amazônia.
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-6 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Button 
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg backdrop-blur-sm border border-emerald-500/20"
            data-testid="button-projects"
          >
            Nossos Projetos
            <MoveRight className="w-5 h-5" />
          </Button>
          <Button 
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg backdrop-blur-sm border border-amber-500/20"
            data-testid="button-contact"
          >
            Fale Conosco
            <PhoneCall className="w-5 h-5" />
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
