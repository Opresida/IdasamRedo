
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
import { ParticleSystem } from '@/components/particle-system';
import { 
  Leaf, 
  Coins, 
  TrendingUp, 
  Users, 
  ArrowRight, 
  Zap,
  Shield,
  Crown,
  TreePine,
  Globe,
  Target,
  Wallet,
  Activity,
  ChevronUp,
  ChevronDown,
  Copy,
  Check,
  Wifi,
  X
} from 'lucide-react';

const LoaderScreen = ({ onLoadComplete }: { onLoadComplete: () => void }) => {
  const [loadingText, setLoadingText] = useState('Conectando ao ecossistema descentralizado...');
  const [progress, setProgress] = useState(0);

  const loadingTexts = [
    'Conectando ao ecossistema descentralizado...',
    'Sincronizando com a bioeconomia da Amazônia...',
    'Inicializando o Ciclo Virtuoso...',
    'Preparando experiência Web3...'
  ];

  useEffect(() => {
    let textIndex = 0;
    let progressValue = 0;

    const textInterval = setInterval(() => {
      textIndex = (textIndex + 1) % loadingTexts.length;
      setLoadingText(loadingTexts[textIndex]);
    }, 1500);

    const progressInterval = setInterval(() => {
      progressValue += 2;
      setProgress(progressValue);
      
      if (progressValue >= 100) {
        clearInterval(progressInterval);
        clearInterval(textInterval);
        setTimeout(() => {
          onLoadComplete();
        }, 500);
      }
    }, 100);

    return () => {
      clearInterval(textInterval);
      clearInterval(progressInterval);
    };
  }, [onLoadComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center z-50">
      {/* Background particles effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Digital tree logo */}
      <div className="relative mb-8">
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 flex items-center justify-center animate-spin-slow">
          <TreePine className="w-10 h-10 text-slate-900" />
        </div>
        <div className="absolute inset-0 rounded-full bg-cyan-400/20 animate-ping" />
      </div>

      {/* Loading text */}
      <div className="text-center max-w-md mx-auto px-4">
        <p className="text-cyan-300 text-lg font-['Orbitron'] mb-6 animate-pulse">
          {loadingText}
        </p>
        
        {/* Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-4">
          <div 
            className="bg-gradient-to-r from-cyan-400 to-green-400 h-2 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <p className="text-slate-400 text-sm font-['Rajdhani']">
          {progress}% completo
        </p>
      </div>
    </div>
  );
};

const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/50 to-slate-900">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 bg-cyan-400/30 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

const GlowingBorder = () => {
  return (
    <div className="fixed inset-4 pointer-events-none z-10">
      <div className="w-full h-full border-2 border-cyan-400/30 rounded-lg animate-pulse shadow-[0_0_30px_rgba(0,245,195,0.3)]" />
    </div>
  );
};

// NFT Collection Status Component
const NFTCollectionStatus = () => {
  const [totalMinted, setTotalMinted] = useState(67);
  const [floorPrice, setFloorPrice] = useState(0.53);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional minting
      if (Math.random() < 0.05) {
        setTotalMinted(prev => Math.min(500, prev + 1));
      }
      
      // Small price fluctuations
      const priceChange = (Math.random() - 0.5) * 0.02;
      setFloorPrice(prev => Math.max(0.30, prev * (1 + priceChange)));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed top-4 lg:top-6 right-4 lg:right-6 z-30">
      <Card className="bg-slate-800/90 border-cyan-400/30 backdrop-blur-sm w-[200px] lg:min-w-[240px]">
        <CardContent className="p-3 lg:p-4">
          <div className="flex items-center justify-between mb-2 lg:mb-3">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="w-2 h-2 lg:w-3 lg:h-3 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full animate-pulse" />
              <span className="text-white font-semibold font-['Orbitron'] text-xs lg:text-sm">Curupira NFT</span>
            </div>
            <div className="flex items-center gap-1">
              <Wifi className="w-2 h-2 lg:w-3 lg:h-3 text-green-400" />
              <span className="text-xs text-green-400">Live</span>
            </div>
          </div>
          
          <div className="space-y-1 lg:space-y-2">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Vendidos:</span>
              <span className="text-xs lg:text-sm font-bold text-cyan-400">{totalMinted}/500</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Preço Mínimo:</span>
              <span className="text-xs lg:text-sm font-bold text-green-400">{floorPrice.toFixed(2)} ETH</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Status:</span>
              <span className="text-xs text-purple-400 font-semibold">Pré-Venda Ativa</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Live Visitors Counter Component
const LiveVisitorsCounter = () => {
  const [visitors, setVisitors] = useState(127);
  const [nftSales, setNftSales] = useState(8);

  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate visitor count changes
      const change = Math.random() > 0.5 ? 1 : -1;
      setVisitors(prev => Math.max(50, prev + change));
      
      // Occasionally simulate NFT sales
      if (Math.random() < 0.1) {
        setNftSales(prev => prev + 1);
      }
    }, 5000 + Math.random() * 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 lg:bottom-6 left-4 lg:left-6 z-30">
      <Card className="bg-slate-800/90 border-cyan-400/30 backdrop-blur-sm w-[240px] lg:min-w-[280px]">
        <CardHeader className="pb-2 lg:pb-3">
          <div className="flex items-center gap-1 lg:gap-2">
            <Users className="w-3 h-3 lg:w-4 lg:h-4 text-cyan-400" />
            <CardTitle className="text-xs lg:text-sm font-['Orbitron'] text-white">Atividade em Tempo Real</CardTitle>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse ml-auto" />
          </div>
        </CardHeader>
        <CardContent className="space-y-2 lg:space-y-3">
          <div className="flex items-center justify-between p-2 rounded bg-slate-700/50">
            <div className="flex items-center gap-1 lg:gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-slate-300">Visitantes Online</span>
            </div>
            <div className="text-xs lg:text-sm font-semibold text-green-400">
              {visitors}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded bg-slate-700/50">
            <div className="flex items-center gap-1 lg:gap-2">
              <Crown className="w-2 h-2 lg:w-3 lg:h-3 text-purple-400" />
              <span className="text-xs text-slate-300">NFTs Vendidos Hoje</span>
            </div>
            <div className="text-xs lg:text-sm font-semibold text-purple-400">
              {nftSales}
            </div>
          </div>
          
          <div className="flex items-center justify-between p-2 rounded bg-slate-700/50">
            <div className="flex items-center gap-1 lg:gap-2">
              <TreePine className="w-2 h-2 lg:w-3 lg:h-3 text-cyan-400" />
              <span className="text-xs text-slate-300">Projeto Ativo</span>
            </div>
            <div className="text-xs text-cyan-400 font-semibold">
              Curupira NFT
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Wallet Connection Modal
const WalletConnectionModal = ({ isOpen, onClose, onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const wallets = [
    { name: 'MetaMask', icon: '🦊', popular: true },
    { name: 'WalletConnect', icon: '🔗', popular: true },
    { name: 'Coinbase Wallet', icon: '🔵', popular: false },
    { name: 'Phantom', icon: '👻', popular: false }
  ];

  const handleConnect = async (wallet) => {
    setIsConnecting(true);
    
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const fakeAddress = '0x' + Math.random().toString(16).substring(2, 42).padStart(40, '0');
    setConnectedWallet({
      name: wallet.name,
      address: fakeAddress,
      balance: (Math.random() * 1000 + 50).toFixed(2)
    });
    
    setIsConnecting(false);
    setTimeout(() => {
      onConnect(fakeAddress);
      onClose();
    }, 1500);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-cyan-400/30 rounded-xl p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-['Orbitron'] text-white">Connect Wallet</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {connectedWallet ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-slate-900" />
            </div>
            <h4 className="text-lg font-semibold text-white mb-2">Wallet Connected!</h4>
            <p className="text-slate-300 text-sm mb-4">{connectedWallet.name}</p>
            <div className="bg-slate-700 rounded-lg p-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Address:</span>
                <span className="text-xs text-cyan-400 font-mono">
                  {connectedWallet.address.substring(0, 6)}...{connectedWallet.address.substring(38)}
                </span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-slate-400">Balance:</span>
                <span className="text-xs text-green-400">{connectedWallet.balance} $GOMA</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {wallets.map((wallet, index) => (
              <button
                key={wallet.name}
                onClick={() => handleConnect(wallet)}
                disabled={isConnecting}
                className="w-full flex items-center gap-3 p-4 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed border border-transparent hover:border-cyan-400/30"
              >
                <span className="text-2xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{wallet.name}</span>
                    {wallet.popular && (
                      <Badge className="bg-cyan-400/20 text-cyan-400 text-xs">Popular</Badge>
                    )}
                  </div>
                </div>
                {isConnecting && (
                  <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-400">
            By connecting your wallet, you agree to our Terms of Service
          </p>
        </div>
      </div>
    </div>
  );
};

const CicloVirtuoso = () => {
  const steps = [
    {
      id: 1,
      title: 'Produção Real',
      description: 'Venda da goma de tapioca pelos agricultores familiares',
      icon: <Leaf className="w-6 h-6 lg:w-8 lg:h-8" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 2,
      title: 'Lucro Líquido',
      description: '10% do lucro destinado ao fundo do token',
      icon: <Coins className="w-6 h-6 lg:w-8 lg:h-8" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 3,
      title: 'Recompra',
      description: 'Compra de tokens $GOMA no mercado secundário',
      icon: <Target className="w-6 h-6 lg:w-8 lg:h-8" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 4,
      title: 'Valorização',
      description: 'Pressão de compra e queima aumentam o valor',
      icon: <TrendingUp className="w-6 h-6 lg:w-8 lg:h-8" />,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <section className="py-12 lg:py-20 px-4" id="ciclo-virtuoso">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8 lg:mb-16">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Orbitron'] text-white mb-3 lg:mb-4 drop-shadow-lg">
            Entenda o <span className="text-cyan-300 font-black bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-400/30">Ciclo Virtuoso</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-gray-100 font-semibold max-w-3xl mx-auto drop-shadow-md bg-slate-800/20 px-4 lg:px-6 py-2 lg:py-3 rounded-lg border border-slate-600/30">
            Uma economia circular que conecta a produção real com o valor digital
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative">
          {/* Connecting lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          </div>

          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <Card className="bg-slate-800/50 border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:transform hover:-translate-y-2 backdrop-blur-sm h-full">
                <CardHeader className="text-center pb-3 lg:pb-4">
                  <div className={`w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-slate-900`}>
                    {step.icon}
                  </div>
                  <CardTitle className="text-white font-['Orbitron'] text-base lg:text-lg">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-center text-xs lg:text-sm">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Step number */}
              <div className="absolute -top-3 lg:-top-4 left-1/2 transform -translate-x-1/2 w-6 h-6 lg:w-8 lg:h-8 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 flex items-center justify-center text-slate-900 font-bold text-xs lg:text-sm z-10">
                {step.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const NFTCards = () => {
  const nfts = [
    {
      title: 'Sementes da Amazônia',
      units: 350,
      price: '0.30 ETH',
      airdrop: '~5.555 tokens',
      multiplier: '1x',
      apy: '17%',
      benefits: [
        'Airdrop Garantido de $GOMA (~5.555 tokens)',
        'Multiplicador de Airdrop: 1x',
        'Staking APY aumentado para 17% (Padrão é 10%)'
      ],
      icon: <Leaf className="w-12 h-12" />,
      image: 'https://i.imgur.com/bb9zNgH.jpeg',
      gradient: 'from-green-400 to-emerald-500',
      buttonText: 'Tornar-se Semente',
      tier: 'Iniciante'
    },
    {
      title: 'Embaixador Curupira',
      units: 100,
      price: '0.53 ETH',
      airdrop: '~16.666 tokens',
      multiplier: '3x',
      apy: '17%',
      benefits: [
        'Airdrop Garantido de $GOMA (~16.666 tokens)',
        'Multiplicador de Airdrop: 3x',
        'Staking APY aumentado para 17%',
        'Acesso a eventos e palestras exclusivas',
        '30% de desconto em futuros lançamentos RWA'
      ],
      icon: <Shield className="w-12 h-12" />,
      image: 'https://i.imgur.com/MPWKc4u.jpeg',
      gradient: 'from-blue-400 to-cyan-500',
      buttonText: 'Tornar-se Embaixador',
      tier: 'Avançado'
    },
    {
      title: 'Guardião da Floresta',
      units: 50,
      price: '0.90 ETH',
      airdrop: '~27.777 tokens',
      multiplier: '5x',
      apy: '17%',
      benefits: [
        'Airdrop Garantido de $GOMA (~27.777 tokens)',
        'Multiplicador de Airdrop: 5x',
        'Staking APY aumentado para 17%',
        'Todos os benefícios de Embaixador',
        '2 visitas anuais in loco ao projeto na Amazônia'
      ],
      icon: <Crown className="w-12 h-12" />,
      image: 'https://i.imgur.com/PFqFrEG.jpeg',
      gradient: 'from-purple-400 to-pink-500',
      buttonText: 'Tornar-se Guardião',
      tier: 'Elite'
    }
  ];

  return (
    <section className="py-20 px-4" id="nfts">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-['Orbitron'] text-white mb-4 drop-shadow-lg">
            Seja um <span className="text-cyan-300 font-black bg-cyan-500/10 px-2 py-1 rounded-lg border border-cyan-400/30">Patrono Fundador</span>
          </h2>
          <p className="text-xl text-gray-100 font-semibold max-w-3xl mx-auto drop-shadow-md bg-slate-800/20 px-6 py-3 rounded-lg border border-slate-600/30">
            Escolha seu nível de participação no futuro descentralizado da Amazônia
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {nfts.map((nft, index) => (
            <Card 
              key={index}
              className="bg-slate-800/30 border-2 border-cyan-400/30 hover:border-cyan-400/80 transition-all duration-700 backdrop-blur-sm relative overflow-hidden group cursor-pointer transform-gpu max-w-md mx-auto lg:max-w-none"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px',
              }}
              onMouseEnter={(e) => {
                const card = e.currentTarget;
                card.style.transition = 'transform 0.3s ease-out, box-shadow 0.3s ease-out, border-color 0.3s ease-out';
                card.style.transform = 'translateY(-20px) rotateX(8deg) rotateY(12deg) scale(1.05)';
                card.style.boxShadow = `
                  0 25px 80px rgba(0,245,195,0.4),
                  0 15px 40px rgba(74,222,128,0.3),
                  0 5px 20px rgba(168,85,247,0.2),
                  inset 0 1px 0 rgba(255,255,255,0.1)
                `;
                
                // Ativar efeito de brilho interno
                const glowOverlay = card.querySelector('.glow-overlay') as HTMLElement;
                if (glowOverlay) {
                  glowOverlay.style.opacity = '0.6';
                }
              }}
              onMouseLeave={(e) => {
                const card = e.currentTarget;
                card.style.transition = 'transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.6s ease-out, border-color 0.6s ease-out';
                card.style.transform = 'translateY(0) rotateX(0deg) rotateY(0deg) scale(1)';
                card.style.boxShadow = '0 10px 30px rgba(0,0,0,0.3)';
                
                // Desativar efeito de brilho interno
                const glowOverlay = card.querySelector('.glow-overlay') as HTMLElement;
                if (glowOverlay) {
                  glowOverlay.style.opacity = '0';
                }
              }}
              onMouseMove={(e) => {
                const card = e.currentTarget;
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                // Cálculo mais suave e responsivo
                const rotateX = ((y - centerY) / centerY) * 15; // Máximo 15 graus
                const rotateY = ((centerX - x) / centerX) * 15; // Máximo 15 graus
                
                // Efeito de profundidade baseado na distância do centro
                const distance = Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2));
                const maxDistance = Math.sqrt(Math.pow(centerX, 2) + Math.pow(centerY, 2));
                const intensity = 1 - (distance / maxDistance);
                const scale = 1.05 + (intensity * 0.05);
                
                card.style.transform = `
                  translateY(-20px) 
                  rotateX(${rotateX}deg) 
                  rotateY(${rotateY}deg) 
                  scale(${scale})
                  translateZ(${intensity * 10}px)
                `;
                
                // Atualizar posição do gradiente de brilho
                const glowOverlay = card.querySelector('.glow-overlay') as HTMLElement;
                if (glowOverlay) {
                  const gradientX = (x / rect.width) * 100;
                  const gradientY = (y / rect.height) * 100;
                  glowOverlay.style.background = `
                    radial-gradient(circle at ${gradientX}% ${gradientY}%, 
                      rgba(0,245,195,0.3) 0%, 
                      rgba(74,222,128,0.2) 30%, 
                      rgba(168,85,247,0.1) 60%, 
                      transparent 100%
                    )
                  `;
                }
              }}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Interactive glow overlay */}
              <div 
                className="glow-overlay absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  opacity: 0,
                  background: `radial-gradient(circle at 50% 50%, 
                    rgba(0,245,195,0.3) 0%, 
                    rgba(74,222,128,0.2) 30%, 
                    rgba(168,85,247,0.1) 60%, 
                    transparent 100%
                  )`
                }}
              />
              
              {/* Floating particles on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute w-1 h-1 bg-cyan-400 rounded-full animate-float-particle"
                    style={{
                      left: `${10 + (i * 7)}%`,
                      top: `${10 + (i * 6)}%`,
                      animationDelay: `${i * 0.2}s`,
                      animationDuration: `${2 + (i * 0.3)}s`
                    }}
                  />
                ))}
              </div>
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`bg-gradient-to-r ${nft.gradient} text-slate-900 font-semibold`}>
                    {nft.tier}
                  </Badge>
                  <div className={`text-slate-400 bg-gradient-to-r ${nft.gradient} p-2 rounded-lg`}>
                    {nft.icon}
                  </div>
                </div>
                
                {/* NFT Image with Advanced Holographic Effect */}
                <div className="mb-6 relative overflow-hidden rounded-xl group-hover:shadow-[0_0_40px_rgba(0,245,195,0.6)] transition-all duration-700">
                  <img 
                    src={nft.image} 
                    alt={nft.title}
                    className="w-full h-48 object-cover transition-all duration-700 group-hover:scale-115 group-hover:brightness-110"
                    loading="lazy"
                    style={{
                      filter: 'contrast(1.1) saturate(1.2)',
                      transformOrigin: 'center center',
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent transition-opacity duration-700 group-hover:from-slate-900/40" />
                  
                  {/* Enhanced Holographic overlay */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-60 transition-all duration-700 pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(45deg, 
                          transparent 20%, 
                          rgba(0,245,195,0.15) 25%, 
                          rgba(74,222,128,0.15) 35%, 
                          rgba(168,85,247,0.15) 45%, 
                          rgba(59,130,246,0.15) 55%,
                          rgba(236,72,153,0.15) 65%,
                          transparent 80%
                        ),
                        linear-gradient(135deg, 
                          transparent 30%, 
                          rgba(0,245,195,0.1) 50%, 
                          transparent 70%
                        )
                      `,
                      backgroundSize: '300% 300%, 200% 200%',
                      animation: 'holographic 2.5s ease-in-out infinite, shimmer 4s ease-in-out infinite'
                    }}
                  />
                  
                  {/* Advanced Rainbow reflection */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-1000"
                    style={{
                      background: `
                        conic-gradient(from 0deg at 50% 50%, 
                          rgba(255,0,150,0.2) 0deg, 
                          rgba(0,255,255,0.2) 60deg, 
                          rgba(255,255,0,0.2) 120deg, 
                          rgba(150,0,255,0.2) 180deg,
                          rgba(255,150,0,0.2) 240deg,
                          rgba(0,255,150,0.2) 300deg,
                          rgba(255,0,150,0.2) 360deg
                        )
                      `,
                      animation: 'rainbow-spin 6s linear infinite'
                    }}
                  />
                  
                  {/* Prismatic light streaks */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-40 transition-opacity duration-500">
                    <div 
                      className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
                      style={{
                        animation: 'light-sweep 3s ease-in-out infinite',
                        animationDelay: '0s'
                      }}
                    />
                    <div 
                      className="absolute bottom-0 right-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent"
                      style={{
                        animation: 'light-sweep-reverse 3s ease-in-out infinite',
                        animationDelay: '1.5s'
                      }}
                    />
                  </div>
                  
                  {/* Floating light orbs */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          background: `radial-gradient(circle, ${
                            ['rgba(0,245,195,0.8)', 'rgba(74,222,128,0.8)', 'rgba(168,85,247,0.8)', 
                             'rgba(59,130,246,0.8)', 'rgba(236,72,153,0.8)', 'rgba(251,191,36,0.8)'][i]
                          } 0%, transparent 70%)`,
                          left: `${15 + (i * 12)}%`,
                          top: `${20 + (i * 10)}%`,
                          animation: `float-orb ${2 + (i * 0.5)}s ease-in-out infinite`,
                          animationDelay: `${i * 0.3}s`
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <CardTitle className="text-2xl font-['Orbitron'] text-white mb-2">
                  {nft.title}
                </CardTitle>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Unidades disponíveis:</span>
                    <span className="text-cyan-400 font-semibold">{nft.units}</span>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-3xl font-bold text-white mb-1">{nft.price}</div>
                    <div className="text-sm text-green-400">Pagamento com PIX disponível</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="relative z-10">
                <Separator className="my-6 bg-slate-600" />
                
                <div className="space-y-4 mb-6">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-cyan-400 font-semibold">{nft.airdrop}</div>
                      <div className="text-xs text-slate-400">Airdrop Garantido</div>
                    </div>
                    <div>
                      <div className="text-green-400 font-semibold">{nft.multiplier}</div>
                      <div className="text-xs text-slate-400">Multiplicador</div>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-yellow-400 font-semibold text-lg">{nft.apy} APY</div>
                    <div className="text-xs text-slate-400">Staking Rewards</div>
                  </div>
                </div>

                <div className="space-y-2 mb-6">
                  <h4 className="text-white font-semibold text-sm mb-3">Benefícios Inclusos:</h4>
                  {nft.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                      <Zap className="w-3 h-3 text-cyan-400 mt-0.5 flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>

                <Button 
                  className={`w-full bg-gradient-to-r ${nft.gradient} hover:opacity-90 text-slate-900 font-semibold py-3 text-sm transition-all duration-300 hover:shadow-lg`}
                >
                  {nft.buttonText}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-slate-400 text-sm">
            * Todos os pagamentos são processados de forma segura através de smart contracts auditados
          </p>
        </div>
      </div>
    </section>
  );
};

export default function GomaTokenPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showContent, setShowContent] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [connectedWallet, setConnectedWallet] = useState(null);

  const handleLoadComplete = () => {
    setIsLoading(false);
    // Pequeno delay para garantir transição suave
    setTimeout(() => {
      setShowContent(true);
    }, 300);
  };

  const handleWalletConnect = (address) => {
    setConnectedWallet(address);
  };

  if (isLoading) {
    return <LoaderScreen onLoadComplete={handleLoadComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-x-hidden font-['Rajdhani']">
      {/* Background effects */}
      <ParticleBackground />
      <ParticleSystem count={80} tokenRain={true} className="opacity-60" />
      <GlowingBorder />
      
      {/* Web3 Components - Responsive positioning - só aparecem após carregamento */}
      {showContent && (
        <div className="hidden lg:block">
          <NFTCollectionStatus />
          <LiveVisitorsCounter />
        </div>
      )}
      
      <WalletConnectionModal 
        isOpen={isWalletModalOpen} 
        onClose={() => setIsWalletModalOpen(false)}
        onConnect={handleWalletConnect}
      />

      {/* Header - Responsive */}
      <header className="relative z-20 p-4 lg:p-6">
        <nav className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 lg:gap-0">
          <div className="flex items-center gap-3">
            <TreePine className="w-6 h-6 lg:w-8 lg:h-8 text-cyan-400" />
            <span className="text-lg lg:text-xl font-['Orbitron'] font-bold">Projeto Curupira</span>
          </div>
          
          <div className="flex flex-wrap items-center justify-center gap-2 lg:gap-4">
            {connectedWallet ? (
              <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2 border border-cyan-400/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-cyan-400 text-xs lg:text-sm font-mono">
                  {connectedWallet.substring(0, 6)}...{connectedWallet.substring(38)}
                </span>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="sm"
                className="border-purple-400/50 text-purple-400 hover:bg-purple-400/10 hover:text-purple-300 text-xs lg:text-sm"
                onClick={() => setIsWalletModalOpen(true)}
              >
                <Wallet className="w-3 h-3 lg:w-4 lg:h-4 mr-1 lg:mr-2" />
                Connect Wallet
              </Button>
            )}
            <Button variant="outline" size="sm" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 hover:text-cyan-300 text-xs lg:text-sm">
              <a href="#nfts">Comprar NFT</a>
            </Button>
            <Link href="/">
              <Button size="sm" className="bg-slate-800 hover:bg-slate-700 text-xs lg:text-sm">
                Voltar ao site
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section - Responsive */}
      <section className="relative z-20 py-12 lg:py-20 px-4" id="hero">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-semibold text-xs lg:text-sm px-3 lg:px-4 py-1 lg:py-2 mb-4 lg:mb-6">
              Token $GOMA - Lançamento Oficial
            </Badge>
            
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold font-['Orbitron'] mb-4 lg:mb-6 bg-gradient-to-r from-white via-cyan-300 to-green-400 bg-clip-text text-transparent">
              Seja um Patrono da Amazônia
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-slate-300 max-w-4xl mx-auto mb-6 lg:mb-8 leading-relaxed px-4">
              Torne-se parte da revolução sustentável da Amazônia através dos 
              <span className="text-cyan-400 font-semibold"> NFTs Curupira</span> - uma coleção exclusiva 
              que conecta <span className="text-green-400 font-semibold">Web3 e preservação ambiental</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mb-8 lg:mb-12 max-w-4xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 lg:p-8 border border-cyan-400/30">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 justify-center md:justify-start">
                <Users className="w-6 h-6 lg:w-7 lg:h-7 text-cyan-400" />
                <span className="text-cyan-400 font-semibold text-base lg:text-lg">Agricultura Familiar</span>
              </div>
              <p className="text-slate-300 text-sm lg:text-base">500+ Famílias Beneficiadas</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 lg:p-8 border border-green-400/30">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 justify-center md:justify-start">
                <Globe className="w-6 h-6 lg:w-7 lg:h-7 text-green-400" />
                <span className="text-green-400 font-semibold text-base lg:text-lg">Economia Circular</span>
              </div>
              <p className="text-slate-300 text-sm lg:text-base">100% Sustentável</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 lg:p-8 border border-purple-400/30">
              <div className="flex items-center gap-3 lg:gap-4 mb-4 justify-center md:justify-start">
                <Zap className="w-6 h-6 lg:w-7 lg:h-7 text-purple-400" />
                <span className="text-purple-400 font-semibold text-base lg:text-lg">Web3 Technology</span>
              </div>
              <p className="text-slate-300 text-sm lg:text-base">Blockchain Verified</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
            <Button 
              size="lg" 
              className="w-full sm:w-auto bg-gradient-to-r from-cyan-400 to-green-400 hover:from-cyan-500 hover:to-green-500 text-slate-900 font-semibold text-sm lg:text-lg px-6 lg:px-8 py-3 lg:py-4"
            >
              <a href="#nfts" className="flex items-center gap-2 justify-center">
                Começar Jornada
                <ArrowRight className="w-4 h-4 lg:w-5 lg:h-5" />
              </a>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto border-purple-400/50 text-purple-400 hover:bg-purple-400/10 hover:text-purple-300 text-sm lg:text-lg px-6 lg:px-8 py-3 lg:py-4"
            >
              <a href="#ciclo-virtuoso">Leia o WhitePaper</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Ciclo Virtuoso Section */}
      <CicloVirtuoso />

      {/* NFTs Section */}
      <NFTCards />

      {/* Twitter Follow Section */}
      <section className="relative z-20 py-12 lg:py-16 px-4 bg-gradient-to-r from-blue-500/20 to-sky-400/20 border-y border-cyan-400/30">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 lg:p-8 border border-cyan-400/30 shadow-[0_0_40px_rgba(0,245,195,0.2)]">
            <div className="flex flex-col items-center space-y-4 lg:space-y-6">
              {/* Twitter Icon */}
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full flex items-center justify-center shadow-lg animate-pulse">
                <svg className="w-8 h-8 lg:w-12 lg:h-12 text-slate-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </div>

              {/* Title */}
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-['Orbitron'] text-white mb-2 lg:mb-4">
                Siga-nos no <span className="text-cyan-400">Twitter</span>
              </h2>

              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed px-4">
                Acompanhe em tempo real as últimas novidades sobre desenvolvimento sustentável na Amazônia, 
                nossos projetos inovadores e o impacto social do <span className="text-green-400 font-semibold">Token $GOMA</span>.
              </p>

              {/* Handle */}
              <div className="bg-slate-700/50 rounded-lg px-4 lg:px-6 py-2 lg:py-3 backdrop-blur-sm border border-cyan-400/30">
                <span className="text-cyan-400 font-mono text-base lg:text-lg font-semibold">@institutoidasam</span>
              </div>

              {/* Follow Button */}
              <a
                href="https://x.com/institutoidasam"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 lg:gap-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-500 hover:to-blue-600 text-slate-900 font-bold py-3 lg:py-4 px-6 lg:px-8 rounded-full text-base lg:text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full sm:w-auto justify-center"
              >
                <svg className="w-5 h-5 lg:w-6 lg:h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Seguir no Twitter
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>

              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-6 text-slate-300 text-xs lg:text-sm w-full max-w-lg">
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Atualizações em tempo real</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
                  <span>Projetos e novidades</span>
                </div>
                <div className="flex items-center gap-2 justify-center">
                  <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse"></div>
                  <span>Token $GOMA updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-20 py-8 lg:py-12 px-4 border-t border-slate-700">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 lg:gap-3 mb-3 lg:mb-4">
            <TreePine className="w-6 h-6 lg:w-8 lg:h-8 text-cyan-400" />
            <span className="text-lg lg:text-2xl font-['Orbitron'] font-bold">Projeto Curupira</span>
          </div>
          
          <p className="text-slate-300 text-base lg:text-lg mb-4 lg:mb-6 px-4">
            Junte-se a nós e seja uma <span className="text-green-400 font-semibold">semente da mudança</span>.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 lg:gap-8 text-xs lg:text-sm text-slate-400">
            <span>Powered by IDASAM</span>
            <span className="hidden sm:inline">•</span>
            <span>Blockchain Verified</span>
            <span className="hidden sm:inline">•</span>
            <span>Auditado & Seguro</span>
          </div>
        </div>
      </footer>

      {/* Custom styles for animations */}
      <style jsx>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap');
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
        }
        
        @keyframes holographic {
          0% { background-position: 0% 0%; }
          25% { background-position: 100% 0%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 0%; }
        }
        
        @keyframes shimmer {
          0% { background-position: 0% 0%, 0% 0%; }
          50% { background-position: 100% 100%, 100% 100%; }
          100% { background-position: 0% 0%, 0% 0%; }
        }
        
        @keyframes rainbow-shift {
          0% { background-position: 0% 50%; }
          25% { background-position: 100% 50%; }
          50% { background-position: 100% 100%; }
          75% { background-position: 0% 100%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes rainbow-spin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(180deg) scale(1.1); }
          100% { transform: rotate(360deg) scale(1); }
        }
        
        @keyframes card-float {
          0%, 100% { 
            transform: translateY(0px) rotateY(0deg);
            box-shadow: 0 10px 30px rgba(0,245,195,0.1);
          }
          50% { 
            transform: translateY(-8px) rotateY(2deg);
            box-shadow: 0 20px 50px rgba(0,245,195,0.2);
          }
        }
        
        @keyframes float-particle {
          0% { 
            transform: translateY(0px) translateX(0px) scale(0); 
            opacity: 0;
          }
          20% { 
            opacity: 1; 
            scale: 1;
          }
          80% { 
            opacity: 1; 
          }
          100% { 
            transform: translateY(-20px) translateX(10px) scale(0); 
            opacity: 0;
          }
        }
        
        @keyframes light-sweep {
          0% { 
            transform: translateX(-100%) scaleX(0); 
            opacity: 0;
          }
          50% { 
            transform: translateX(0%) scaleX(1); 
            opacity: 1;
          }
          100% { 
            transform: translateX(100%) scaleX(0); 
            opacity: 0;
          }
        }
        
        @keyframes light-sweep-reverse {
          0% { 
            transform: translateX(100%) scaleX(0); 
            opacity: 0;
          }
          50% { 
            transform: translateX(0%) scaleX(1); 
            opacity: 1;
          }
          100% { 
            transform: translateX(-100%) scaleX(0); 
            opacity: 0;
          }
        }
        
        @keyframes float-orb {
          0%, 100% { 
            transform: translateY(0px) translateX(0px) scale(0.8);
            opacity: 0.6;
          }
          33% { 
            transform: translateY(-10px) translateX(5px) scale(1.2);
            opacity: 1;
          }
          66% { 
            transform: translateY(-5px) translateX(-5px) scale(1);
            opacity: 0.8;
          }
        }
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .group:hover .animate-card-float {
          animation: card-float 6s ease-in-out infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
