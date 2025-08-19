
"use client";

// --- COMPONENTES SUBSTITUTOS ---
const Button = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  <button
    className={className}
    style={{ backgroundColor: '#0d9488', color: 'white' }}
  >
    {children}
  </button>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

// --- IMPORTAÇÕES ---
import { useEffect, useState } from "react";

// --- COMPONENTE PRINCIPAL ---
export default function GlobeFeatureSection() {
  return (
    <section
      className="relative w-full max-w-7xl mx-auto overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg px-6 py-16 md:px-16 md:py-24 my-20"
      data-testid="globe-feature-section"
    >
      <div className="flex flex-col-reverse items-center justify-between gap-12 md:flex-row">
        {/* Conteúdo de texto */}
        <div className="z-10 max-w-xl text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            Projetos que <span className="text-teal-500">transformam</span>{" "}
            <span className="text-gray-600">
              a Amazônia e beneficiam todo o território nacional
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Nossos projetos de inovação e sustentabilidade geram impacto
            positivo que vai além das fronteiras amazônicas, contribuindo para
            o desenvolvimento sustentável de todo o Brasil e inspirando
            soluções globais.
          </p>
          <Button className="inline-flex items-center gap-2 rounded-full px-8 py-3 text-sm font-semibold transition-colors shadow-lg">
            Apresente seu projeto <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Contêiner do Globo Responsivo */}
        <div className="relative w-full aspect-square max-w-lg mx-auto md:w-1/2 md:max-w-xl">
          <AnimatedGlobe />
        </div>
      </div>
    </section>
  );
}

// --- COMPONENTE DO GLOBO ANIMADO ---
export function AnimatedGlobe({ className }: { className?: string }) {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simula carregamento para efeito de transição
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px] ${className || ''}`}
    >
      <div
        className={`relative h-full w-full transition-opacity duration-500 ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* Contêiner do GIF */}
        <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-teal-50 to-blue-100">
          {/* GIF do globo girando */}
          <img
            src="https://i.pinimg.com/originals/f3/7e/bb/f37ebbea1f4318dec775a4d705bd7cca.gif"
            alt="Globo terrestre girando"
            className="w-full h-full object-cover rounded-full"
            onError={(e) => {
              // Fallback caso o GIF não carregue
              e.currentTarget.style.display = 'none';
              e.currentTarget.nextElementSibling?.classList.remove('hidden');
            }}
          />
          
          {/* Fallback SVG caso o GIF não carregue */}
          <div className="hidden w-full h-full flex items-center justify-center">
            <svg
              className="w-3/4 h-3/4"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Círculo principal */}
              <circle
                cx="200"
                cy="200"
                r="180"
                fill="url(#globeGradient)"
                stroke="#0d9488"
                strokeWidth="2"
              />

              {/* Linhas de latitude */}
              <ellipse cx="200" cy="200" rx="180" ry="60" stroke="#0d9488" strokeWidth="1" opacity="0.3" fill="none" />
              <ellipse cx="200" cy="200" rx="180" ry="120" stroke="#0d9488" strokeWidth="1" opacity="0.3" fill="none" />
              <line x1="20" y1="200" x2="380" y2="200" stroke="#0d9488" strokeWidth="1" opacity="0.3" />

              {/* Linhas de longitude */}
              <ellipse cx="200" cy="200" rx="60" ry="180" stroke="#0d9488" strokeWidth="1" opacity="0.3" fill="none" />
              <ellipse cx="200" cy="200" rx="120" ry="180" stroke="#0d9488" strokeWidth="1" opacity="0.3" fill="none" />
              <line x1="200" y1="20" x2="200" y2="380" stroke="#0d9488" strokeWidth="1" opacity="0.3" />

              {/* Brasil destacado */}
              <circle cx="170" cy="220" r="8" fill="#0d9488" />
              <circle cx="185" cy="235" r="6" fill="#0d9488" />
              <circle cx="175" cy="250" r="5" fill="#0d9488" />

              {/* Pontos de impacto animados */}
              <circle cx="170" cy="220" r="3" fill="#ff6b35" className="animate-pulse" />
              <circle cx="185" cy="235" r="2" fill="#ff6b35" className="animate-pulse" style={{ animationDelay: '0.5s' }} />
              <circle cx="175" cy="250" r="2" fill="#ff6b35" className="animate-pulse" style={{ animationDelay: '1s' }} />

              {/* Gradiente */}
              <defs>
                <radialGradient id="globeGradient" cx="0.3" cy="0.3">
                  <stop offset="0%" stopColor="#e6fffa" />
                  <stop offset="70%" stopColor="#a7f3d0" />
                  <stop offset="100%" stopColor="#6ee7b7" />
                </radialGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Overlay de brilho sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-10 hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>

        {/* Pontos de impacto sobrepostos no GIF */}
        <div className="absolute inset-0 rounded-full">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Pontos representando projetos no Brasil */}
              <div className="absolute -top-4 -left-2 w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
              <div className="absolute top-2 left-4 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-6 -left-1 w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
