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
          <StaticGlobe />
        </div>
      </div>
    </section>
  );
}

// --- COMPONENTE DO GLOBO ESTÁTICO ---
export function StaticGlobe({ className }: { className?: string }) {
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
        {/* Imagem de fundo do globo */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-teal-50 to-blue-100 shadow-2xl">
          {/* SVG do globo */}
          <svg
            className="w-full h-full"
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

            {/* Continentes simplificados */}
            {/* América do Sul */}
            <path
              d="M160 180 Q150 200 160 240 Q170 260 180 280 Q190 270 185 250 Q190 230 185 210 Q180 190 160 180"
              fill="#059669"
              opacity="0.7"
            />

            {/* América do Norte */}
            <path
              d="M140 120 Q130 140 140 160 Q150 150 160 140 Q170 130 160 120 Q150 110 140 120"
              fill="#059669"
              opacity="0.7"
            />

            {/* África */}
            <path
              d="M220 160 Q210 180 220 220 Q230 240 240 260 Q250 250 245 230 Q250 210 245 190 Q240 170 220 160"
              fill="#059669"
              opacity="0.7"
            />

            {/* Brasil destacado */}
            <circle cx="170" cy="220" r="8" fill="#0d9488" />
            <circle cx="185" cy="235" r="6" fill="#0d9488" />
            <circle cx="175" cy="250" r="5" fill="#0d9488" />

            {/* Pontos de impacto */}
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

        {/* Efeito de brilho/hover */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-20 hover:opacity-30 transition-opacity duration-300"></div>

        {/* Sombra interna */}
        <div className="absolute inset-4 rounded-full shadow-inner"></div>
      </div>
    </div>
  );
}