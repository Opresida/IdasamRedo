import React from 'react';

interface TelegramFloatProps {
  show?: boolean;
}

export default function TelegramFloat({ show = true }: TelegramFloatProps) {
  const handleTelegramClick = () => {
    window.open('https://t.me/+exemplo', '_blank', 'noopener,noreferrer');
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-20 z-50">
      {/* Outer glow ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 opacity-60 blur-md animate-pulse"></div>

      {/* Rotating border */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-cyan-500 to-purple-600 animate-spin" style={{ animationDuration: '3s' }}></div>

      {/* Button container */}
      <button
        onClick={handleTelegramClick}
        className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 text-white shadow-2xl transition-all duration-500 hover:scale-125 hover:shadow-[0_0_40px_rgba(59,130,246,0.8)] group border-2 border-transparent hover:border-cyan-400"
        aria-label="Entrar em contato via Telegram"
        data-testid="telegram-float"
      >
        {/* Inner animated background */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-blue-600/20 via-cyan-500/30 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>

        {/* Holographic overlay */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 animate-ping"></div>

        {/* Icon with glow effect */}
        <svg
          className="relative h-8 w-8 z-10 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)] group-hover:drop-shadow-[0_0_16px_rgba(6,182,212,1)] transition-all duration-500 group-hover:scale-110"
          fill="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="telegram-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#00d4ff" />
              <stop offset="50%" stopColor="#0099ff" />
              <stop offset="100%" stopColor="#006eff" />
            </linearGradient>
          </defs>
          <path 
            fill="url(#telegram-gradient)"
            d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"
          />
        </svg>

        {/* Particle effects */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-ping"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
      </button>

      {/* Floating label */}
      <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white text-xs px-3 py-1 rounded-full border border-cyan-400/50 backdrop-blur-sm shadow-lg">
          <span className="font-mono">Telegram</span>
        </div>
      </div>
    </div>
  );
}