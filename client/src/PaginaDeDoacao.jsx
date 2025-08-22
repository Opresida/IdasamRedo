import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { Globe, Users, Droplet } from 'lucide-react';

// Importe o componente de doação em Dólar
import DonationFormUSD from './DonationFormUSD';
// Importe o componente de Footer
import ShadcnblocksComFooter2 from './components/shadcnblocks-com-footer2';

// Carrega o Stripe com sua chave publicável lida dos "Secrets" do Replit
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Array com as fotos das ações para a galeria
const actionPhotos = [
  'https://i.imgur.com/Y5VDCBT.jpeg',
  'https://i.imgur.com/SxJV1TT.jpeg',
  'https://i.imgur.com/5rQEJFb.jpeg',
  'https://i.imgur.com/1gi4Eay.jpeg'
];

const PaginaDeDoacao = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-grow">
        {/* Seção Hero - Imagem de Fundo ATUALIZADA */}
        <div 
          className="relative bg-cover bg-center h-80 md:h-96" 
          style={{backgroundImage: "url('https://i.imgur.com/R9rQRGL.jpeg')"}}
        >
          {/* O conteúdo de texto foi removido pois já está na imagem */}
        </div>

        {/* Conteúdo Principal da Página */}
        <div className="py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">

              {/* Coluna Esquerda: Copy e Galeria */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-[#2A5B46] mb-4">O Impacto Real da Sua Doação</h2>
                  <p className="text-lg text-gray-700 leading-relaxed">
                    A Amazônia pode parecer distante, mas os desafios enfrentados por suas comunidades são universais. A falta de acesso a recursos básicos é uma realidade diária. Com o apoio de pessoas como você, conseguimos levar ajuda vital diretamente para as famílias que vivem às margens dos rios.
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
                      <div className="bg-[#4E8D7C]/20 p-3 rounded-full">
                          <Users className="w-6 h-6 text-[#2A5B46]" />
                      </div>
                      <p className="text-lg text-gray-800"><strong>Comunidades Fortalecidas:</strong> Sua doação apoia diretamente centenas de famílias ribeirinhas.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="bg-[#4E8D7C]/20 p-3 rounded-full">
                          <Droplet className="w-6 h-6 text-[#2A5B46]" />
                      </div>
                      <p className="text-lg text-gray-800"><strong>Acesso à Água e Alimento:</strong> Levamos cestas básicas e soluções de água potável a locais remotos.</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="bg-[#4E8D7C]/20 p-3 rounded-full">
                          <Globe className="w-6 h-6 text-[#2A5B46]" />
                      </div>
                      <p className="text-lg text-gray-800"><strong>Preservação Ambiental:</strong> Ao fortalecer as comunidades, ajudamos a proteger a floresta e seus guardiões.</p>
                   </div>
                </div>
              </div>

              {/* Coluna Direita: Formulário de Doação */}
              <div className="sticky top-28">
                <Elements stripe={stripePromise}>
                  <DonationFormUSD />
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

export default PaginaDeDoacao;
