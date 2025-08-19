import React from 'react';
import { Target, Eye, Heart, Calendar } from 'lucide-react';

export default function AboutSection() {
  return (
    <section id="quem-somos" className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-sand/30 to-white" data-testid="about-section">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <div className="flex justify-center mb-4 sm:mb-6">
            <div className="border border-forest/20 py-2 px-4 sm:px-6 rounded-full bg-sand/50 backdrop-blur-sm">
              <span className="text-forest font-medium text-sm sm:text-base">Quem Somos</span>
            </div>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-forest mb-4 sm:mb-6 px-4 leading-tight" data-testid="about-title">
            Instituto de Desenvolvimento do Amazonas
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed px-4" data-testid="about-description">
            O IDASAM é uma organização dedicada ao desenvolvimento sustentável da região amazônica através de pesquisa, 
            inovação e parcerias estratégicas que promovem o equilíbrio entre preservação ambiental e progresso social.
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