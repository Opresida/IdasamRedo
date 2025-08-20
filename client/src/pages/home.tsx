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

      {/* Projeto Coração Ribeirinho */}
      <CoracaoRibeirinhoSection />

      {/* Seção de Contato */}
      <ShadcnblocksComFooter2 />
      <WhatsAppFloat />
    </div>
  );
}