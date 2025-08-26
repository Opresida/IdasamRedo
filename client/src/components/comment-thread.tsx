
import React, { useState } from 'react';
import { MessageCircle, Reply, MoreHorizontal, User, Clock, ChevronDown, ChevronRight } from 'lucide-react';
import SocialReactions from './social-reactions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { formatDate } from '@/lib/utils';

interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
  parent_comment_id?: string;
  thread_level: number;
  is_approved: boolean;
  reaction_counts: Record<string, number>;
  replies?: Comment[];
}

interface CommentThreadProps {
  comment: Comment;
  articleId: string;
  userReactions: Record<string, string[]>;
  maxDepth?: number;
  onReply: (parentId: string, content: string, author: string) => void;
  onReactionToggle: (commentId: string, reactionType: string) => void;
  className?: string;
}

const CommentItem = ({ 
  comment, 
  articleId, 
  userReactions, 
  onReply, 
  onReactionToggle, 
  canReply = true,
  depth = 0 
}: CommentThreadProps & { canReply?: boolean; depth?: number }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [replyAuthor, setReplyAuthor] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReply = async () => {
    if (!replyContent.trim() || !replyAuthor.trim()) return;

    setIsSubmitting(true);
    try {
      await onReply(comment.id, replyContent.trim(), replyAuthor.trim());
      setReplyContent('');
      setReplyAuthor('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Erro ao responder comentário:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactionToggle = async (reactionType: string) => {
    await onReactionToggle(comment.id, reactionType);
  };

  const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)} pl-4 border-l-2 border-gray-100` : '';
  const hasReplies = comment.replies && comment.replies.length > 0;

  return (
    <div className={`${indentClass} ${depth > 0 ? 'mt-3' : 'mt-4'}`}>
      <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-sm transition-shadow">
        {/* Cabeçalho do Comentário */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-medium text-gray-900">{comment.author_name}</span>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{formatDate(comment.created_at)}</span>
                {comment.thread_level > 0 && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                    Resposta
                  </span>
                )}
                {!comment.is_approved && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
                    Aguardando aprovação
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Botão de Colapsar (se tem respostas) */}
          {hasReplies && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
              title={isCollapsed ? 'Expandir respostas' : 'Recolher respostas'}
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </button>
          )}
        </div>

        {/* Conteúdo do Comentário */}
        <p className="text-gray-700 leading-relaxed mb-4">
          {comment.content}
        </p>

        {/* Ações do Comentário */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Reações */}
            <SocialReactions
              targetId={comment.id}
              targetType="comment"
              reactions={comment.reaction_counts || {}}
              userReactions={userReactions[comment.id] || []}
              onReactionToggle={handleReactionToggle}
              size="sm"
            />

            {/* Botão Responder */}
            {canReply && depth < 2 && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
              >
                <Reply className="w-4 h-4" />
                Responder
              </button>
            )}
          </div>

          {/* Contador de Respostas */}
          {hasReplies && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              {comment.replies!.length} {comment.replies!.length === 1 ? 'resposta' : 'respostas'}
            </span>
          )}
        </div>

        {/* Formulário de Resposta */}
        {showReplyForm && (
          <div className="mt-4 p-3 bg-gray-50 rounded-lg border-l-4 border-blue-400">
            <div className="space-y-3">
              <Input
                placeholder="Seu nome"
                value={replyAuthor}
                onChange={(e) => setReplyAuthor(e.target.value)}
                className="bg-white"
                disabled={isSubmitting}
              />
              <div className="flex gap-2">
                <Input
                  placeholder={`Respondendo ${comment.author_name}...`}
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1 bg-white"
                  disabled={isSubmitting}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleReply();
                    }
                  }}
                />
                <Button
                  onClick={handleReply}
                  disabled={!replyContent.trim() || !replyAuthor.trim() || isSubmitting}
                  size="sm"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  ) : (
                    'Responder'
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowReplyForm(false)}
                  size="sm"
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Respostas (Recursivo) */}
      {hasReplies && !isCollapsed && (
        <div className="mt-2">
          {comment.replies!.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              articleId={articleId}
              userReactions={userReactions}
              onReply={onReply}
              onReactionToggle={onReactionToggle}
              canReply={depth < 1} // Máximo 2 níveis
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CommentThread(props: CommentThreadProps) {
  return <CommentItem {...props} />;
}

// Função utilitária para organizar comentários em threads
export function organizeCommentsIntoThreads(comments: Comment[]): Comment[] {
  const commentMap = new Map<string, Comment>();
  const rootComments: Comment[] = [];

  // Primeiro, criar um mapa de todos os comentários
  comments.forEach(comment => {
    commentMap.set(comment.id, { ...comment, replies: [] });
  });

  // Organizar em hierarquia
  comments.forEach(comment => {
    const commentWithReplies = commentMap.get(comment.id)!;
    
    if (comment.parent_comment_id) {
      // É uma resposta
      const parent = commentMap.get(comment.parent_comment_id);
      if (parent) {
        parent.replies = parent.replies || [];
        parent.replies.push(commentWithReplies);
        // Ordenar respostas por data
        parent.replies.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    } else {
      // É um comentário raiz
      rootComments.push(commentWithReplies);
    }
  });

  // Ordenar comentários raiz por data (mais recentes primeiro)
  return rootComments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}
