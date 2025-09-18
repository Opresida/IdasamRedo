
import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const DonationFormEUR = () => {
  const [amount, setAmount] = useState(25); // Valor padrão em EUR
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

    // 1. Chama a Edge Function no Supabase para criar a intenção de pagamento em EUR
    const { data, error: funcError } = await supabase.functions.invoke('stripe-payment-intent-eur', {
      body: { amount: amount, currency: 'eur' }
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

  if (succeeded) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
        <div className="text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-green-600 mb-4">Obrigado pela sua doação!</h3>
          <p className="text-gray-600 mb-6">
            Sua contribuição de <strong>€{amount}</strong> foi processada com sucesso. 
            Você receberá um comprovante por email.
          </p>
          <p className="text-sm text-gray-500">
            Sua doação ajudará diretamente nossos projetos na Amazônia. Obrigado por fazer parte desta causa!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="text-4xl mb-4">🇪🇺</div>
        <h3 className="text-2xl font-bold text-purple-600 mb-2">Doação em Euro</h3>
        <p className="text-gray-600">Contribua para transformar a Amazônia</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Seleção de Valor */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Valor da Doação (EUR)
          </label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[25, 50, 100].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setAmount(value)}
                className={`py-2 px-4 rounded-lg border-2 transition-all ${
                  amount === value
                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-purple-300'
                }`}
              >
                €{value}
              </button>
            ))}
          </div>
          
          {/* Valor personalizado */}
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500">€</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              placeholder="Valor personalizado"
              min="5"
              className="w-full pl-8 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Informações do Cartão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Informações do Cartão
          </label>
          <div className="border-2 border-gray-200 rounded-lg p-4 focus-within:border-purple-500 transition-colors">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#374151',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Botão de Submissão */}
        <button
          type="submit"
          disabled={!stripe || processing}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-lg transition-colors flex items-center justify-center"
        >
          {processing ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processando...
            </>
          ) : (
            `Doar €${amount}`
          )}
        </button>

        {/* Informações de Segurança */}
        <div className="text-center">
          <p className="text-xs text-gray-500 leading-relaxed">
            🔒 Pagamento seguro processado pelo Stripe.<br/>
            Seus dados estão protegidos com criptografia SSL.
          </p>
        </div>
      </form>
    </div>
  );
};

export default DonationFormEUR;
