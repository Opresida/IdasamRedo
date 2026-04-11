"use client";

import React, { useState, useEffect } from 'react';
import { Heart, QrCode } from 'lucide-react';

const projectImages = [
  'https://i.imgur.com/Y5VDCBT.jpeg',
  'https://i.imgur.com/SxJV1TT.jpeg',
  'https://i.imgur.com/5rQEJFb.jpeg',
  'https://i.imgur.com/1gi4Eay.jpeg',
];

const CoracaoRibeirinhoSection = () => {
  const [progress, setProgress] = useState(452);

  const TOTAL_GOAL = 5000;

  useEffect(() => {
    const savedProgress = localStorage.getItem('coracaoRibeirinhoProgress');
    if (savedProgress) {
      setProgress(parseInt(savedProgress, 10));
    }
  }, []);

  const progressPercentage = (progress / TOTAL_GOAL) * 100;

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

      <section id="coracao-ribeirinho" className="py-20 bg-gray-50 relative overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-10"
          style={{backgroundImage: "url('https://images.unsplash.com/photo-1611599296386-214d33407a2b?q=80&w=2070&auto=format&fit=crop')"}}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">

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

            <div className="bg-white rounded-3xl p-8 lg:p-10 shadow-2xl space-y-6">
              <h3 className="text-2xl font-bold text-[#2A5B46] text-center">
                Nossa Meta: {TOTAL_GOAL.toLocaleString()} Cestas Básicas
              </h3>

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

              <div className="space-y-4 pt-2">
                <p className="text-center text-gray-600 text-base">
                  Sua doação via PIX gera um QR Code real, válido e aceito por qualquer banco.
                </p>

                <button
                  onClick={() => window.location.href = '/doacao-pix'}
                  className="w-full bg-white hover:bg-green-50 text-[#4E8D7C] border-2 border-[#4E8D7C] font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <QrCode className="w-6 h-6" />
                  <span>QUERO DOAR VIA PIX</span>
                </button>

                <button
                  onClick={() => window.location.href = '/doacao-usd'}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <span className="text-xl">$</span>
                  <span>QUERO DOAR EM DÓLAR</span>
                </button>

                <button
                  onClick={() => window.location.href = '/doacao-eur'}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-6 rounded-xl text-lg transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3"
                >
                  <span className="text-xl font-bold">€</span>
                  <span>QUERO DOAR EM EURO</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>
    </>
  );
};

export default CoracaoRibeirinhoSection;
