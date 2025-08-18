import React from 'react';

interface Logo {
  id: string;
  description: string;
  image: string;
}

const logos: Logo[] = [
  { id: "veritas", description: "VERITAS", image: "https://i.imgur.com/JQWy2H9.png" },
  { id: "cesp", description: "CESP", image: "https://i.imgur.com/tX2ow1D.png" },
  { id: "pimm", description: "PIMM", image: "https://i.imgur.com/0dAOlFa.png" },
  { id: "climento", description: "CLIMETO", image: "https://i.imgur.com/i9kbW8L.png" },
  { id: "q3", description: "Q3 QUALIDADE", image: "https://i.imgur.com/XG4LgbN.png" },
  { id: "manausplay", description: "Manaus Play", image: "https://i.imgur.com/nBx71ZQ.png" }
];

export default function Logos3() {
  return (
    <section className="py-20 px-4 bg-white" data-testid="partners-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-forest mb-6" data-testid="partners-title">
            Nossos Parceiros Estratégicos
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto" data-testid="partners-description">
            Trabalhamos em colaboração com organizações líderes para amplificar nosso impacto na região amazônica.
          </p>
        </div>
        
        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-infinite" data-testid="partners-carousel">
            {/* First set */}
            {logos.map((logo) => (
              <div 
                key={`first-${logo.id}`}
                className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow mx-6"
                data-testid={`partner-logo-${logo.id}`}
              >
                <img 
                  src={logo.image} 
                  alt={logo.description} 
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            ))}
            
            {/* Duplicate set for seamless loop */}
            {logos.map((logo) => (
              <div 
                key={`second-${logo.id}`}
                className="flex-shrink-0 w-48 h-32 flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow mx-6"
              >
                <img 
                  src={logo.image} 
                  alt={logo.description} 
                  className="max-w-full max-h-full object-contain p-4"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
