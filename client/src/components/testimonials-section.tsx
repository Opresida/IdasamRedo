
import React from "react";
import { TestimonialsColumn } from "@/components/ui/testimonials-columns-1";
import { motion } from "motion/react";

const testimonials = [
  {
    text: "O IDASAM tem sido fundamental para o desenvolvimento sustentável da nossa comunidade. Seus projetos trouxeram oportunidades reais de crescimento sem prejudicar o meio ambiente.",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    name: "Carlos Silva",
    role: "Líder Comunitário",
  },
  {
    text: "Os projetos de pesquisa do instituto são revolucionários. Eles conseguem aliar tecnologia de ponta com o respeito às tradições amazônicas, criando soluções inovadoras.",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=100&h=100&fit=crop&crop=face",
    name: "Dra. Maria Santos",
    role: "Pesquisadora Ambiental",
  },
  {
    text: "A abordagem do IDASAM para conservação da biodiversidade é exemplar. Eles demonstram que é possível proteger a Amazônia enquanto promovem o desenvolvimento social.",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    name: "Prof. João Amazonas",
    role: "Biólogo",
  },
  {
    text: "Trabalhar com o IDASAM transformou nossa visão sobre sustentabilidade. Seus métodos científicos rigorosos garantem resultados confiáveis e impacto real.",
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    name: "Ana Ribeiro",
    role: "Coordenadora de Projetos",
  },
  {
    text: "O instituto IDASAM é uma referência em pesquisa aplicada na Amazônia. Sua contribuição para a ciência e para a sociedade é inestimável.",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    name: "Dr. Pedro Floresta",
    role: "Especialista em Ecologia",
  },
  {
    text: "Os projetos do IDASAM geram conhecimento científico de qualidade internacional, sempre com foco na aplicação prática para beneficiar as comunidades locais.",
    image: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face",
    name: "Dra. Lucia Verde",
    role: "Diretora de ONG Ambiental",
  },
  {
    text: "A metodologia do IDASAM para desenvolvimento sustentável deveria ser replicada em toda a região amazônica. Eles são verdadeiros pioneiros.",
    image: "https://images.unsplash.com/photo-1507101105822-7472b28e22ac?w=100&h=100&fit=crop&crop=face",
    name: "Roberto Nascimento",
    role: "Gestor Público",
  },
  {
    text: "Como parceiro do IDASAM, posso afirmar que seus projetos têm impacto transformador nas comunidades. Eles realmente fazem a diferença na Amazônia.",
    image: "https://images.unsplash.com/photo-1464863979621-258859e62245?w=100&h=100&fit=crop&crop=face",
    name: "Carla Mendes",
    role: "Representante Institucional",
  },
  {
    text: "O IDASAM demonstra que pesquisa científica séria e responsabilidade socioambiental podem andar juntas. Seus resultados são impressionantes.",
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face",
    name: "Dr. Fernando Costa",
    role: "Pesquisador Visitante",
  },
];

const firstColumn = testimonials.slice(0, 3);
const secondColumn = testimonials.slice(3, 6);
const thirdColumn = testimonials.slice(6, 9);

const TestimonialsSection = () => {
  return (
    <section className="bg-sand py-20 relative" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="flex flex-col items-center justify-center max-w-[540px] mx-auto"
        >
          <div className="flex justify-center">
            <div className="border border-forest/20 py-2 px-6 rounded-full bg-white/50 backdrop-blur-sm">
              <span className="text-forest font-medium">Testemunhos</span>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight mt-6 text-center text-forest" data-testid="testimonials-title">
            O que dizem sobre o IDASAM
          </h2>
          <p className="text-center mt-6 opacity-75 text-lg text-gray-600 max-w-2xl" data-testid="testimonials-description">
            Veja como nossos projetos e pesquisas têm impactado positivamente a Amazônia e suas comunidades.
          </p>
        </motion.div>

        <div className="flex justify-center gap-6 mt-16 [mask-image:linear-gradient(to_bottom,transparent,black_25%,black_75%,transparent)] max-h-[740px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={15} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={19} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={17} />
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
