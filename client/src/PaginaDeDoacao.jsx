import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Importe seus componentes
import CoracaoRibeirinhoSection from './CoracaoRibeirinhoSection'; // Seu componente de doação PIX
import DonationFormUSD from './DonationFormUSD'; // O novo componente de doação em Dólar

// Carrega o Stripe com sua chave publicável lida dos "Secrets" do Replit
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaginaDeDoacao = () => {
  return (
    <div>
      {/* Seção de Doação em PIX para o Brasil */}
      <CoracaoRibeirinhoSection />

      {/* Seção de Doação em Dólar para o exterior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="max-w-xl mx-auto">
           <Elements stripe={stripePromise}>
            <DonationFormUSD />
          </Elements>
        </div>
      </div>
    </div>
  );
};

export default PaginaDeDoacao;