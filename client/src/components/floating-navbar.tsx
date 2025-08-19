import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
import { Component as LumaSpin } from "@/components/ui/luma-spin"; // Import the LumaSpin component

interface NavItem {
  name: string;
  link: string;
}

const navItems: NavItem[] = [
  { name: "Home", link: "#" },
  { name: "Quem Somos", link: "#quem-somos" },
  { name: "Pesquisadores", link: "#pesquisadores" },
  { name: "Parcerias", link: "#parcerias" },
  { name: "Legislação", link: "#legislacao" },
  { name: "Contato", link: "#contato" }
];

export default function FloatingNavbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false); // State to track navigation

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
    
    if (link === '#') {
      // Scroll to top for home
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setIsNavigating(false), 800);
    } else if (link.startsWith('#')) {
      // Wait a bit for DOM to be ready, then scroll
      setTimeout(() => {
        const element = document.querySelector(link);
        if (element) {
          const offsetTop = element.offsetTop - 100; // Offset para compensar navbar
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
      // For external routes or actual page changes
      setTimeout(() => setIsNavigating(false), 1000);
    }
    setIsMobileMenuOpen(false); // Close mobile menu on navigation
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
          <div className="hidden lg:flex items-center space-x-6 xl:space-x-8 px-4 xl:px-6 py-3">
            <div className="flex items-center space-x-4 xl:space-x-6 text-sm font-medium">
              {navItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.link)}
                  className="text-gray-700 dark:text-gray-300 hover:text-forest dark:hover:text-green-400 transition-colors whitespace-nowrap"
                  data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                  disabled={isNavigating}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <Button 
              className="bg-forest hover:bg-forest/80 text-white px-3 xl:px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
              data-testid="button-donate"
              onClick={() => handleNavigation('/donate')}
            >
              Doe Agora
            </Button>
          </div>

          {/* Tablet Menu */}
          <div className="hidden md:flex lg:hidden items-center justify-between px-4 py-3">
            <div className="flex items-center space-x-4 text-sm font-medium overflow-x-auto">
              {navItems.slice(0, 4).map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleNavigation(item.link)}
                  className="text-gray-700 dark:text-gray-300 hover:text-forest dark:hover:text-green-400 transition-colors whitespace-nowrap"
                  data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                  disabled={isNavigating}
                >
                  {item.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300 hover:text-forest dark:hover:text-green-400 transition-colors"
              data-testid="tablet-menu-toggle"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">IDASAM</span>
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
                      href={item.link}
                      className="text-gray-700 dark:text-gray-300 hover:text-forest dark:hover:text-green-400 transition-colors text-sm font-medium py-2 text-left"
                      data-testid={`mobile-nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                      onClick={() => handleNavigation(item.link)}
                      disabled={isNavigating}
                    >
                      {item.name}
                    </button>
                  ))}
                  <Button 
                    className="bg-forest hover:bg-forest/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-3 w-full"
                    data-testid="mobile-button-donate"
                    onClick={() => handleNavigation('/donate')} // Assuming a donate route
                  >
                    Doe Agora
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}