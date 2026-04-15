import React, { useState, useEffect, useRef } from 'react';
import { Heart, QrCode, Copy, Check, ArrowLeft, Clock, CheckCircle2, CreditCard, Banknote } from 'lucide-react';
import FloatingNavbar from '@/components/floating-navbar';
import WhatsAppFloat from '@/components/whatsapp-float';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

type CardProcessor = 'cielo' | 'stripe';

function StripeCardSection({
  amount,
  onSuccess,
}: {
  amount: number;
  onSuccess: (brl: number) => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ usd: number; rate: number } | null>(null);
  const [holder, setHolder] = useState('');

  useEffect(() => {
    let cancelled = false;
    if (!amount || amount <= 0) {
      setPreview(null);
      return;
    }
    fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
      .then((r) => r.json())
      .then((d: any) => {
        const rate = Number(d?.USDBRL?.bid);
        if (cancelled || !rate) return;
        setPreview({ usd: Number((amount / rate).toFixed(2)), rate });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [amount]);

  const handleSubmit = async () => {
    setError('');
    if (!stripe || !elements) return;
    if (!holder.trim()) {
      setError('Informe o nome do titular.');
      return;
    }
    setProcessing(true);
    try {
      const resp = await fetch('/api/create-payment-intent-stripe-brl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.message || 'Erro ao iniciar pagamento.');
        setProcessing(false);
        return;
      }
      const cardEl = elements.getElement(CardElement);
      if (!cardEl) {
        setError('Formulario do cartao nao carregado.');
        setProcessing(false);
        return;
      }
      const payload = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: cardEl,
          billing_details: { name: holder.trim() },
        },
      });
      if (payload.error) {
        setError(payload.error.message || 'Pagamento nao autorizado.');
        setProcessing(false);
        return;
      }
      onSuccess(amount);
    } catch (e: any) {
      setError(e?.message || 'Erro de conexao.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-4 pt-2 border-t border-gray-100">
      {preview && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-sm text-blue-800">
          R$ {amount} sera cobrado como <strong>US$ {preview.usd.toFixed(2)}</strong>{' '}
          <span className="text-blue-600">(cotacao USD/BRL {preview.rate.toFixed(4)})</span>.
          O valor em reais aparecera na sua fatura conforme a conversao do cartao.
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nome do titular (como no cartao)
        </label>
        <input
          type="text"
          placeholder="NOME COMPLETO"
          value={holder}
          onChange={(e) => setHolder(e.target.value.toUpperCase())}
          className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Dados do cartao
        </label>
        <div className="p-3 border-2 border-gray-300 rounded-xl">
          <CardElement options={{ style: { base: { fontSize: '16px' } } }} />
        </div>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={processing || !stripe || !amount || amount <= 0}
        className="w-full bg-[#2A5B46] hover:bg-[#1e4434] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
      >
        {processing ? (
          <>
            <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <span>Processando pagamento...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-6 h-6" />
            <span>Pagar com Cartao (Stripe)</span>
          </>
        )}
      </button>
      <p className="text-xs text-center text-gray-500">
        Pagamento internacional processado pela Stripe. Cobranca em USD com conversao automatica para reais pelo seu banco.
      </p>
    </div>
  );
}

const presetValues = [
  { value: 25, label: 'R$ 25' },
  { value: 50, label: 'R$ 50' },
  { value: 120, label: 'R$ 120 — 1 Cesta Basica' },
];

interface PixData {
  qrCodeBase64: string;
  pixCode: string;
  expiresAt: number;
  paymentId: string;
}

type PaymentMethod = 'pix' | 'card';

function detectBrand(number: string): string {
  const n = number.replace(/\s/g, '');
  if (/^4/.test(n)) return 'Visa';
  if (/^(5[1-5]|2[2-7])/.test(n)) return 'Master';
  if (/^(34|37)/.test(n)) return 'Amex';
  if (/^(401178|401179|431274|438935|451416|457393|457631|457632|504175|627780|636297|636368|6550[0-1]|65502[1-9]|6550[3-5])/.test(n)) return 'Elo';
  return '';
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2);
  return digits;
}

export default function DoacaoReal() {
  const [method, setMethod] = useState<PaymentMethod>('pix');
  const [processor, setProcessor] = useState<CardProcessor>('cielo');
  const [selectedValue, setSelectedValue] = useState<number>(50);
  const [customValue, setCustomValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  // PIX state
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Card state
  const [cardNumber, setCardNumber] = useState('');
  const [holder, setHolder] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [detectedBrand, setDetectedBrand] = useState('');

  const effectiveAmount = customValue ? Number(customValue) : selectedValue;

  // PIX countdown timer
  useEffect(() => {
    if (!pixData) return;
    const interval = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const diff = pixData.expiresAt - now;
      if (diff <= 0) {
        setTimeLeft('Expirado');
        clearInterval(interval);
        return;
      }
      const hours = Math.floor(diff / 3600);
      const minutes = Math.floor((diff % 3600) / 60);
      const seconds = diff % 60;
      setTimeLeft(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [pixData]);

  // PIX polling
  useEffect(() => {
    if (!pixData) return;
    const checkStatus = async () => {
      try {
        const resp = await fetch(`/api/pix-status/${pixData.paymentId}`);
        if (!resp.ok) return;
        const data = await resp.json();
        if (data.confirmed) {
          if (pollRef.current) clearInterval(pollRef.current);
          setPaidAmount(effectiveAmount);
          setPaid(true);
          setPixData(null);
        }
      } catch {}
    };
    pollRef.current = setInterval(checkStatus, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pixData]);

  // Auto-detect brand
  useEffect(() => {
    setDetectedBrand(detectBrand(cardNumber));
  }, [cardNumber]);

  const handleGeneratePix = async () => {
    if (!effectiveAmount || effectiveAmount <= 0) {
      setError('Por favor, informe um valor valido.');
      return;
    }
    setError('');
    setIsLoading(true);
    setPixData(null);
    setPaid(false);
    try {
      const resp = await fetch('/api/create-payment-intent-pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: effectiveAmount }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.message || 'Erro ao gerar QR Code. Tente novamente.');
        return;
      }
      if (!data.qrCodeBase64 || !data.pixCode || !data.paymentId) {
        setError('O QR Code Pix nao foi gerado corretamente. Tente novamente.');
        return;
      }
      const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
      setPixData({ ...data, expiresAt });
    } catch {
      setError('Erro de conexao. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayCard = async () => {
    if (!effectiveAmount || effectiveAmount <= 0) {
      setError('Por favor, informe um valor valido.');
      return;
    }
    const rawCard = cardNumber.replace(/\s/g, '');
    if (rawCard.length < 13) {
      setError('Numero do cartao invalido.');
      return;
    }
    if (!holder.trim()) {
      setError('Informe o nome do titular.');
      return;
    }
    const expiryDigits = expiry.replace(/\D/g, '');
    if (expiryDigits.length !== 4) {
      setError('Validade invalida. Use o formato MM/AA.');
      return;
    }
    if (cvv.length < 3) {
      setError('CVV invalido.');
      return;
    }
    if (!detectedBrand) {
      setError('Bandeira do cartao nao identificada. Verifique o numero.');
      return;
    }

    const month = expiryDigits.slice(0, 2);
    const year = '20' + expiryDigits.slice(2);
    const expirationDate = `${month}/${year}`;

    setError('');
    setIsLoading(true);
    setPaid(false);
    try {
      const resp = await fetch('/api/create-payment-intent-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: effectiveAmount,
          customerName: holder.trim(),
          cardNumber: rawCard,
          holder: holder.trim(),
          expirationDate,
          securityCode: cvv,
          brand: detectedBrand,
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        setError(data.message || 'Pagamento nao autorizado. Verifique os dados do cartao.');
        return;
      }
      if (data.success) {
        setPaidAmount(effectiveAmount);
        setPaid(true);
      } else {
        setError(data.message || 'Pagamento nao aprovado.');
      }
    } catch {
      setError('Erro de conexao. Verifique sua internet e tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!pixData) return;
    try {
      await navigator.clipboard.writeText(pixData.pixCode);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = pixData.pixCode;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleReset = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setPixData(null);
    setError('');
    setCopied(false);
    setPaid(false);
    setCardNumber('');
    setHolder('');
    setExpiry('');
    setCvv('');
    setDetectedBrand('');
  };

  const brandLabel: Record<string, string> = {
    Visa: 'Visa',
    Master: 'Mastercard',
    Amex: 'American Express',
    Elo: 'Elo',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <FloatingNavbar />
      <WhatsAppFloat />

      <main className="flex-grow">
        <div
          className="relative bg-cover bg-center h-64 md:h-80 flex items-end"
          style={{ backgroundImage: "url('https://i.imgur.com/i74pvbH.jpeg')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10 w-full">
            <div className="flex items-center gap-3">
              <Heart className="w-8 h-8 text-yellow-400" />
              <h1 className="text-3xl md:text-4xl font-bold text-white">Doacao em Real</h1>
            </div>
            <p className="text-white/80 mt-2 text-lg">
              Escolha pagar via PIX ou cartao de credito. Sua doacao transforma vidas na Amazonia.
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {paid ? (
            <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6 text-center">
              <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-bold text-[#2A5B46]">
                Pagamento confirmado!
              </h2>
              <p className="text-gray-600 text-lg">
                Recebemos sua doacao de <strong>R$ {paidAmount}</strong>.<br />
                Muito obrigado por apoiar a Amazonia e as comunidades do IDASAM!
              </p>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 text-[#4E8D7C] hover:text-[#2A5B46] font-medium transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Fazer outra doacao
              </button>
            </div>
          ) : pixData ? (
            /* ──── PIX QR Code View ──── */
            <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6 text-center">
              <Heart className="w-12 h-12 text-[#FBBF24] mx-auto" />
              <h2 className="text-2xl font-bold text-[#2A5B46]">
                Obrigado por apoiar a Amazonia!
              </h2>
              <p className="text-gray-600">
                Escaneie o QR Code ou copie o codigo PIX para concluir sua doacao de{' '}
                <strong>R$ {effectiveAmount}</strong>.
              </p>

              <div className="flex justify-center p-4 bg-gray-50 rounded-2xl border-2 border-gray-100">
                <img
                  src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                  alt="QR Code PIX"
                  className="w-52 h-52 object-contain"
                />
              </div>

              {timeLeft && (
                <div className="flex items-center justify-center gap-2 text-sm text-orange-600 font-medium">
                  <Clock className="w-4 h-4" />
                  <span>Valido por: {timeLeft}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Aguardando confirmacao do pagamento...</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Ou use o codigo copia-e-cola:</p>
                <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-700 font-mono break-all border border-gray-200 text-left max-h-24 overflow-y-auto">
                  {pixData.pixCode}
                </div>
                <button
                  onClick={handleCopy}
                  className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                    copied
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-gray-50 border-gray-300 hover:border-[#FBBF24] hover:bg-yellow-50 text-gray-700'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Codigo copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar codigo PIX
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 text-[#4E8D7C] hover:text-[#2A5B46] font-medium transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
            </div>
          ) : (
            /* ──── Selection + Form View ──── */
            <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6">
              <h2 className="text-2xl font-bold text-[#2A5B46] text-center">
                Escolha o valor da sua doacao
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {presetValues.map((preset) => (
                  <button
                    key={preset.value}
                    onClick={() => {
                      setSelectedValue(preset.value);
                      setCustomValue('');
                      setError('');
                    }}
                    className={`p-3 rounded-xl border-2 font-semibold transition-all text-center text-sm ${
                      selectedValue === preset.value && !customValue
                        ? 'border-[#FBBF24] bg-yellow-50 text-[#2A5B46] ring-2 ring-[#FBBF24]'
                        : 'border-gray-300 bg-white hover:border-[#FBBF24] text-gray-700'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Outro valor (R$)
                </label>
                <input
                  type="number"
                  min="1"
                  placeholder="Ex: 80"
                  value={customValue}
                  onChange={(e) => {
                    setCustomValue(e.target.value);
                    setSelectedValue(0);
                    setError('');
                  }}
                  className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition"
                />
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de pagamento
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => { setMethod('pix'); setError(''); }}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
                      method === 'pix'
                        ? 'border-[#2A5B46] bg-[#2A5B46]/5 text-[#2A5B46] ring-2 ring-[#2A5B46]'
                        : 'border-gray-300 bg-white hover:border-[#2A5B46] text-gray-600'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    PIX
                  </button>
                  <button
                    onClick={() => { setMethod('card'); setError(''); }}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 font-semibold transition-all ${
                      method === 'card'
                        ? 'border-[#2A5B46] bg-[#2A5B46]/5 text-[#2A5B46] ring-2 ring-[#2A5B46]'
                        : 'border-gray-300 bg-white hover:border-[#2A5B46] text-gray-600'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Cartao de Credito
                  </button>
                </div>
              </div>

              {/* Processor selector (Cielo vs Stripe) — only when card is chosen */}
              {method === 'card' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processador do cartao
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => { setProcessor('cielo'); setError(''); }}
                      className={`p-3 rounded-xl border-2 font-semibold transition-all text-sm ${
                        processor === 'cielo'
                          ? 'border-[#FBBF24] bg-yellow-50 text-[#2A5B46] ring-2 ring-[#FBBF24]'
                          : 'border-gray-300 bg-white hover:border-[#FBBF24] text-gray-600'
                      }`}
                    >
                      Cielo (BRL)
                    </button>
                    <button
                      onClick={() => { setProcessor('stripe'); setError(''); }}
                      className={`p-3 rounded-xl border-2 font-semibold transition-all text-sm ${
                        processor === 'stripe'
                          ? 'border-[#FBBF24] bg-yellow-50 text-[#2A5B46] ring-2 ring-[#FBBF24]'
                          : 'border-gray-300 bg-white hover:border-[#FBBF24] text-gray-600'
                      }`}
                    >
                      Stripe (USD)
                    </button>
                  </div>
                </div>
              )}

              {/* Stripe Card Form (BRL→USD) */}
              {method === 'card' && processor === 'stripe' && (
                <Elements stripe={stripePromise}>
                  <StripeCardSection
                    amount={effectiveAmount}
                    onSuccess={(brl) => {
                      setPaidAmount(brl);
                      setPaid(true);
                    }}
                  />
                </Elements>
              )}

              {/* Card Form (Cielo) */}
              {method === 'card' && processor === 'cielo' && (
                <div className="space-y-4 pt-2 border-t border-gray-100">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Numero do cartao
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="0000 0000 0000 0000"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                        maxLength={19}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition pr-20"
                      />
                      {detectedBrand && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#2A5B46] bg-green-50 px-2 py-1 rounded">
                          {brandLabel[detectedBrand] || detectedBrand}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome do titular (como no cartao)
                    </label>
                    <input
                      type="text"
                      placeholder="NOME COMPLETO"
                      value={holder}
                      onChange={(e) => setHolder(e.target.value.toUpperCase())}
                      className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Validade
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/AA"
                        value={expiry}
                        onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                        maxLength={5}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        maxLength={4}
                        className="w-full p-3 border-2 border-gray-300 rounded-xl focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition"
                      />
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {!(method === 'card' && processor === 'stripe') && (
              <>
              <button
                onClick={method === 'pix' ? handleGeneratePix : handlePayCard}
                disabled={isLoading || !effectiveAmount || effectiveAmount <= 0}
                className="w-full bg-[#2A5B46] hover:bg-[#1e4434] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>{method === 'pix' ? 'Gerando QR Code...' : 'Processando pagamento...'}</span>
                  </>
                ) : method === 'pix' ? (
                  <>
                    <QrCode className="w-6 h-6" />
                    <span>Gerar QR Code PIX</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-6 h-6" />
                    <span>Pagar com Cartao</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                {method === 'pix'
                  ? 'QR Code PIX valido por 30 minutos, aceito por Nubank, Itau, Bradesco e demais bancos.'
                  : 'Pagamento seguro processado pela Cielo. Aceitamos Visa, Mastercard, Elo e Amex.'}
              </p>
              </>
              )}
            </div>
          )}
        </div>
      </main>

      <ShadcnblocksComFooter2 />
    </div>
  );
}
