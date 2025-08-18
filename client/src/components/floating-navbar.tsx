import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

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

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
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
      <div className="bg-white/90 backdrop-blur-md shadow-xl rounded-2xl px-6 py-3 border border-gray-200">
        <div className="flex items-center space-x-8">
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
      </div>
    </nav>
  );
}
