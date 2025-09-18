import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsUp, Share2, Smile, Hand as HandHeart, Zap, Frown } from 'lucide-react';
import { addReaction, removeReaction, getReactions } from '@/lib/socialInteractions';
import { useAnalytics } from '@/hooks/use-analytics';

interface Reaction {
  type: 'like' | 'love' | 'clap' | 'wow' | 'sad' | 'angry';
  count: number;
  userReacted: boolean;
}

interface SocialReactionsProps {
  targetId: string;
  targetType: 'article' | 'comment';
  reactions: Record<string, number>;
  userReactions: string[];
  onReactionToggle: (reactionType: string) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const reactionConfig = {
  like: { emoji: '👍', icon: ThumbsUp, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'Curtir' },
  love: { emoji: '❤️', icon: Heart, color: 'text-red-600', bgColor: 'bg-red-50', label: 'Amar' },
  clap: { emoji: '👏', icon: HandHeart, color: 'text-green-600', bgColor: 'bg-green-50', label: 'Aplaudir' },
  wow: { emoji: '😮', icon: Zap, color: 'text-yellow-600', bgColor: 'bg-yellow-50', label: 'Uau' },
  sad: { emoji: '😢', icon: Frown, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'Triste' },
  angry: { emoji: '😡', icon: Angry, color: 'text-orange-600', bgColor: 'bg-orange-50', label: 'Raiva' }
};

export default function SocialReactions({
  targetId,
  targetType,
  reactions = {},
  userReactions = [],
  onReactionToggle,
  className = '',
  size = 'md'
}: SocialReactionsProps) {
  const [showAllReactions, setShowAllReactions] = useState(false);
  const [animatingReaction, setAnimatingReaction] = useState<string | null>(null);
  const { trackEvent } = useAnalytics();


  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
    lg: 'text-base px-4 py-3'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  const handleReactionClick = async (reactionType: string) => {
    setAnimatingReaction(reactionType);
    await onReactionToggle(reactionType);
    
    trackEvent('reaction_clicked', 'engagement', 'reaction_toggle', reactionType, {
      reactionType,
      targetId,
      targetType
    });
    
    setTimeout(() => setAnimatingReaction(null), 300);
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {Object.entries(reactionConfig).map(([type, config]) => {
          const count = reactions[type] || 0;
          const userReacted = userReactions.includes(type);
          const Icon = config.icon;
          
          return (
            <Button
              key={type}
              variant="ghost"
              size="sm"
              className={`
                ${sizeClasses[size]} 
                transition-all duration-200 hover:scale-105
                ${userReacted ? `${config.color} ${config.bgColor}` : 'text-gray-600 hover:text-gray-900'}
                ${animatingReaction === type ? 'animate-pulse' : ''}
              `}
              onClick={() => handleReactionClick(type)}
              title={config.label}
            >
              <Icon className={`${iconSizes[size]} mr-1`} />
              <span className="text-xs">{count > 0 ? count : ''}</span>
            </Button>
          );
        })}
      </div>
      
      {showAllReactions && (
        <div className="flex items-center gap-1 ml-2 p-2 bg-gray-50 rounded-lg">
          {Object.entries(reactionConfig).map(([type, config]) => (
            <button
              key={type}
              className="text-lg hover:scale-125 transition-transform"
              onClick={() => handleReactionClick(type)}
              title={config.label}
            >
              {config.emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}tId, targetType });

    // Animação de feedback
    setTimeout(() => {
      setAnimatingReaction(null);
    }, 300);
  };

  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);
  const topReactions = Object.entries(reactions)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3)
    .filter(([, count]) => count > 0);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Resumo das Reações */}
      {totalReactions > 0 && (
        <div className="flex items-center gap-1">
          {topReactions.map(([type, count]) => (
            <span key={type} className="text-base">
              {reactionConfig[type as keyof typeof reactionConfig]?.emoji}
            </span>
          ))}
          {totalReactions > 0 && (
            <span className="text-sm text-gray-500 ml-1">
              {totalReactions}
            </span>
          )}
        </div>
      )}

      {/* Botão Principal de Reações */}
      <div className="relative">
        <button
          onClick={() => setShowAllReactions(!showAllReactions)}
          className={`flex items-center gap-1 ${sizeClasses[size]} rounded-lg border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-sm ${
            userReactions.length > 0 ? 'bg-blue-50 border-blue-200' : 'bg-white'
          }`}
        >
          {userReactions.length > 0 ? (
            <span className="text-base">
              {reactionConfig[userReactions[0] as keyof typeof reactionConfig]?.emoji}
            </span>
          ) : (
            <Heart className={`${iconSizes[size]} text-gray-500`} />
          )}
          <span className="text-gray-700 font-medium">
            {userReactions.length > 0 ? 'Reagiu' : 'Reagir'}
          </span>
        </button>

        {/* Menu de Reações */}
        {showAllReactions && (
          <div className="absolute bottom-full left-0 mb-2 bg-white rounded-xl shadow-lg border border-gray-200 p-2 z-50 min-w-max">
            <div className="flex items-center gap-1">
              {Object.entries(reactionConfig).map(([type, config]) => {
                const isActive = userReactions.includes(type);
                const count = reactions[type] || 0;
                const isAnimating = animatingReaction === type;

                return (
                  <button
                    key={type}
                    onClick={() => handleReactionClick(type)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 hover:scale-110 group relative ${
                      isActive ? `${config.bgColor} ${config.color}` : 'hover:bg-gray-50'
                    } ${isAnimating ? 'animate-bounce' : ''}`}
                    title={config.label}
                  >
                    <span className={`text-xl ${isAnimating ? 'animate-pulse' : ''}`}>
                      {config.emoji}
                    </span>
                    {count > 0 && (
                      <span className={`text-xs font-medium ${isActive ? config.color : 'text-gray-600'}`}>
                        {count}
                      </span>
                    )}

                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
                      {config.label}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Fechar ao clicar fora */}
            <div 
              className="fixed inset-0 z-[-1]" 
              onClick={() => setShowAllReactions(false)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Componente para exibir estatísticas das reações
export function ReactionStats({ 
  reactions, 
  className = '' 
}: { 
  reactions: Record<string, number>;
  className?: string;
}) {
  const totalReactions = Object.values(reactions).reduce((sum, count) => sum + count, 0);

  if (totalReactions === 0) return null;

  const sortedReactions = Object.entries(reactions)
    .filter(([, count]) => count > 0)
    .sort(([,a], [,b]) => b - a);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {sortedReactions.slice(0, 3).map(([type]) => (
          <span key={type} className="text-sm">
            {reactionConfig[type as keyof typeof reactionConfig]?.emoji}
          </span>
        ))}
      </div>
      <span className="text-sm text-gray-600">
        {totalReactions} {totalReactions === 1 ? 'reação' : 'reações'}
      </span>
      {sortedReactions.length > 3 && (
        <span className="text-xs text-gray-500">
          +{sortedReactions.length - 3} mais
        </span>
      )}
    </div>
  );
}