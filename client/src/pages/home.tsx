import React from 'react';
import FloatingNavbar from '@/components/floating-navbar';
import AnimatedHero from '@/components/animated-hero';
import AboutSection from '@/components/about-section';
import AnimatedTestimonials from '@/components/animated-testimonials';
import Logos3 from '@/components/logos3';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';

export default function Home() {
  return (
    <div className="font-inter bg-sand text-gray-800" data-testid="home-page">
      <FloatingNavbar />
      <AnimatedHero />
      <AboutSection />
      <AnimatedTestimonials />
      <Logos3 />
      <ShadcnblocksComFooter2 />
    </div>
  );
}
