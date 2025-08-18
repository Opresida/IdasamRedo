
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface NavItem {
  name: string;
  link: string;
}

const navItems: NavItem[] = [
  { name: "Home", link: "/" },
  { name: "Quem Somos", link: "/quem-somos" },
  { name: "Pesquisadores", link: "/pesquisadores" },
  { name: "Parcerias", link: "/parcerias" },
  { name: "Legislação", link: "/legislacao" },
  { name: "Contato", link: "/contato" }
];

export default function FloatingNavbar() {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  return (
    <nav 
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-5'
      }`}
      data-testid="floating-navbar"
    >
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl border border-gray-200">
        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-8 px-6 py-3">
          <div className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item, index) => (
              <a 
                key={index}
                href={item.link}
                className="text-gray-700 hover:text-forest transition-colors"
                data-testid={`nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                {item.name}
              </a>
            ))}
          </div>
          <Button 
            className="bg-teal hover:bg-teal/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            data-testid="button-donate"
          >
            Doe Agora
          </Button>
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm font-medium text-gray-700">Menu</span>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-700 hover:text-forest transition-colors"
              data-testid="mobile-menu-toggle"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
          
          {/* Mobile Menu Items */}
          {isMobileMenuOpen && (
            <div className="border-t border-gray-200 bg-white/95 backdrop-blur-md rounded-b-2xl">
              <div className="flex flex-col px-4 py-3 space-y-3">
                {navItems.map((item, index) => (
                  <a 
                    key={index}
                    href={item.link}
                    className="text-gray-700 hover:text-forest transition-colors text-sm font-medium py-2"
                    data-testid={`mobile-nav-link-${item.name.toLowerCase().replace(' ', '-')}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </a>
                ))}
                <Button 
                  className="bg-teal hover:bg-teal/80 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors mt-3 w-full"
                  data-testid="mobile-button-donate"
                >
                  Doe Agora
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
