
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
import { useEffect, useRef, useState } from "react";

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

// --- COMPONENTE DO GLOBO ANIMADO 3D ---
export function AnimatedGlobe({ className }: { className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<any>(null);
  const rendererRef = useRef<any>(null);
  const animationRef = useRef<number>();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!mountRef.current) return;

    // Função para carregar Three.js dinamicamente
    const loadThreeJS = async () => {
      try {
        // Carrega Three.js do CDN
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        // Carrega OrbitControls
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });

        initializeGlobe();
      } catch (error) {
        console.error('Erro ao carregar Three.js:', error);
        setIsLoaded(false);
      }
    };

    const initializeGlobe = () => {
      if (!mountRef.current || !(window as any).THREE) return;

      const THREE = (window as any).THREE;
      const container = mountRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      // Scene
      const scene = new THREE.Scene();
      sceneRef.current = scene;

      // Camera
      const camera = new THREE.PerspectiveCamera(75, containerWidth / containerHeight, 0.1, 1000);
      camera.position.z = 6;

      // Renderer com transparência
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(containerWidth, containerHeight);
      renderer.setPixelRatio(window.devicePixelRatio);
      rendererRef.current = renderer;
      container.appendChild(renderer.domElement);

      // Geometry e Material da Terra
      const sphereGeometry = new THREE.SphereGeometry(2.8, 64, 64);
      const textureLoader = new THREE.TextureLoader();
      
      const earthTexture = textureLoader.load(
        'https://unpkg.com/three-globe@2.27.1/example/img/earth-day.jpg',
        () => {
          setIsLoaded(true);
        },
        undefined,
        (err) => {
          console.error('Erro ao carregar a textura da Terra:', err);
          setIsLoaded(true); // Mostra mesmo sem textura
        }
      );

      const sphereMaterial = new THREE.MeshStandardMaterial({ map: earthTexture });
      const earth = new THREE.Mesh(sphereGeometry, sphereMaterial);
      scene.add(earth);

      // Luzes
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 3, 5);
      scene.add(directionalLight);

      // Controles
      const OrbitControls = (window as any).THREE.OrbitControls;
      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.screenSpacePanning = false;
      controls.minDistance = 4;
      controls.maxDistance = 12;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;

      // Animação
      const animate = () => {
        animationRef.current = requestAnimationFrame(animate);
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Resize handler
      const handleResize = () => {
        if (!mountRef.current) return;
        const newWidth = mountRef.current.clientWidth;
        const newHeight = mountRef.current.clientHeight;
        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      window.addEventListener('resize', handleResize);

      // Cleanup function
      return () => {
        window.removeEventListener('resize', handleResize);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
        if (container && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        renderer.dispose();
      };
    };

    loadThreeJS();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
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
        {/* Container do Globo 3D */}
        <div 
          ref={mountRef} 
          className="absolute inset-0 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-teal-50 to-blue-100"
          style={{ width: '100%', height: '100%' }}
        />

        {/* Fallback enquanto carrega */}
        {!isLoaded && (
          <div className="absolute inset-0 rounded-full overflow-hidden shadow-2xl bg-gradient-to-br from-teal-50 to-blue-100 flex items-center justify-center">
            <div className="text-teal-600 text-center">
              <div className="w-16 h-16 rounded-full bg-teal-500 mx-auto mb-2 animate-bounce"></div>
              <p className="text-sm font-medium">Carregando Globo 3D...</p>
            </div>
          </div>
        )}

        {/* Overlay de brilho sutil */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white to-transparent opacity-10 hover:opacity-20 transition-opacity duration-300 pointer-events-none"></div>

        
      </div>
    </div>
  );
}
