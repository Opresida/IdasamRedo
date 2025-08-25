"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X, Heart, DollarSign } from 'lucide-react';
import { Component as LumaSpin } from "@/components/ui/luma-spin"; // Import the LumaSpin component
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface NavItem {
  name: string;
  link: string;
}

const navItems: NavItem[] = [
  { name: "Home", link: "/" },
  { name: "Quem Somos", link: "#quem-somos" },
  { name: "Projetos", link: "/projetos" },
  { name: "Notícias", link: "/noticias" },
  { name: "Parcerias", link: "#parcerias" },
  { name: "Legislação", link: "#legislacao" },
  { name: "Contato", link: "#contato" }
];

export default function FloatingNavbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // State to track navigation
  const [showDonationModal, setShowDonationModal] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
        setIsMobileMenuOpen(false); // Close mobile menu when navbar hides
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavigation = (link: string) => {
    setIsNavigating(true); // Start navigation, show loader

    if (link === '/') {
      // Navigate to home page
      window.location.href = '/';
      setTimeout(() => setIsNavigating(false), 1000);
    } else if (link.startsWith('#')) {
      // Check if we're already on the home page
      if (window.location.pathname === '/') {
        // We're on home, just scroll to the anchor
        setTimeout(() => {
          const element = document.querySelector(link);
          if (element) {
            const offsetTop = (element as HTMLElement).offsetTop - 100; // Offset para compensar navbar
            window.scrollTo({
              top: offsetTop,
              behavior: 'smooth'
            });
          } else {
            console.warn(`Elemento não encontrado para: ${link}`);
          }
          setIsNavigating(false);
        }, 100);
      } else {
        // We're not on home, navigate to home first then scroll to anchor
        window.location.href = '/' + link;
        setTimeout(() => setIsNavigating(false), 1000);
      }
    } else if (link.startsWith('/')) {
      // For internal routes
      window.location.href = link;
      setTimeout(() => setIsNavigating(false), 1000);
    } else {
      // For external routes or actual page changes
      setTimeout(() => setIsNavigating(false), 1000);
    }
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
  };

  const handleDonationCurrency = (currency: 'BRL' | 'USD' | 'EUR') => {
    setShowDonationModal(false);
    // Aqui você pode implementar a lógica específica para cada moeda
    if (currency === 'BRL') {
      // Redirecionar para doação em Real - pode ser PIX ou outro método
      console.log('Doação em Real selecionada');
      // Exemplo: redirecionar para seção Coração Ribeirinho
      if (window.location.pathname === '/') {
        const element = document.querySelector('#coracao-ribeirinho');
        if (element) {
          const offsetTop = (element as HTMLElement).offsetTop - 100;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      } else {
        window.location.href = '/#coracao-ribeirinho';
      }
    } else if (currency === 'USD') {
      // Redirecionar para doação em Dólar - Stripe
      console.log('Doação em Dólar selecionada');
      window.location.href = '/doacao-usd';
    } else if (currency === 'EUR') {
      // Redirecionar para doação em Euro - Stripe
      console.log('Doação em Euro selecionada');
      window.location.href = '/doacao-eur';
    }
  };

  return (
    <>
      {isNavigating && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <LumaSpin />
        </div>
      )}
      <nav 
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
        }`}
        data-testid="floating-navbar"
      >
        <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-200 dark:border-gray-700">
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 px-6 py-3">
            <div className="flex items-center space-x-6 text-sm font-medium">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.link)}
                  className="text-gray-700 dark:text-gray-300 hover:text-forest dark:hover:text-green-400 transition-colors"
                  data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                  disabled={isNavigating}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-forest hover:bg-forest/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  data-testid="button-donate"
                >
                  Doe Agora
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center text-forest mb-4">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    Escolha sua Moeda
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 p-2">
                  <p className="text-center text-gray-600 mb-6">
                    Selecione em qual moeda você gostaria de fazer sua doação:
                  </p>

                  <div className="grid gap-4">
                    <button
                      onClick={() => handleDonationCurrency('BRL')}
                      className="flex items-center justify-center gap-3 w-full p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all"
                    >
                      <span className="text-2xl">🇧🇷</span>
                      <div className="text-left">
                        <div className="font-semibold text-green-700">Real (BRL)</div>
                        <div className="text-sm text-green-600">PIX, Cartão de Crédito</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDonationCurrency('USD')}
                      className="flex items-center justify-center gap-3 w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all"
                    >
                      <DollarSign className="w-6 h-6 text-blue-600" />
                      <div className="text-left">
                        <div className="font-semibold text-blue-700">Dólar (USD)</div>
                        <div className="text-sm text-blue-600">Stripe, Cartão Internacional</div>
                      </div>
                    </button>

                    <button
                      onClick={() => handleDonationCurrency('EUR')}
                      className="flex items-center justify-center gap-3 w-full p-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all"
                    >
                      <span className="text-2xl text-purple-600 font-bold">€</span>
                      <div className="text-left">
                        <div className="font-semibold text-purple-700">Euro (EUR)</div>
                        <div className="text-sm text-purple-600">Stripe, Cartão Europeu</div>
                      </div>
                    </button>
                  </div>

                  <p className="text-xs text-center text-gray-500 mt-4">
                    Sua doação ajuda a transformar vidas na Amazônia
                  </p>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-700 dark:text-gray-300 hover:text-forest dark:hover:text-green-400 transition-colors"
                data-testid="mobile-menu-toggle"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

            {/* Mobile Menu Items */}
            {isMobileMenuOpen && (
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md rounded-b-2xl">
                <div className="flex flex-col px-4 py-3 space-y-3">
                  {navItems.map((item, index) => (
                    <button 
                      key={index}
                      onClick={() => handleNavigation(item.link)}
                      className="text-gray-700 dark:text-gray-300 hover:text-forest dark:hover:text-green-400 transition-colors text-sm font-medium py-2 text-left"
                      data-testid={`mobile-nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                      disabled={isNavigating}
                    >
                      {item.name}
                    </button>
                  ))}
                  <Dialog open={showDonationModal} onOpenChange={setShowDonationModal}>
                    <DialogTrigger asChild>
                      <Button 
                        className="bg-forest hover:bg-forest/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-3 w-full"
                        data-testid="mobile-button-donate"
                      >
                        Doe Agora
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-2xl text-center text-forest mb-4">
                          <Heart className="w-8 h-8 mx-auto mb-2 text-red-500" />
                          Escolha sua Moeda
                        </DialogTitle>
                      </DialogHeader>

                      <div className="space-y-4 p-2">
                        <p className="text-center text-gray-600 mb-6">
                          Selecione em qual moeda você gostaria de fazer sua doação:
                        </p>

                        <div className="grid gap-4">
                          <button
                            onClick={() => handleDonationCurrency('BRL')}
                            className="flex items-center justify-center gap-3 w-full p-4 bg-green-50 border-2 border-green-200 rounded-xl hover:bg-green-100 hover:border-green-300 transition-all"
                          >
                            <span className="text-2xl">🇧🇷</span>
                            <div className="text-left">
                              <div className="font-semibold text-green-700">Real (BRL)</div>
                              <div className="text-sm text-green-600">PIX, Cartão de Crédito</div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleDonationCurrency('USD')}
                            className="flex items-center justify-center gap-3 w-full p-4 bg-blue-50 border-2 border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-300 transition-all"
                          >
                            <DollarSign className="w-6 h-6 text-blue-600" />
                            <div className="text-left">
                              <div className="font-semibold text-blue-700">Dólar (USD)</div>
                              <div className="text-sm text-blue-600">PayPal, Cartão Internacional</div>
                            </div>
                          </button>

                          <button
                            onClick={() => handleDonationCurrency('EUR')}
                            className="flex items-center justify-center gap-3 w-full p-4 bg-purple-50 border-2 border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-300 transition-all"
                          >
                            <span className="text-2xl text-purple-600 font-bold">€</span>
                            <div className="text-left">
                              <div className="font-semibold text-purple-700">Euro (EUR)</div>
                              <div className="text-sm text-purple-600">Stripe, Cartão Europeu</div>
                            </div>
                          </button>
                        </div>

                        <p className="text-xs text-center text-gray-500 mt-4">
                          Sua doação ajuda a transformar vidas na Amazônia
                        </p>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
