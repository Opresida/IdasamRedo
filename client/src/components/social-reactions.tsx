import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Heart, ThumbsUp, Share2, Smile, Hand as HandHeart, Zap, Frown, Frown as Angry, AlertTriangle } from 'lucide-react';
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