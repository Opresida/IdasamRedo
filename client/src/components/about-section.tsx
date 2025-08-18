import React from 'react';
import { Target, Eye, Heart, Calendar } from 'lucide-react';

export default function AboutSection() {
  return (
    <section className="py-20 px-4" data-testid="about-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-forest mb-6" data-testid="about-title">
            Sobre o Idasam
          </h2>
          <p className="text-xl text-gray-600 max-w-5xl mx-auto mb-8" data-testid="about-description">
            O Instituto de Desenvolvimento Ambiental e Social da Amazônia (IDASAM) é uma entidade privada fundada em 1996 na capital do Amazonas, com foco em desenvolver soluções transformadoras para o mundo sustentável.
          </p>
          <p className="text-lg text-gray-600 max-w-4xl mx-auto" data-testid="about-additional-info">
            Promovemos impacto positivo em políticas públicas, modelos de negócio e tomada de decisão junto a governos, empresas, organizações multilaterais e da sociedade civil, atuando para o fortalecimento da região amazônica e impulsionando a bioeconomia.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center group" data-testid="founded-card">
            <div className="w-20 h-20 bg-forest/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-forest/20 transition-colors">
              <Calendar className="w-10 h-10 text-forest" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-2">1996</h3>
            <p className="text-gray-600 leading-relaxed">
              Fundado em Manaus, Amazonas
            </p>
          </div>
          
          <div className="text-center group" data-testid="mission-card">
            <div className="w-20 h-20 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-200 transition-colors">
              <Target className="w-10 h-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-2">Missão</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Contribuir para um futuro sustentável através de projetos e inovação tecnológica
            </p>
          </div>
          
          <div className="text-center group" data-testid="vision-card">
            <div className="w-20 h-20 bg-teal/10 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal/20 transition-colors">
              <Eye className="w-10 h-10 text-teal" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-2">Visão</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Organização de excelência na geração de conhecimento e inovações sustentáveis
            </p>
          </div>
          
          <div className="text-center group" data-testid="values-card">
            <div className="w-20 h-20 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-amber-200 transition-colors">
              <Heart className="w-10 h-10 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-2">Valores</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Responsabilidade, ética e foco nos Objetivos de Desenvolvimento Sustentável
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12">
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="mission-detail-card">
            <div className="w-16 h-16 bg-forest/10 rounded-xl flex items-center justify-center mb-6">
              <Target className="w-8 h-8 text-forest" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-4">Nossa Missão</h3>
            <p className="text-gray-600 leading-relaxed">
              Contribuir para um futuro mais sustentável através da criação de projetos e plataformas focados na inovação tecnológica para o desenvolvimento da Amazônia.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="vision-detail-card">
            <div className="w-16 h-16 bg-teal/10 rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-8 h-8 text-teal" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-4">Nossa Visão</h3>
            <p className="text-gray-600 leading-relaxed">
              Estabelecer uma organização de excelência na geração do conhecimento e na promoção de inovações com o foco na construção de um futuro mais sustentável e um padrão de vida mais saudável.
            </p>
          </div>
          
          <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow" data-testid="values-detail-card">
            <div className="w-16 h-16 bg-amber-100 rounded-xl flex items-center justify-center mb-6">
              <Heart className="w-8 h-8 text-amber-600" />
            </div>
            <h3 className="text-2xl font-bold text-forest mb-4">Nossos Valores</h3>
            <p className="text-gray-600 leading-relaxed">
              Agir com responsabilidade e ética nos aspectos tecnológicos, ambiental e social, baseadas no conceito de localização dos ODS, implementando desafios globais em escala local.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
