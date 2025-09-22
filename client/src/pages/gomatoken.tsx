
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Link } from 'wouter';
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
  Target
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

const CicloVirtuoso = () => {
  const steps = [
    {
      id: 1,
      title: 'Produção Real',
      description: 'Venda da goma de tapioca pelos agricultores familiares',
      icon: <Leaf className="w-8 h-8" />,
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 2,
      title: 'Lucro Líquido',
      description: '10% do lucro destinado ao fundo do token',
      icon: <Coins className="w-8 h-8" />,
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 3,
      title: 'Recompra',
      description: 'Compra de tokens $GOMA no mercado secundário',
      icon: <Target className="w-8 h-8" />,
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 4,
      title: 'Valorização',
      description: 'Pressão de compra e queima aumentam o valor',
      icon: <TrendingUp className="w-8 h-8" />,
      color: 'from-purple-400 to-pink-500'
    }
  ];

  return (
    <section className="py-20 px-4" id="ciclo-virtuoso">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold font-['Orbitron'] text-white mb-4">
            Entenda o <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Ciclo Virtuoso</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Uma economia circular que conecta a produção real com o valor digital
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting lines */}
          <div className="hidden lg:block absolute top-1/2 left-0 w-full h-px">
            <div className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />
          </div>

          {steps.map((step, index) => (
            <div key={step.id} className="relative">
              <Card className="bg-slate-800/50 border-cyan-400/30 hover:border-cyan-400/60 transition-all duration-300 hover:transform hover:-translate-y-2 backdrop-blur-sm">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-slate-900`}>
                    {step.icon}
                  </div>
                  <CardTitle className="text-white font-['Orbitron'] text-lg">
                    {step.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 text-center text-sm">
                    {step.description}
                  </p>
                </CardContent>
              </Card>
              
              {/* Step number */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-r from-cyan-400 to-green-400 flex items-center justify-center text-slate-900 font-bold text-sm z-10">
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
          <h2 className="text-4xl font-bold font-['Orbitron'] text-white mb-4">
            Seja um <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-green-400">Patrono Fundador</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Escolha seu nível de participação no futuro descentralizado da Amazônia
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {nfts.map((nft, index) => (
            <Card 
              key={index}
              className="bg-slate-800/30 border-2 border-cyan-400/30 hover:border-cyan-400/80 transition-all duration-500 hover:transform hover:-translate-y-4 hover:shadow-[0_20px_60px_rgba(0,245,195,0.3)] backdrop-blur-sm relative overflow-hidden group"
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-400/5 to-green-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              <CardHeader className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <Badge className={`bg-gradient-to-r ${nft.gradient} text-slate-900 font-semibold`}>
                    {nft.tier}
                  </Badge>
                  <div className={`text-slate-400 bg-gradient-to-r ${nft.gradient} p-2 rounded-lg`}>
                    {nft.icon}
                  </div>
                </div>
                
                {/* NFT Image */}
                <div className="mb-6 relative overflow-hidden rounded-xl">
                  <img 
                    src={nft.image} 
                    alt={nft.title}
                    className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
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

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  if (isLoading) {
    return <LoaderScreen onLoadComplete={handleLoadComplete} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white relative overflow-x-hidden font-['Rajdhani']">
      {/* Background effects */}
      <ParticleBackground />
      <GlowingBorder />

      {/* Header */}
      <header className="relative z-20 p-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <TreePine className="w-8 h-8 text-cyan-400" />
            <span className="text-xl font-['Orbitron'] font-bold">Projeto Curupira</span>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10">
              <a href="#nfts">Comprar NFT</a>
            </Button>
            <Link href="/">
              <Button className="bg-slate-800 hover:bg-slate-700">
                Voltar ao site
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative z-20 py-20 px-4" id="hero">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <Badge className="bg-gradient-to-r from-cyan-400 to-green-400 text-slate-900 font-semibold text-sm px-4 py-2 mb-6">
              Token $GOMA - Lançamento Oficial
            </Badge>
            
            <h1 className="text-6xl md:text-7xl font-bold font-['Orbitron'] mb-6 bg-gradient-to-r from-white via-cyan-300 to-green-400 bg-clip-text text-transparent">
              O Futuro da Amazônia é Descentralizado
            </h1>
            
            <p className="text-xl md:text-2xl text-slate-300 max-w-4xl mx-auto mb-8 leading-relaxed">
              Conectamos a economia digital global com a agricultura familiar sustentável 
              através do <span className="text-cyan-400 font-semibold">Projeto Curupira</span> e 
              o token <span className="text-green-400 font-semibold">$GOMA</span>.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-12">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-cyan-400/30">
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-6 h-6 text-cyan-400" />
                <span className="text-cyan-400 font-semibold">Agricultura Familiar</span>
              </div>
              <p className="text-slate-300 text-sm">500+ Famílias Beneficiadas</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-green-400/30">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-6 h-6 text-green-400" />
                <span className="text-green-400 font-semibold">Economia Circular</span>
              </div>
              <p className="text-slate-300 text-sm">100% Sustentável</p>
            </div>
            
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-lg p-6 border border-purple-400/30">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-6 h-6 text-purple-400" />
                <span className="text-purple-400 font-semibold">Web3 Technology</span>
              </div>
              <p className="text-slate-300 text-sm">Blockchain Verified</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-cyan-400 to-green-400 hover:from-cyan-500 hover:to-green-500 text-slate-900 font-semibold text-lg px-8 py-4"
            >
              <a href="#nfts" className="flex items-center gap-2">
                Começar Jornada
                <ArrowRight className="w-5 h-5" />
              </a>
            </Button>
            
            <Button 
              size="lg" 
              variant="outline" 
              className="border-cyan-400/50 text-cyan-400 hover:bg-cyan-400/10 text-lg px-8 py-4"
            >
              <a href="#ciclo-virtuoso">Entender o Projeto</a>
            </Button>
          </div>
        </div>
      </section>

      {/* Ciclo Virtuoso Section */}
      <CicloVirtuoso />

      {/* NFTs Section */}
      <NFTCards />

      {/* Footer */}
      <footer className="relative z-20 py-12 px-4 border-t border-slate-700">
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <TreePine className="w-8 h-8 text-cyan-400" />
            <span className="text-2xl font-['Orbitron'] font-bold">Projeto Curupira</span>
          </div>
          
          <p className="text-slate-300 text-lg mb-6">
            Junte-se a nós e seja uma <span className="text-green-400 font-semibold">semente da mudança</span>.
          </p>
          
          <div className="flex justify-center gap-8 text-sm text-slate-400">
            <span>Powered by IDASAM</span>
            <span>•</span>
            <span>Blockchain Verified</span>
            <span>•</span>
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
        
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
