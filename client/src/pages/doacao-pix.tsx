import React, { useState, useEffect, useRef } from 'react';
import { Heart, QrCode, Copy, Check, ArrowLeft, Clock, CheckCircle2 } from 'lucide-react';
import FloatingNavbar from '@/components/floating-navbar';
import WhatsAppFloat from '@/components/whatsapp-float';
import ShadcnblocksComFooter2 from '@/components/shadcnblocks-com-footer2';

const presetValues = [
  { value: 25, label: 'R$ 25' },
  { value: 50, label: 'R$ 50' },
  { value: 120, label: 'R$ 120 — 1 Cesta Básica' },
];

interface PixData {
  qrCodeBase64: string;
  pixCode: string;
  expiresAt: number;
  paymentId: string;
}

export default function DoacaoPix() {
  const [selectedValue, setSelectedValue] = useState<number>(50);
  const [customValue, setCustomValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [pixData, setPixData] = useState<PixData | null>(null);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [paid, setPaid] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const effectiveAmount = customValue ? Number(customValue) : selectedValue;

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
      } catch {
      }
    };

    pollRef.current = setInterval(checkStatus, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [pixData]);

  const handleGenerate = async () => {
    if (!effectiveAmount || effectiveAmount <= 0) {
      setError('Por favor, informe um valor válido.');
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
        setError('O QR Code Pix não foi gerado corretamente. Tente novamente.');
        return;
      }
      const expiresAt = Math.floor(Date.now() / 1000) + 30 * 60;
      setPixData({ ...data, expiresAt });
    } catch (e) {
      setError('Erro de conexão. Verifique sua internet e tente novamente.');
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
              <h1 className="text-3xl md:text-4xl font-bold text-white">Doação via PIX</h1>
            </div>
            <p className="text-white/80 mt-2 text-lg">
              Gere um QR Code válido e aceito por qualquer banco ou aplicativo.
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
                Recebemos sua doação de <strong>R$ {paidAmount}</strong>.<br />
                Muito obrigado por apoiar a Amazônia e as comunidades do IDASAM!
              </p>
              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 text-[#4E8D7C] hover:text-[#2A5B46] font-medium transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Fazer outra doação
              </button>
            </div>
          ) : !pixData ? (
            <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6">
              <h2 className="text-2xl font-bold text-[#2A5B46] text-center">
                Escolha o valor da sua doação
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

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={isLoading || (!effectiveAmount || effectiveAmount <= 0)}
                className="w-full bg-[#2A5B46] hover:bg-[#1e4434] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Gerando QR Code…</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-6 h-6" />
                    <span>Gerar QR Code PIX</span>
                  </>
                )}
              </button>

              <p className="text-xs text-center text-gray-500">
                QR Code PIX válido por 30 minutos, aceito por Nubank, Itaú, Bradesco e demais bancos.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl p-8 shadow-xl space-y-6 text-center">
              <Heart className="w-12 h-12 text-[#FBBF24] mx-auto" />
              <h2 className="text-2xl font-bold text-[#2A5B46]">
                Obrigado por apoiar a Amazônia!
              </h2>
              <p className="text-gray-600">
                Escaneie o QR Code ou copie o código PIX para concluir sua doação de{' '}
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
                  <span>Válido por: {timeLeft}</span>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span>Aguardando confirmação do pagamento…</span>
              </div>

              <div className="space-y-2">
                <p className="text-sm text-gray-500">Ou use o código copia-e-cola:</p>
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
                      Código copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copiar código PIX
                    </>
                  )}
                </button>
              </div>

              <button
                onClick={handleReset}
                className="flex items-center justify-center gap-2 text-[#4E8D7C] hover:text-[#2A5B46] font-medium transition-colors mx-auto"
              >
                <ArrowLeft className="w-4 h-4" />
                Gerar outro QR Code
              </button>
            </div>
          )}
        </div>
      </main>

      <ShadcnblocksComFooter2 />
    </div>
  );
}
