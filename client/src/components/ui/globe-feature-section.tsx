"use client";

// --- COMPONENTES SUBSTITUTOS ---
const Button = ({ className, children }: { className?: string, children: React.ReactNode }) => (
  // --- CORREÇÃO APLICADA AQUI ---
  // Adicionado estilo inline para garantir que a cor do botão seja exibida.
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
import createGlobe, { COBEOptions } from "https://esm.sh/cobe";
import { useCallback, useEffect, useRef, useState } from "react";

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

        {/* --- CORREÇÃO APLICADA AQUI --- */}
        {/* Contêiner do Globo ajustado para ser um quadrado responsivo. */}
        <div className="relative w-full aspect-square max-w-lg mx-auto md:w-1/2 md:max-w-xl">
          <Globe />
        </div>
      </div>
    </section>
  );
}

// --- CONFIGURAÇÕES DO GLOBO ---
const GLOBE_CONFIG: COBEOptions = {
  width: 800,
  height: 800,
  onRender: () => {},
  devicePixelRatio: 2,
  phi: 0,
  theta: 0.3,
  dark: 0,
  diffuse: 0.4,
  mapSamples: 16000,
  mapBrightness: 1.2,
  baseColor: [1, 1, 1],
  markerColor: [20 / 255, 184 / 255, 166 / 255], // Cor teal
  glowColor: [1.05, 1.05, 1.05],
  markers: [
    { location: [-15.7801, -47.9292], size: 0.1 },
    { location: [-23.5505, -46.6333], size: 0.12 },
    { location: [-22.9068, -43.1729], size: 0.1 },
    { location: [-3.119, -60.0217], size: 0.15 },
  ],
};

// --- COMPONENTE DO GLOBO ---
export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string;
  config?: COBEOptions;
}) {
  let phi = 0;
  let width = 0;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [r, setR] = useState(0);

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value;
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab";
    }
  };

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current;
      pointerInteractionMovement.current = delta;
      setR(delta / 200);
    }
  };

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005;
      state.phi = phi + r;
      state.width = width * 2;
      state.height = width * 2;
    },
    [r]
  );

  const onResize = useCallback(() => {
    if (canvasRef.current && canvasRef.current.offsetWidth > 0) {
      width = canvasRef.current.offsetWidth;
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    window.addEventListener("resize", onResize);
    onResize();

    let globe: any;
    try {
      globe = createGlobe(canvasRef.current, {
        ...config,
        width: width * 2,
        height: width * 2,
        onRender,
      });
      setTimeout(() => {
        if (canvasRef.current) canvasRef.current.style.opacity = "1";
      }, 100);
    } catch (e) {
      console.error("Erro ao criar o globo:", e);
      return;
    }

    return () => globe.destroy();
  }, [config, onRender, onResize]);

  return (
    <div
      className={`absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px] ${className || ''}`}
    >
      <canvas
        ref={canvasRef}
        className="h-full w-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
        onPointerDown={(e) => updatePointerInteraction(e.clientX - pointerInteractionMovement.current)}
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => e.touches[0] && updateMovement(e.touches[0].clientX)}
      />
    </div>
  );
}
