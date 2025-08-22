import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { supabase } from './supabaseClient'; // Importa o cliente Supabase

const DonationFormUSD = () => {
  const [amount, setAmount] = useState(25); // Valor padrão em USD
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const stripe = useStripe();
  const elements = useElements();

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!stripe || !elements) {
      // Stripe.js ainda não carregou.
      return;
    }
    setProcessing(true);

    // 1. Chama a Edge Function no Supabase para criar a intenção de pagamento
    const { data, error: funcError } = await supabase.functions.invoke('stripe-payment-intent', {
      body: { amount: amount }
    });

    if (funcError) {
      setError(`Erro no servidor: ${funcError.message}`);
      setProcessing(false);
      return;
    }

    const { clientSecret } = data;

    // 2. Usa o clientSecret para confirmar o pagamento no front-end
    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
        billing_details: {
          // Opcional: você pode adicionar campos para nome, email, etc.
          name: 'Doador Internacional',
        },
      },
    });

    if (payload.error) {
      setError(`Pagamento falhou: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      setProcessing(false);
      setSucceeded(true);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl space-y-6 mt-12">
      <h3 className="text-2xl font-bold text-[#2A5B46] text-center">
        Doar em Dólar (USD)
      </h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-semibold text-gray-800 text-center">
            Valor da doação (USD):
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full p-3 mt-2 border-2 border-gray-300 rounded-lg focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition"
          />
        </div>
        <div className="p-3 border-2 border-gray-300 rounded-lg">
          <CardElement options={{style: {base: {fontSize: '16px'}}}} />
        </div>
        <button 
          disabled={processing || succeeded || !stripe}
          className="w-full bg-[#FBBF24] hover:bg-yellow-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-[#2A5B46] font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          {processing ? "Processando..." : `Doar $${amount}`}
        </button>
        {error && <div className="text-red-500 text-center">{error}</div>}
        {succeeded && <div className="text-green-600 text-center font-bold">Doação realizada com sucesso! Muito obrigado!</div>}
      </form>
    </div>
  );
};

export default DonationFormUSD;
