import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Researcher {
  name: string;
  designation: string;
  quote: string; // ID Lattes
  src: string;
}

const testimonials: Researcher[] = [
  {
    name: "Prof. Dr. Francisco Miranda",
    designation: "Pesquisador Associado",
    quote: "ID Lattes: 2549543844450894",
    src: "https://i.imgur.com/6snY0Jc.png"
  },
  {
    name: "Prof. Dr. Elton Santos",
    designation: "Pesquisador Associado", 
    quote: "ID Lattes: 3240855513970442",
    src: "https://i.imgur.com/QgY3PJN.png"
  },
  {
    name: "Prof. Dr. João Orestes",
    designation: "Pesquisador Associado",
    quote: "ID Lattes: 5516771589110657",
    src: "https://i.imgur.com/wrdBH9N.png"
  },
  {
    name: "Prof. Dr. Léo Bruno",
    designation: "Pesquisador Associado",
    quote: "ID Lattes: 0430663064387301",
    src: "https://i.imgur.com/0mQl0Ko.png"
  },
  {
    name: "Prof. Dr. Marceliano Oliveira",
    designation: "Pesquisador Associado",
    quote: "ID Lattes: 3008131259766638",
    src: "https://i.imgur.com/89x0hfD.png"
  },
  {
    name: "Prof. Dr. Orlem Pinheiro",
    designation: "Pesquisador Associado",
    quote: "ID Lattes: 8148029403735260",
    src: "https://i.imgur.com/U4jmzGW.png"
  }
];

export default function AnimatedTestimonials() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesPerView, setSlidesPerView] = useState(3);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSlidesPerView(3);
      } else if (window.innerWidth >= 768) {
        setSlidesPerView(2);
      } else {
        setSlidesPerView(1);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxSlide = testimonials.length - slidesPerView;

  const nextSlide = () => {
    setCurrentSlide(current => current >= maxSlide ? 0 : current + 1);
  };

  const prevSlide = () => {
    setCurrentSlide(current => current <= 0 ? maxSlide : current - 1);
  };

  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [maxSlide]);

  const extractLattesId = (quote: string) => {
    return quote.replace('ID Lattes: ', '');
  };

  return (
    <section id="pesquisadores" className="py-20 px-4 bg-white" data-testid="researchers-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-forest mb-6" data-testid="researchers-title">
            Nossa Equipe de Pesquisadores
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="researchers-description">
            Conheça os especialistas que lideram nossas pesquisas e projetos de desenvolvimento sustentável na Amazônia.
          </p>
        </div>
        
        <div className="relative">
          <div className="overflow-hidden" data-testid="researchers-slider">
            <div 
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${(currentSlide * 100) / slidesPerView}%)` }}
            >
              {testimonials.map((researcher, index) => (
                <div 
                  key={index}
                  className={`w-full ${slidesPerView === 3 ? 'lg:w-1/3' : slidesPerView === 2 ? 'md:w-1/2' : ''} flex-shrink-0 px-4`}
                  data-testid={`researcher-card-${index}`}
                >
                  <div className="bg-sand rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
                    <div className="text-center mb-6">
                      <img 
                        src={researcher.src} 
                        alt={researcher.name} 
                        className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-forest/20"
                        data-testid={`researcher-image-${index}`}
                      />
                      <h3 className="text-2xl font-bold text-forest mb-2" data-testid={`researcher-name-${index}`}>
                        {researcher.name}
                      </h3>
                      <p className="text-gray-600 font-medium" data-testid={`researcher-designation-${index}`}>
                        {researcher.designation}
                      </p>
                    </div>
                    <div className="text-center mb-6">
                      <p className="text-sm text-gray-500 mb-4" data-testid={`researcher-lattes-${index}`}>
                        {researcher.quote}
                      </p>
                      <Button 
                        asChild
                        className="inline-flex items-center gap-2 bg-teal hover:bg-teal/80 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                        data-testid={`researcher-curriculum-${index}`}
                      >
                        <a 
                          href={`http://lattes.cnpq.br/${extractLattesId(researcher.quote)}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          Acesse o currículo
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Navigation buttons */}
          <div className="flex justify-center mt-12 gap-4">
            <Button 
              onClick={prevSlide}
              className="bg-forest hover:bg-forest/80 text-white p-3 rounded-full transition-colors"
              data-testid="button-prev-researcher"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button 
              onClick={nextSlide}
              className="bg-forest hover:bg-forest/80 text-white p-3 rounded-full transition-colors"
              data-testid="button-next-researcher"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
