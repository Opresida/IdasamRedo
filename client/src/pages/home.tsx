import React from 'react';
import FloatingNavbar from '@/components/floating-navbar';
import AnimatedHero from '@/components/animated-hero';
import AboutSection from '@/components/about-section';
import AnimatedTestimonials from '@/components/animated-testimonials';
import TestimonialsSection from '@/components/testimonials-section';
import GlobeFeatureSection from '@/components/ui/globe-feature-section';
import Logos3 from '@/components/logos3';
import { List2 } from '@/components/ui/list-2';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import WhatsAppFloat from '@/components/whatsapp-float';
import CoracaoRibeirinhoSection from '@/components/coracao-ribeirinho-section';

export default function Home() {
  return (
    <div className="font-inter bg-sand text-gray-800" data-testid="home-page">
      <FloatingNavbar />
      <AnimatedHero />
      <AboutSection />
      <AnimatedTestimonials />
      <TestimonialsSection />
      <GlobeFeatureSection />
      <Logos3 />
      <List2 />
      {/* Nossa Equipe de Pesquisadores */}
      <section className="py-20 bg-gradient-to-br from-sand/30 to-teal/5">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-6">
              <div className="border border-forest/20 py-2 px-6 rounded-full bg-sand/50 backdrop-blur-sm">
                <span className="text-forest font-medium">Pesquisa e Inovação</span>
              </div>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-forest mb-6">
              Nossa Equipe de Pesquisadores
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Profissionais dedicados à pesquisa científica e inovação tecnológica para o desenvolvimento sustentável da Amazônia
            </p>
          </div>

          <TestimonialsSection />
        </div>
      </section>

      {/* Projeto Coração Ribeirinho */}
      <CoracaoRibeirinhoSection />

      {/* Seção de Contato */}
      <ShadcnblocksComFooter2 />
      <WhatsAppFloat />
    </div>
  );
}