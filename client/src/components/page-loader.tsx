
"use client";

import React, { useState, useEffect } from 'react';
import LumaSpin from '@/components/ui/luma-spin';

interface PageLoaderProps {
  isLoading: boolean;
  children: React.ReactNode;
}

export default function PageLoader({ isLoading, children }: PageLoaderProps) {
  const [showLoader, setShowLoader] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShowLoader(true);
    } else {
      const timer = setTimeout(() => {
        setShowLoader(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (showLoader) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-sand/90 backdrop-blur-sm">
        <div className="flex flex-col items-center space-y-4">
          <LumaSpin />
          <p className="text-forest font-medium animate-pulse">Carregando...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
