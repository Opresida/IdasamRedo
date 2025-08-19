"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function GlobeFeatureSection() {
  // Assume heading and description are defined elsewhere or passed as props
  const heading = "Projetos que transformam a Amazônia e beneficiam todo o território nacional";
  const description = "Nossos projetos de inovação e sustentabilidade geram impacto positivo que vai além das fronteiras amazônicas, contribuindo para o desenvolvimento sustentável de todo o Brasil e inspirando soluções globais.";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [globeOpacity, setGlobeOpacity] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  let phi = 0
  let width = 0
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    setIsDragging(value !== null);
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) phi += 0.005
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r],
  )

  const onResize = useCallback(() => {
    if (canvasRef.current && canvasRef.current.offsetWidth > 0) {
      width = canvasRef.current.offsetWidth
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    window.addEventListener("resize", onResize)
    onResize()

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) {
      console.warn("WebGL não está disponível, globo será ocultado")
      if (canvasRef.current) {
        canvasRef.current.style.display = "none"
      }
      return
    }

    let globe: any = null

    try {
      globe = createGlobe(canvas, {
        ...GLOBE_CONFIG,
        width: width * 2,
        height: width * 2,
        onRender,
      })

      setTimeout(() => {
        setGlobeOpacity(1); // Set opacity to 1 after a delay
      }, 100)

    } catch (error) {
      console.error("Erro ao inicializar o globo:", error)
      if (canvasRef.current) {
        canvasRef.current.style.display = "none"
      }
    }

    return () => {
      window.removeEventListener("resize", onResize)
      if (globe) {
        try {
          globe.destroy()
        } catch (error) {
          console.warn("Erro ao destruir o globo:", error)
        }
      }
    }
  }, [onRender, onResize]) // Include dependencies

  return (
    <section className="relative w-full mx-auto overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg px-6 py-16 md:px-16 md:py-24 my-20" data-testid="globe-feature-section">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16 items-center">
        <div className="order-2 lg:order-1 px-4 sm:px-0">
          <div className="flex justify-center lg:justify-start mb-6">
            <div className="border border-forest/20 py-2 px-4 sm:px-6 rounded-full bg-sand/50 backdrop-blur-sm">
              <span className="text-forest font-medium text-sm sm:text-base">Inovação Global</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-forest mb-4 sm:mb-6 text-center lg:text-left leading-tight">
            {heading}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 text-center lg:text-left leading-relaxed">
            {description}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
            <Button
              size="lg"
              className="bg-forest hover:bg-forest/80 text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              data-testid="explore-projects-button"
            >
              Explore Projetos
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="border-forest text-forest hover:bg-forest hover:text-white px-6 sm:px-8 py-3 rounded-lg font-medium transition-colors text-sm sm:text-base"
              data-testid="learn-more-button"
            >
              Saiba Mais
            </Button>
          </div>
        </div>

        <div className="order-1 lg:order-2 flex justify-center px-4 sm:px-0">
          <div className="relative w-full max-w-[280px] sm:max-w-[400px] md:max-w-[480px] lg:max-w-lg xl:max-w-xl">
            <canvas
              ref={canvasRef}
              className="w-full h-auto opacity-0 transition-opacity duration-500 [contain:layout_paint_size]"
              width={540}
              height={540}
              style={{
                opacity: globeOpacity,
                cursor: isDragging ? "grabbing" : "grab",
                aspectRatio: "1 / 1",
                maxHeight: "540px"
              }}
              onPointerDown={(e) =>
                updatePointerInteraction(
                  e.clientX - pointerInteractionMovement.current,
                )
              }
              onPointerUp={() => updatePointerInteraction(null)}
              onPointerOut={() => updatePointerInteraction(null)}
              onMouseMove={(e) => updateMovement(e.clientX)}
              onTouchMove={(e) => {
                if (e.touches[0]) {
                  updateMovement(e.touches[0].clientX)
                }
              }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

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
  markerColor: [20 / 255, 184 / 255, 166 / 255], // teal color
  glowColor: [1, 1, 1],
  markers: [
    // Brazil regions
    { location: [-15.7801, -47.9292], size: 0.1 }, // Brasília
    { location: [-23.5505, -46.6333], size: 0.12 }, // São Paulo
    { location: [-22.9068, -43.1729], size: 0.1 }, // Rio de Janeiro
    { location: [-3.1190, -60.0217], size: 0.15 }, // Manaus (destaque)
    { location: [-12.9714, -38.5014], size: 0.08 }, // Salvador
    { location: [-8.0476, -34.8770], size: 0.06 }, // Recife
    { location: [-25.4284, -49.2733], size: 0.06 }, // Curitiba
    { location: [-30.0346, -51.2177], size: 0.07 }, // Porto Alegre
    { location: [-19.9167, -43.9345], size: 0.08 }, // Belo Horizonte
    { location: [-16.6799, -49.2550], size: 0.06 }, // Goiânia
  ],
}

export function Globe({
  className,
  config = GLOBE_CONFIG,
}: {
  className?: string
  config?: COBEOptions
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  let width = 0
  const pointerInteracting = useRef<number | null>(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [globeOpacity, setGlobeOpacity] = useState(0)

  let phi = 0 // Local phi for the Globe component's onRender

  const updatePointerInteraction = (value: number | null) => {
    pointerInteracting.current = value
    setIsDragging(value !== null)
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value !== null ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: number) => {
    if (pointerInteracting.current !== null) {
      const delta = clientX - pointerInteracting.current
      pointerInteractionMovement.current = delta
      setR(delta / 200)
    }
  }

  const onRender = useCallback(
    (state: Record<string, any>) => {
      if (!pointerInteracting.current) {
        phi += 0.005 // Local phi update
      }
      state.phi = phi + r
      state.width = width * 2
      state.height = width * 2
    },
    [r, width], // Include width as dependency
  )

  const onResize = useCallback(() => {
    if (canvasRef.current && canvasRef.current.offsetWidth > 0) {
      width = canvasRef.current.offsetWidth
    }
  }, [])

  useEffect(() => {
    if (!canvasRef.current) return

    window.addEventListener("resize", onResize)
    onResize()

    const canvas = canvasRef.current
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')

    if (!gl) {
      console.warn("WebGL não está disponível, globo será ocultado")
      if (canvasRef.current) {
        canvasRef.current.style.display = "none"
      }
      return
    }

    let globe: any = null

    try {
      globe = createGlobe(canvas, {
        ...config,
        width: width * 2,
        height: width * 2,
        onRender,
      })

      setTimeout(() => {
        setGlobeOpacity(1)
      }, 100)

    } catch (error) {
      console.error("Erro ao inicializar o globo:", error)
      if (canvasRef.current) {
        canvasRef.current.style.display = "none"
      }
    }

    return () => {
      window.removeEventListener("resize", onResize)
      if (globe) {
        try {
          globe.destroy()
        } catch (error) {
          console.warn("Erro ao destruir o globo:", error)
        }
      }
    }
  }, [onRender, onResize, config, width]) // Include all relevant dependencies

  return (
    <div
      className={cn(
        "absolute inset-0 mx-auto aspect-[1/1] w-full max-w-[600px]",
        className,
      )}
    >
      <canvas
        className={cn(
          "size-full opacity-0 transition-opacity duration-500 [contain:layout_paint_size]",
        )}
        ref={canvasRef}
        onPointerDown={(e) =>
          updatePointerInteraction(
            e.clientX - pointerInteractionMovement.current,
          )
        }
        onPointerUp={() => updatePointerInteraction(null)}
        onPointerOut={() => updatePointerInteraction(null)}
        onMouseMove={(e) => updateMovement(e.clientX)}
        onTouchMove={(e) => {
          if (e.touches[0]) {
            updateMovement(e.touches[0].clientX)
          }
        }}
      />
    </div>
  )
}