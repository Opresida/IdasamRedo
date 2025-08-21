"use client";

import React, { useState, useEffect } from 'react';
import { Heart, X, QrCode } from 'lucide-react';

// Array com as imagens do projeto
const projectImages = [
  'https://i.imgur.com/Y5VDCBT.jpeg',
  'https://i.imgur.com/SxJV1TT.jpeg',
  'https://i.imgur.com/5rQEJFb.jpeg',
  'https://i.imgur.com/1gi4Eay.jpeg',
];

// MUDANÇA: Armazenando os códigos PIX fornecidos
const pixCodes = {
  25: '00020126460014BR.GOV.BCB.PIX0114029061770001870206Idasam520400005303986540525.005802BR5906IDASAM6006MANAUS62070503***630430D9',
  50: '00020126460014BR.GOV.BCB.PIX0114029061770001870206Idasam520400005303986540550.005802BR5906IDASAM6006MANAUS62070503***6304EE99',
  120: '00020126460014BR.GOV.BCB.PIX0114029061770001870206Idasam5204000053039865406120.005802BR5906IDASAM6006MANAUS62070503***6304E3FD',
  noValue: '00020126460014BR.GOV.BCB.PIX0114029061770001870206Idasam5204000053039865802BR5906IDASAM6006MANAUS62070503***63046351',
};

// MUDANÇA: Funções de geração dinâmica de PIX foram removidas por não serem mais necessárias.

const CoracaoRibeirinhoSection = () => {
  const [selectedValue, setSelectedValue] = useState(50);
  const [customValue, setCustomValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(452); // Valor inicial
  const [pixCode, setPixCode] = useState('');

  const TOTAL_GOAL = 5000;
  const COST_PER_BASKET = 120;

  // Carrega o progresso do localStorage
  useEffect(() => {
    const savedProgress = localStorage.getItem('coracaoRibeirinhoProgress');
    if (savedProgress) {
      setProgress(parseInt(savedProgress, 10));
    }
  }, []);

  // Salva o progresso no localStorage
  useEffect(() => {
    localStorage.setItem('coracaoRibeirinhoProgress', progress.toString());
  }, [progress]);

  const presetValues = [
    { value: 25, label: 'R$ 25' },
    { value: 50, label: 'R$ 50' },
    { value: 120, label: 'Doe 1 Cesta (R$ 120)' }
  ];

  const handleDonateClick = () => {
    const amount = customValue ? parseInt(customValue, 10) : selectedValue;
    if (amount > 0) {
      let finalPixCode;
      // MUDANÇA: Seleciona o código PIX correto com base na escolha do usuário
      if (customValue) {
        finalPixCode = pixCodes.noValue;
      } else {
        finalPixCode = pixCodes[selectedValue] || pixCodes.noValue;
      }
      setPixCode(finalPixCode);
      setShowModal(true);
    }
  };

  const handleDonationComplete = () => {
    const valueToUse = customValue ? parseInt(customValue, 10) : selectedValue;
    const basketsToAdd = Math.floor(valueToUse / COST_PER_BASKET);

    if (basketsToAdd > 0) {
      setProgress(prev => Math.min(prev + basketsToAdd, TOTAL_GOAL));
    }

    setShowModal(false);
    setCustomValue('');
  };

  const progressPercentage = (progress / TOTAL_GOAL) * 100;
  const donationAmountForQR = customValue ? parseInt(customValue, 10) : selectedValue;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pixCode)}`;

  return (
    <>
      <style>{`
        @keyframes infinite-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-100%); }
        }
        .animate-infinite-scroll {
          animation: infinite-scroll 40s linear infinite;
        }
      `}</style>

      <section className="py-20 bg-gray-50 relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-10" 
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1611599296386-214d33407a2b?q=80&w=2070&auto=format&fit=crop')"}}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

            {/* Coluna Esquerda - Conteúdo */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Heart className="w-10 h-10 text-[#FBBF24]" />
                <h2 className="text-4xl md:text-5xl font-bold text-[#2A5B46]">
                  Projeto Coração Ribeirinho
                </h2>
              </div>

              <p className="text-xl text-gray-600 font-medium">
                Levando alimento e esperança para as comunidades ribeirinhas da Amazônia desde 2021.
              </p>

              <div className="space-y-4 text-gray-700 leading-relaxed text-lg">
                <p>
                  Nas margens dos rios da Amazônia, milhares de famílias enfrentam um desafio diário: a insegurança alimentar. A distância e as dificuldades sazonais tornam o acesso a alimentos uma luta constante.
                </p>
                <p>
                  Desde 2021, o projeto Coração Ribeirinho atua como uma ponte de solidariedade. Com a sua ajuda, transformamos doações em cestas básicas completas que chegam a quem mais precisa.
                </p>
              </div>

              {/* Slider de Imagens */}
              <div className="mt-8 w-full overflow-hidden rounded-2xl shadow-lg border-4 border-white">
                <div className="flex animate-infinite-scroll">
                  {[...projectImages, ...projectImages].map((src, index) => (
                    <div key={index} className="w-1/2 md:w-1/3 flex-shrink-0 p-1">
                       <img
                        src={src}
                        alt={`Foto da ação do projeto Coração Ribeirinho ${index + 1}`}
                        className="w-full h-full object-cover aspect-video rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#4E8D7C]/10 rounded-2xl p-6 border-l-4 border-[#4E8D7C] mt-8">
                <p className="text-lg font-semibold text-[#2A5B46]">
                  Faça parte deste movimento. Com um simples gesto, você nutre uma família e fortalece o coração da Amazônia.
                </p>
              </div>
            </div>

            {/* Coluna Direita - Card de Doação */}
            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl space-y-6">
              <h3 className="text-2xl font-bold text-[#2A5B46] text-center">
                Nossa Meta: {TOTAL_GOAL.toLocaleString()} Cestas Básicas
              </h3>

              {/* Medidor de Progresso */}
              <div className="space-y-2">
                <div className="w-full bg-gray-200 rounded-full h-5 overflow-hidden shadow-inner">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-[#FBBF24] rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  >
                    <span className="text-xs font-bold text-yellow-900">{progressPercentage.toFixed(1)}%</span>
                  </div>
                </div>
                 <div className="text-center text-lg font-semibold text-[#2A5B46]">
                  <span className="font-bold">{progress.toLocaleString()}</span> / {TOTAL_GOAL.toLocaleString()} Cestas
                </div>
              </div>

              {/* Seleção de Valores */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-800 text-center">Escolha o valor da sua doação:</h4>

                <div className="grid grid-cols-3 gap-3">
                  {presetValues.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setSelectedValue(preset.value);
                        setCustomValue('');
                      }}
                      className={`p-3 rounded-lg border-2 font-semibold transition-all text-center ${
                        selectedValue === preset.value && !customValue
                          ? 'border-[#FBBF24] bg-yellow-50 text-[#2A5B46] ring-2 ring-[#FBBF24]'
                          : 'border-gray-300 bg-white hover:border-[#FBBF24]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <div>
                  <input
                    type="number"
                    placeholder="Outro valor (R$)"
                    value={customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      setSelectedValue(0);
                    }}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[#FBBF24] focus:ring-1 focus:ring-[#FBBF24] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Botão Principal */}
              <button
                onClick={handleDonateClick}
                disabled={!selectedValue && !customValue}
                className="w-full bg-white hover:bg-green-50 disabled:bg-gray-300 disabled:cursor-not-allowed text-[#4E8D7C] border-2 border-[#4E8D7C] font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                <QrCode className="w-6 h-6" />
                <span>QUERO DOAR AGORA</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Doação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative text-center space-y-4">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <Heart className="w-12 h-12 text-[#FBBF24] mx-auto" />

            <h3 className="text-2xl font-bold text-[#2A5B46]">
              Obrigado por aquecer um coração ribeirinho!
            </h3>

            <p className="text-gray-600">
              Abra o app do seu banco, escolha a opção PIX e escaneie o código abaixo para doar 
              <span className="font-bold"> R$ {donationAmountForQR}</span>.
            </p>

            <div className="flex justify-center p-4 bg-gray-50 rounded-lg border">
              <img src={qrCodeUrl} alt="QR Code PIX" />
            </div>

            <button
              onClick={handleDonationComplete}
              className="w-full bg-[#4E8D7C] hover:bg-[#2A5B46] text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Já fiz a doação!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CoracaoRibeirinhoSection;
