import { useEffect } from 'react';
import ScrollExpandMedia from '@/components/ui/scroll-expansion-hero';
import { Button } from '@/components/ui/button';
import { MoveRight, PhoneCall } from 'lucide-react';

interface HeroContentProps {
  overview: string;
  mission: string;
}

const ModernHeroContent = ({ overview, mission }: HeroContentProps) => {
  return (
    <div className='max-w-4xl mx-auto' data-testid="hero-content">
      <div className="text-center mb-16">
        <h2 className='text-4xl md:text-5xl font-bold mb-8 text-forest'>
          Instituto de Desenvolvimento Ambiental e Social da Amazônia
        </h2>
        <p className='text-xl mb-8 text-gray-600 leading-relaxed'>
          {overview}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
        <div>
          <h3 className="text-3xl font-bold text-forest mb-6">Nossa Missão</h3>
          <p className='text-lg text-gray-600 leading-relaxed mb-8'>
            {mission}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="bg-forest hover:bg-forest/80 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg"
              data-testid="button-projects"
            >
              Nossos Projetos
              <MoveRight className="w-5 h-5" />
            </Button>
            <Button 
              className="bg-terracotta hover:bg-terracotta/80 text-white px-8 py-4 rounded-lg text-lg font-semibold flex items-center gap-3 transition-all duration-300 shadow-lg"
              data-testid="button-contact"
            >
              Fale Conosco
              <PhoneCall className="w-5 h-5" />
            </Button>
          </div>
        </div>
        
        <div className="bg-sand rounded-2xl p-8 shadow-lg">
          <h4 className="text-2xl font-bold text-forest mb-4">Fundado em 1996</h4>
          <p className="text-gray-600 leading-relaxed">
            Há mais de 25 anos desenvolvendo soluções inovadoras para o crescimento sustentável da região amazônica através da pesquisa científica e tecnologia aplicada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default function ModernHero() {
  const heroData = {
    overview: "Uma entidade privada com foco em desenvolver soluções transformadoras para o mundo sustentável, promovendo impacto positivo em políticas públicas, modelos de negócio e tomada de decisão.",
    mission: "Contribuir para um futuro mais sustentável através da criação de projetos e plataformas focados na inovação tecnológica para o desenvolvimento da Amazônia."
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    const resetEvent = new Event('resetSection');
    window.dispatchEvent(resetEvent);
  }, []);

  return (
    <div className='min-h-screen' data-testid="modern-hero">
      <ScrollExpandMedia
        mediaType="video"
        mediaSrc="https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYuZ5R8ahEEZ4aQK56LizRdfBSqeDMsmUIrJN1"
        posterSrc="https://images.pexels.com/videos/5752729/space-earth-universe-cosmos-5752729.jpeg"
        bgImageSrc="https://me7aitdbxq.ufs.sh/f/2wsMIGDMQRdYMNjMlBUYHaeYpxduXPVNwf8mnFA61L7rkcoS"
        title="Immersive Video Experience"
        date="Cosmic Journey"
        scrollToExpand="Scroll to Expand Demo"
        textBlend={true}
      >
        <ModernHeroContent 
          overview={heroData.overview}
          mission={heroData.mission}
        />
      </ScrollExpandMedia>
    </div>
  );
}