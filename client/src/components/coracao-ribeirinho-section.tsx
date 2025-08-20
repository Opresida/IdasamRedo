
"use client";

import React, { useState, useEffect } from 'react';
import { Heart, X, QrCode } from 'lucide-react';

const CoracaoRibeirinhoSection = () => {
  const [selectedValue, setSelectedValue] = useState(50);
  const [customValue, setCustomValue] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [progress, setProgress] = useState(452); // Valor inicial
  const [qrCodeSvg, setQrCodeSvg] = useState('');
  const [donationAmountForQR, setDonationAmountForQR] = useState(50);

  const TOTAL_GOAL = 5000;
  const COST_PER_BASKET = 120;

  // Carrega o progresso do localStorage na montagem do componente
  useEffect(() => {
    const savedProgress = localStorage.getItem('coracaoRibeirinhoProgress');
    if (savedProgress) {
      setProgress(parseInt(savedProgress, 10));
    }
  }, []);

  // Salva o progresso no localStorage sempre que ele muda
  useEffect(() => {
    localStorage.setItem('coracaoRibeirinhoProgress', progress.toString());
  }, [progress]);

  // Gera QR Code usando uma biblioteca simples
  useEffect(() => {
    if (showModal) {
      generateQRCode();
    }
  }, [showModal, donationAmountForQR]);

  const generateQRCode = () => {
    // Aqui você pode substituir pela string PIX real quando tiver
    const pixKey = `00020126580014BR.GOV.BCB.PIX013636343166000158005204000053039865802BR5925IDASAM INSTITUTO DE DESEN6009SAO PAULO62070503***630445B3`;
    
    // Simulação de um QR Code simples - substitua por uma biblioteca real como qrcode.js
    const qrSvg = `
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="20" height="20" fill="black"/>
        <rect x="40" y="20" width="20" height="20" fill="white"/>
        <rect x="60" y="20" width="20" height="20" fill="black"/>
        <rect x="80" y="20" width="20" height="20" fill="white"/>
        <rect x="100" y="20" width="20" height="20" fill="black"/>
        <rect x="120" y="20" width="20" height="20" fill="white"/>
        <rect x="140" y="20" width="20" height="20" fill="black"/>
        <rect x="160" y="20" width="20" height="20" fill="white"/>
        <rect x="20" y="40" width="20" height="20" fill="white"/>
        <rect x="40" y="40" width="20" height="20" fill="black"/>
        <rect x="60" y="40" width="20" height="20" fill="white"/>
        <rect x="80" y="40" width="20" height="20" fill="black"/>
        <rect x="100" y="40" width="20" height="20" fill="white"/>
        <rect x="120" y="40" width="20" height="20" fill="black"/>
        <rect x="140" y="40" width="20" height="20" fill="white"/>
        <rect x="160" y="40" width="20" height="20" fill="black"/>
        <!-- Mais padrão QR Code aqui - substitua por biblioteca real -->
        <text x="100" y="190" text-anchor="middle" font-size="12" fill="black">PIX R$ ${donationAmountForQR}</text>
      </svg>
    `;
    setQrCodeSvg(qrSvg);
  };

  const presetValues = [
    { value: 25, label: 'R$ 25' },
    { value: 50, label: 'R$ 50' },
    { value: 100, label: 'R$ 100' },
    { value: 120, label: 'R$ 120 (Doe uma cesta completa)' }
  ];

  const handleDonate = () => {
    const valueToUse = customValue ? parseInt(customValue) : selectedValue;
    setDonationAmountForQR(valueToUse);
    setShowModal(true);
  };

  const handleDonationComplete = () => {
    const valueToUse = customValue ? parseInt(customValue) : selectedValue;
    const basketsToAdd = Math.floor(valueToUse / COST_PER_BASKET);
    
    if (basketsToAdd > 0) {
      setProgress(prev => Math.min(prev + basketsToAdd, TOTAL_GOAL));
    }
    
    setShowModal(false);
    setCustomValue('');
  };

  const progressPercentage = (progress / TOTAL_GOAL) * 100;

  return (
    <>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Coluna Esquerda - Conteúdo */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <Heart className="w-8 h-8 text-red-500" />
                <h2 className="text-4xl md:text-5xl font-bold text-forest font-montserrat">
                  Projeto Coração Ribeirinho
                </h2>
              </div>
              
              <p className="text-xl text-gray-600 font-medium">
                Levando alimento e esperança para as comunidades ribeirinhas da Amazônia desde 2021.
              </p>

              <div className="space-y-4 text-gray-700 leading-relaxed">
                <p>
                  Nas margens dos rios da Amazônia, milhares de famílias enfrentam um desafio diário: 
                  a insegurança alimentar. A distância, a logística e as dificuldades sazonais tornam 
                  o acesso a alimentos nutritivos uma luta constante. Para uma criança, isso significa 
                  um futuro incerto. Para um idoso, significa vulnerabilidade.
                </p>

                <p>
                  Desde 2021, o projeto Coração Ribeirinho atua como uma ponte de solidariedade. 
                  Com a sua ajuda, transformamos doações em cestas básicas completas, que viajam 
                  por rios e igarapés para chegar a quem mais precisa. Cada cesta não leva apenas 
                  comida, leva a certeza de que ninguém foi esquecido.
                </p>
              </div>

              <div className="bg-teal/10 rounded-2xl p-6 border-l-4 border-teal">
                <p className="text-lg font-semibold text-forest">
                  Faça parte deste movimento. Com um simples gesto, você nutre uma família 
                  e fortalece o coração da Amazônia.
                </p>
              </div>
            </div>

            {/* Coluna Direita - Interação e Medidor */}
            <div className="bg-sand/20 rounded-3xl p-8 space-y-6">
              <h3 className="text-2xl font-bold text-forest text-center">
                Nossa Meta: {TOTAL_GOAL.toLocaleString()} Cestas Básicas
              </h3>

              {/* Medidor de Progresso */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-forest">
                    {progress.toLocaleString()} / {TOTAL_GOAL.toLocaleString()} Cestas
                  </span>
                  <span className="text-lg font-semibold text-teal">
                    {progressPercentage.toFixed(1)}%
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Seleção de Valores */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-forest">Escolha o valor da sua doação:</h4>
                
                <div className="grid grid-cols-1 gap-3">
                  {presetValues.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => {
                        setSelectedValue(preset.value);
                        setCustomValue('');
                      }}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedValue === preset.value && !customValue
                          ? 'border-yellow-500 bg-yellow-50 text-forest'
                          : 'border-gray-300 bg-white hover:border-yellow-300'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Campo Outro Valor */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-forest">
                    Outro valor:
                  </label>
                  <input
                    type="number"
                    placeholder="Digite o valor em R$"
                    value={customValue}
                    onChange={(e) => {
                      setCustomValue(e.target.value);
                      setSelectedValue(0);
                    }}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-yellow-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Botão Principal */}
              <button
                onClick={handleDonate}
                disabled={!selectedValue && !customValue}
                className="w-full bg-teal hover:bg-teal/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl text-lg transition-colors shadow-lg"
              >
                <QrCode className="w-6 h-6 inline mr-2" />
                QUERO DOAR AGORA
              </button>

              <p className="text-sm text-gray-600 text-center">
                Doação segura via PIX • Cada cesta custa R$ {COST_PER_BASKET}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Doação */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <Heart className="w-12 h-12 text-red-500" />
              </div>
              
              <h3 className="text-2xl font-bold text-forest">
                Obrigado por aquecer um coração ribeirinho!
              </h3>

              <p className="text-gray-600">
                Abra o aplicativo do seu banco e escaneie o QR Code abaixo para doar via PIX.
              </p>

              {/* QR Code */}
              <div className="flex justify-center">
                <div 
                  className="bg-white p-4 rounded-lg border border-gray-200 shadow-lg"
                  dangerouslySetInnerHTML={{ __html: qrCodeSvg }}
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="font-semibold text-forest">
                  Valor da doação: R$ {donationAmountForQR}
                </p>
                <p className="text-sm text-gray-600">
                  Equivale a {Math.floor(donationAmountForQR / COST_PER_BASKET)} cesta{Math.floor(donationAmountForQR / COST_PER_BASKET) !== 1 ? 's' : ''} básica{Math.floor(donationAmountForQR / COST_PER_BASKET) !== 1 ? 's' : ''}
                </p>
              </div>

              <button
                onClick={handleDonationComplete}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Já fiz a doação!
              </button>

              <p className="text-xs text-gray-500">
                Ao clicar em "Já fiz a doação!", o progresso será atualizado no medidor acima.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CoracaoRibeirinhoSection;
