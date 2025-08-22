import React from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Importe o componente de doação em Dólar
import DonationFormUSD from './DonationFormUSD';

// Carrega o Stripe com sua chave publicável lida dos "Secrets" do Replit
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaginaDeDoacao = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-20">
      {/* Seção de Doação em Dólar para o exterior */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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