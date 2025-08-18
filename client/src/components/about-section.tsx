import React from 'react';
import { Target, Eye, Heart } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-20 px-4" data-testid="about-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-forest mb-6" data-testid="about-title">
            Sobre o Idasam
          </h2>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto" data-testid="about-description">
            Desde 1996, desenvolvendo soluções inovadoras para o crescimento sustentável da região amazônica através da pesquisa científica e tecnologia.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-12">
          <div className="text-center group" data-testid="mission-card">
            <div className="w-20 h-20 bg-forest/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-forest/20 transition-colors">
              <Target className="w-10 h-10 text-forest" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-4">Missão</h3>
            <p className="text-gray-600 leading-relaxed">
              Promover o desenvolvimento sustentável da Amazônia através de pesquisa científica, inovação tecnológica e parcerias estratégicas que beneficiem as comunidades locais e o meio ambiente.
            </p>
          </div>
          
          <div className="text-center group" data-testid="vision-card">
            <div className="w-20 h-20 bg-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal/20 transition-colors">
              <Eye className="w-10 h-10 text-teal" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-4">Visão</h3>
            <p className="text-gray-600 leading-relaxed">
              Ser referência internacional em desenvolvimento sustentável amazônico, conectando ciência, tecnologia e práticas tradicionais para construir um futuro próspero e equilibrado.
            </p>
          </div>
          
          <div className="text-center group" data-testid="values-card">
            <div className="w-20 h-20 bg-terracotta/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-terracotta/20 transition-colors">
              <Heart className="w-10 h-10 text-terracotta" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-4">Valores</h3>
            <p className="text-gray-600 leading-relaxed">
              Sustentabilidade, inovação, transparência, colaboração e respeito às comunidades tradicionais amazônicas são os pilares que guiam todas as nossas ações e projetos.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
