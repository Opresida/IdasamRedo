
"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import createGlobe, { COBEOptions } from "cobe"
import { useCallback, useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export default function GlobeFeatureSection() {
  return (
    <section className="relative w-full mx-auto overflow-hidden rounded-3xl bg-white border border-gray-200 shadow-lg px-6 py-16 md:px-16 md:py-24 my-20" data-testid="globe-feature-section">
      <div className="flex flex-col-reverse items-center justify-between gap-10 md:flex-row">
        <div className="z-10 max-w-xl text-left">
          <h2 className="text-3xl md:text-4xl font-bold text-forest mb-6">
            Projetos que <span className="text-teal">transformam</span>{" "}
            <span className="text-gray-600">a Amazônia e beneficiam todo o território nacional</span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            Nossos projetos de inovação e sustentabilidade geram impacto positivo que vai além das fronteiras amazônicas, 
            contribuindo para o desenvolvimento sustentável de todo o Brasil e inspirando soluções globais.
          </p>
          <Button className="inline-flex items-center gap-2 rounded-full bg-teal hover:bg-teal/90 text-white px-8 py-3 text-sm font-semibold transition-colors shadow-lg">
            Apresente seu projeto <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="relative h-[180px] w-full max-w-xl">
          <Globe className="absolute -bottom-20 -right-40 scale-150" />
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
  let phi = 0
  let width = 0
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const pointerInteracting = useRef(null)
  const pointerInteractionMovement = useRef(0)
  const [r, setR] = useState(0)

  const updatePointerInteraction = (value: any) => {
    pointerInteracting.current = value
    if (canvasRef.current) {
      canvasRef.current.style.cursor = value ? "grabbing" : "grab"
    }
  }

  const updateMovement = (clientX: any) => {
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

  const onResize = () => {
    if (canvasRef.current) {
      width = canvasRef.current.offsetWidth
    }
  }

  useEffect(() => {
    window.addEventListener("resize", onResize)
    onResize()

    const globe = createGlobe(canvasRef.current!, {
      ...config,
      width: width * 2,
      height: width * 2,
      onRender,
    })

    setTimeout(() => (canvasRef.current!.style.opacity = "1"))
    return () => globe.destroy()
  }, [])

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
        onTouchMove={(e) =>
          e.touches[0] && updateMovement(e.touches[0].clientX)
        }
      />
    </div>
  )
}
