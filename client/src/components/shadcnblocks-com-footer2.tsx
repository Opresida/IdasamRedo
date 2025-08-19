import React from 'react';
import { Linkedin, Instagram, Facebook } from 'lucide-react';

interface MenuSection {
  title: string;
  items: string[];
}

const menuItems: MenuSection[] = [
  {
    title: "Institucional",
    items: ["Sobre Nós", "Equipe", "Notícias", "Contato"]
  },
  {
    title: "Atuação", 
    items: ["Bioeconomia", "Projetos", "Governança Territorial"]
  },
  {
    title: "Transparência",
    items: ["Legislação", "Relatórios"]
  }
];

export default function ShadcnblocksComFooter2() {
  return (
    <footer id="contato" className="bg-forest text-white py-16 px-4" data-testid="footer">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          {/* Logo and description */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-6" data-testid="footer-logo">
              <img 
                src="https://i.imgur.com/01OfFEi.png" 
                alt="Logomarca Idasam" 
                className="w-[153px] h-[133px] object-contain" 
                title="Idasam"
              />
            </div>
            <p className="text-gray-300 leading-relaxed mb-6" data-testid="footer-tagline">
              Inovação e Tecnologia para o Desenvolvimento da Amazônia.
            </p>
            <div className="flex space-x-4" data-testid="social-links">
              <a href="#" className="text-gray-300 hover:text-white transition-colors" data-testid="link-linkedin">
                <Linkedin className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" data-testid="link-instagram">
                <Instagram className="w-6 h-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors" data-testid="link-facebook">
                <Facebook className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Menu sections */}
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} data-testid={`footer-section-${section.title.toLowerCase()}`}>
              <h3 className="text-xl font-semibold mb-6">{section.title}</h3>
              <ul className="space-y-3">
                {section.items.map((item, itemIndex) => (
                  <li key={itemIndex}>
                    <a 
                      href="#" 
                      className="text-gray-300 hover:text-white transition-colors"
                      data-testid={`footer-link-${item.toLowerCase().replace(' ', '-')}`}
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-600 pt-8">
          <div className="text-center text-gray-300 space-y-4">
            <p className="text-sm leading-relaxed max-w-4xl mx-auto" data-testid="compliance-info">
              O Instituto de Desenvolvimento Ambiental e Social da Amazônia – IDASAM (CNPJ: 02.906.177/0001-87) 
              cumpre rigorosamente as leis brasileiras de combate à corrupção, assegurando transparência, ética e 
              integridade em todas as suas atividades.
            </p>
            <p data-testid="copyright">
              © 2024 Idasam. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}