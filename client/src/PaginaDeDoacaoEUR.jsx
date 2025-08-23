
import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Globe, Users, Droplet } from 'lucide-react';

// Importe o componente de doação em Euro
import DonationFormEUR from './DonationFormEUR';
// Importe o componente de Footer
import ShadcnblocksComFooter2 from './components/shadcnblocks-com-footer2';
// Importe o menu flutuante e botão WhatsApp
import FloatingNavbar from './components/floating-navbar';
import WhatsAppFloat from './components/whatsapp-float';

// Carrega o Stripe com sua chave publicável
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Array com as fotos das ações para a galeria
const actionPhotos = [
  'https://i.imgur.com/Y5VDCBT.jpeg',
  'https://i.imgur.com/SxJV1TT.jpeg',
  'https://i.imgur.com/5rQEJFb.jpeg',
  'https://i.imgur.com/1gi4Eay.jpeg'
];

const PaginaDeDoacaoEUR = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FloatingNavbar />
      <WhatsAppFloat />
      <main className="flex-grow">
        {/* Seção Hero - Imagem de Fundo */}
        <div 
          className="relative bg-cover bg-center h-80 md:h-96" 
          style={{backgroundImage: "url('https://i.imgur.com/R9rQRGL.jpeg')"}}
        >
          {/* Overlay com gradiente e bandeira da EU */}
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🇪🇺</div>
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Doação em Euro</h1>
              <p className="text-xl md:text-2xl">Apoie nossos projetos na Amazônia</p>
            </div>
          </div>
        </div>

        {/* Conteúdo Principal da Página */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              {/* Coluna Esquerda: Copy e Galeria */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#2A5B46] mb-4">Seu Apoio Internacional Faz a Diferença</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    A preservação da Amazônia é uma causa global. Através de sua doação em Euro, você se junta a apoiadores de toda a Europa e do mundo que acreditam na importância de proteger a maior floresta tropical do planeta e apoiar suas comunidades tradicionais.
                  </p>
                </div>

                {/* Galeria de Fotos */}
                <div>
                  <h3 className="text-2xl font-semibold text-[#2A5B46] mb-4">Veja Nossas Ações</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {actionPhotos.map((photo, index) => (
                      <img 
                        key={index}
                        src={photo} 
                        alt={`Ação do IDASAM na comunidade ${index + 1}`}
                        className="rounded-lg shadow-md aspect-video object-cover w-full h-full"
                      />
                    ))}
                  </div>
                </div>

                {/* Ícones de Impacto */}
                <div className="space-y-4 pt-4">
                   <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                          <Users className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-lg text-gray-800"><strong>Impacto Global:</strong> Sua doação conecta a Europa à Amazônia em prol da sustentabilidade.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                          <Droplet className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-lg text-gray-800"><strong>Preservação Internacional:</strong> Apoie projetos que beneficiam todo o planeta.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="bg-purple-100 p-3 rounded-full">
                          <Globe className="w-6 h-6 text-purple-600" />
                      </div>
                      <p className="text-lg text-gray-800"><strong>Cooperação Global:</strong> Una-se a uma rede internacional de defensores da Amazônia.</p>
                   </div>
                </div>
              </div>

              {/* Coluna Direita: Formulário de Doação */}
              <div className="sticky top-28">
                <Elements stripe={stripePromise}>
                  <DonationFormEUR />
                </Elements>
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Footer no final da página */}
      <ShadcnblocksComFooter2 />
    </div>
  );
};

export default PaginaDeDoacaoEUR;
