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
    <section id="parcerias" className="py-12 sm:py-16 lg:py-20 bg-white overflow-hidden" data-testid="partnerships-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="border border-forest/20 py-2 px-4 sm:px-6 rounded-full bg-sand/50 backdrop-blur-sm">
              <span className="text-forest font-medium text-sm sm:text-base">Parcerias</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-forest mb-4 sm:mb-6 px-4" data-testid="partnerships-title">
            Nossos Parceiros
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4" data-testid="partnerships-description">
            Colaboramos com instituições de renome para amplificar nosso impacto na região amazônica.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="flex animate-scroll-infinite" data-testid="partners-carousel">
            {/* First set */}
            {logos.map((logo) => (
              <div
                key={`first-${logo.id}`}
                className="flex-shrink-0 w-32 sm:w-48 h-24 sm:h-32 flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow mx-4 sm:mx-6"
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
                className="flex-shrink-0 w-32 sm:w-48 h-24 sm:h-32 flex items-center justify-center bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow mx-4 sm:mx-6"
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