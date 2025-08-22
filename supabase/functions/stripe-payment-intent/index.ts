
// Nenhuma alteração necessária aqui.
// Este código lê a chave secreta do ambiente seguro do Supabase.
// Certifique-se de que você configurou a STRIPE_SECRET_KEY no painel do Supabase.

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import Stripe from 'https://esm.sh/stripe@11.1.0?target=deno'

// Função para lidar com as requisições
serve(async (req) => {
  // Lida com a requisição pre-flight do CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    }})
  }

  try {
    // Pega o valor da doação do corpo da requisição
    const { amount } = await req.json()

    // Inicializa o Stripe com a chave secreta
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient()
    })

    // Cria a intenção de pagamento no Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Stripe usa centavos
      currency: 'usd',
      payment_method_types: ['card'],
    })

    // Retorna o client_secret para o front-end
    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json' 
      },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Content-Type': 'application/json' 
      },
    })
  }
})
