import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MoveRight, PhoneCall } from 'lucide-react';

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
    <section className="min-h-screen relative flex items-center justify-center overflow-hidden" data-testid="hero-section">
      {/* Background image - aerial view of Manaus Amazon city */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat" 
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1584464491033-06628f3a6b7b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=1080')`
        }}
      />
      <div className="absolute inset-0 bg-black/50" />
      
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4" data-testid="hero-title">
            Desenvolvendo um futuro
          </h1>
          <div className="text-4xl md:text-6xl lg:text-7xl font-bold h-20 md:h-24">
            <span 
              className={`text-forest drop-shadow-lg hero-text-transition ${isVisible ? 'opacity-100' : 'opacity-0'}`}
              data-testid="animated-title"
            >
              {titles[currentTitleIndex]}
            </span>
          </div>
        </div>
        
        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed" data-testid="hero-description">
          Contribuir para um futuro mais sustentável através da criação de projetos e plataformas focados na inovação tecnológica para o desenvolvimento da Amazônia.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button 
            className="bg-forest hover:bg-forest/80 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg"
            data-testid="button-projects"
          >
            Nossos Projetos
            <MoveRight className="w-5 h-5" />
          </Button>
          <Button 
            className="bg-terracotta hover:bg-terracotta/80 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg"
            data-testid="button-contact"
          >
            Fale Conosco
            <PhoneCall className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}
