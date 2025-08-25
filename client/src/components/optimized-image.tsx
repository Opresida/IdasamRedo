
import React, { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  placeholder?: string;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  className = '',
  width,
  height,
  priority = false,
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNhcnJlZ2FuZG8uLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Intersection Observer para lazy loading
  useEffect(() => {
    if (priority || isInView) return;

    const currentRef = imgRef.current;
    if (!currentRef) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsInView(true);
          observerRef.current?.disconnect();
        }
      },
      {
        rootMargin: '50px', // Carrega 50px antes de aparecer na tela
        threshold: 0.1
      }
    );

    observerRef.current.observe(currentRef);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [priority, isInView]);

  // Cleanup do observer
  useEffect(() => {
    return () => {
      observerRef.current?.disconnect();
    };
  }, []);

  const handleImageLoad = () => {
    setIsLoaded(true);
    setIsLoading(false);
    onLoad?.();
  };

  const handleImageError = () => {
    setHasError(true);
    setIsLoading(false);
    onError?.();
  };

  const handleImageStart = () => {
    setIsLoading(true);
  };

  // Otimização de URL para diferentes tamanhos (simulação)
  const getOptimizedSrc = (originalSrc: string, width?: number): string => {
    // Em um caso real, você usaria um serviço como Cloudinary, ImageKit, etc.
    // Por enquanto, retornamos a URL original
    return originalSrc;
  };

  const optimizedSrc = getOptimizedSrc(src, width);

  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder/Loading state */}
      {(!isInView || isLoading || !isLoaded) && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 animate-pulse">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400"></div>
              <span className="text-xs text-gray-500">Carregando...</span>
            </div>
          ) : (
            <img
              src={placeholder}
              alt=""
              className="w-full h-full object-cover opacity-30"
            />
          )}
        </div>
      )}

      {/* Imagem de erro */}
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-500">
            <svg 
              className="mx-auto h-12 w-12 mb-2" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1} 
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
              />
            </svg>
            <p className="text-sm">Erro ao carregar imagem</p>
          </div>
        </div>
      )}

      {/* Imagem principal */}
      {isInView && (
        <img
          src={optimizedSrc}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          width={width}
          height={height}
          onLoad={handleImageLoad}
          onError={handleImageError}
          onLoadStart={handleImageStart}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      )}

      {/* Overlay de carregamento */}
      {isLoading && isInView && (
        <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
          <div className="bg-white rounded-full p-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;

// Componente especializado para hero/banner images
export const HeroImage: React.FC<OptimizedImageProps> = (props) => (
  <OptimizedImage {...props} priority={true} />
);

// Componente especializado para thumbnails
export const ThumbnailImage: React.FC<OptimizedImageProps & { size?: 'sm' | 'md' | 'lg' }> = ({ 
  size = 'md', 
  ...props 
}) => {
  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  return (
    <OptimizedImage 
      {...props} 
      className={`${sizeClasses[size]} rounded-lg ${props.className || ''}`}
    />
  );
};

// Hook para pré-carregamento de imagens
export const useImagePreloader = () => {
  const preloadImage = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = src;
    });
  };

  const preloadImages = async (sources: string[]): Promise<void> => {
    try {
      await Promise.all(sources.map(preloadImage));
      console.log('🖼️ Imagens pré-carregadas com sucesso');
    } catch (error) {
      console.warn('⚠️ Erro ao pré-carregar algumas imagens:', error);
    }
  };

  return { preloadImage, preloadImages };
};
