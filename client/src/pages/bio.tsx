
import React from 'react';
import { ExternalLink, Instagram, Twitter } from 'lucide-react';

export default function BioPage() {
  const links = [
    {
      title: 'X',
      url: 'https://x.com/institutoidasam',
      description: 'Siga-nos no X',
      icon: <Twitter className="w-5 h-5" />,
      style: 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50'
    },
    {
      title: 'WEBSITE',
      url: 'https://www.idasam.org',
      description: 'Visite nosso site oficial',
      icon: <ExternalLink className="w-5 h-5" />,
      style: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      title: 'PROJETOS',
      url: 'https://www.idasam.org/projetos',
      description: 'Conheça nossos projetos',
      icon: <ExternalLink className="w-5 h-5" />,
      style: 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50'
    },
    {
      title: 'COMPRE TOKEN GOMA',
      url: 'https://www.idasam.org/projetos',
      description: 'Apoie a sustentabilidade',
      icon: <ExternalLink className="w-5 h-5" />,
      style: 'bg-green-600 text-white hover:bg-green-700'
    },
    {
      title: 'DOE',
      url: 'https://www.idasam.org/doacao-usd',
      description: 'Faça uma doação',
      icon: <ExternalLink className="w-5 h-5" />,
      style: 'bg-white text-gray-800 border-2 border-gray-200 hover:bg-gray-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center p-4">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80')"
        }}
      />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Card Principal */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center bg-white">
            {/* Logo/Icon */}
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2L13.09 8.26L22 7.27L14.18 12.43L21.09 17.74L12 16.75L2.91 17.74L9.82 12.43L2 7.27L10.91 8.26L12 2Z"/>
              </svg>
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">INSTITUTO IDASAM</h1>
            <p className="text-gray-600 text-sm italic">Links</p>
          </div>

          {/* Links */}
          <div className="px-8 pb-8 space-y-4">
            {links.map((link, index) => (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full block px-6 py-4 rounded-full text-center font-semibold text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${link.style}`}
              >
                <div className="flex items-center justify-center gap-2">
                  {link.icon}
                  {link.title}
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* Footer Card */}
        <div className="mt-6 bg-gray-800 rounded-3xl p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-white rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-800" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L13.09 8.26L22 7.27L14.18 12.43L21.09 17.74L12 16.75L2.91 17.74L9.82 12.43L2 7.27L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          
          <p className="text-white text-sm leading-relaxed mb-4">
            O Instituto de Desenvolvimento Ambiental e Social da Amazônia (IDASAM) é uma entidade privada, fundada em 1996 na capital do Amazonas, com foco em desenvolver soluções transformadoras para o mundo sustentável.
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-gray-400 text-xs">@institutoidasam</p>
            <p className="text-white text-lg font-script italic">Santa Abyss</p>
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-700">
            <p className="text-gray-400 text-xs">www.idasam.org</p>
          </div>
        </div>

        {/* Instagram Link Especial */}
        <div className="mt-4 text-center">
          <a
            href="https://www.instagram.com/instituto_idasam/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-3 rounded-full font-semibold text-sm hover:shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <Instagram className="w-5 h-5" />
            Instagram
          </a>
        </div>
      </div>
    </div>
  );
}
