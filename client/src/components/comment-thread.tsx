import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  User, 
  Calendar, 
  Reply, 
  Heart, 
  ThumbsUp, 
  Send,
  AlertCircle 
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { 
  getComments, 
  addComment, 
  toggleCommentReaction, 
  CommentWithThread 
} from '@/lib/socialInteractions';

interface CommentThreadProps {
  articleId: string;
  articleTitle?: string;
}

const validateProps = (props: CommentThreadProps): boolean => {
  if (!props?.articleId || typeof props.articleId !== 'string' || !props.articleId.trim()) {
    console.error('CommentThread: articleId prop is required and must be a non-empty string');
    return false;
  }
  return true;
};

export default function CommentThread({ articleId, articleTitle }: CommentThreadProps) {
  if (!validateProps({ articleId })) {
    return <div className="p-4 text-red-500">Erro: Propriedades inválidas</div>;
  }

  const [comments, setComments] = useState<CommentWithThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showAddComment, setShowAddComment] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  // Estados do formulário
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    loadComments();
  }, [articleId]);

  // Carregar comentários
  const loadComments = async () => {
    setLoading(true);
    try {
      const fetchedComments = await getComments(articleId, 'article');
      setComments(fetchedComments);
    } catch (error) {
      console.error('Erro ao carregar comentários:', error);
    } finally {
      setLoading(false);
    }
  };

  // Validar formulário
  const validateForm = (): boolean => {
    if (!authorName.trim()) {
      setFormError('Nome é obrigatório');
      return false;
    }
    if (!authorEmail.trim()) {
      setFormError('Email é obrigatório');
      return false;
    }
    if (!commentContent.trim()) {
      setFormError('Comentário é obrigatório');
      return false;
    }

    // Validação básica de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) {
      setFormError('Email inválido');
      return false;
    }

    setFormError('');
    return true;
  };

  // Submeter comentário
  const handleSubmitComment = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const newComment = await addComment(
        articleId,
        authorName,
        authorEmail,
        commentContent,
        replyTo || undefined
      );

      if (newComment) {
        // Limpar formulário
        setCommentContent('');
        setAuthorName('');
        setAuthorEmail('');
        setReplyTo(null);
        setShowAddComment(false);

        // Recarregar comentários
        await loadComments();
      }
    } catch (error) {
      console.error('Erro ao enviar comentário:', error);
      setFormError('Erro ao enviar comentário. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  };

  // Reagir a um comentário
  const handleCommentReaction = async (commentId: string, reactionType: string) => {
    try {
      await toggleCommentReaction(commentId, reactionType);
      // Recarregar comentários para atualizar contadores
      await loadComments();
    } catch (error) {
      console.error('Erro ao reagir ao comentário:', error);
    }
  };

  // Renderizar um comentário
  const renderComment = (comment: CommentWithThread, level: number = 0) => (
    <div key={comment.id} className={`${level > 0 ? 'ml-8 mt-4' : 'mb-6'}`}>
      <Card className="bg-gray-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="w-4 h-4 text-gray-500" />
            <span className="font-medium text-gray-900">{comment.author_name}</span>
            <span className="text-gray-500">•</span>
            <div className="flex items-center gap-1 text-gray-500 text-sm">
              <Calendar className="w-3 h-3" />
              <span>{formatDate(comment.created_at)}</span>
            </div>
            {!comment.is_approved && (
              <Badge variant="secondary" className="text-xs">
                <AlertCircle className="w-3 h-3 mr-1" />
                Aguardando aprovação
              </Badge>
            )}
          </div>

          <p className="text-gray-700 mb-3">{comment.content}</p>

          <div className="flex items-center gap-4 text-sm">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommentReaction(comment.id, 'like')}
              className="h-8 px-2"
            >
              <ThumbsUp className="w-3 h-3 mr-1" />
              {comment.reaction_counts?.like || 0}
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleCommentReaction(comment.id, 'love')}
              className="h-8 px-2"
            >
              <Heart className="w-3 h-3 mr-1" />
              {comment.reaction_counts?.love || 0}
            </Button>

            {level < 2 && ( // Limitar níveis de resposta
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReplyTo(comment.id)}
                className="h-8 px-2"
              >
                <Reply className="w-3 h-3 mr-1" />
                Responder
              </Button>
            )}
          </div>

          {/* Formulário de resposta inline */}
          {replyTo === comment.id && (
            <div className="mt-4 p-4 bg-white rounded border">
              <h4 className="font-medium mb-3">Responder a {comment.author_name}</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <div>
                  <Label htmlFor={`reply-name-${comment.id}`}>Seu nome</Label>
                  <Input
                    id={`reply-name-${comment.id}`}
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Digite seu nome"
                  />
                </div>
                <div>
                  <Label htmlFor={`reply-email-${comment.id}`}>Seu email</Label>
                  <Input
                    id={`reply-email-${comment.id}`}
                    type="email"
                    value={authorEmail}
                    onChange={(e) => setAuthorEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>
              </div>

              <div className="mb-3">
                <Label htmlFor={`reply-content-${comment.id}`}>Sua resposta</Label>
                <Textarea
                  id={`reply-content-${comment.id}`}
                  value={commentContent}
                  onChange={(e) => setCommentContent(e.target.value)}
                  placeholder="Escreva sua resposta..."
                  rows={3}
                />
              </div>

              {formError && (
                <p className="text-red-500 text-sm mb-3">{formError}</p>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitComment}
                  disabled={submitting}
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-1" />
                  {submitting ? 'Enviando...' : 'Enviar Resposta'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setReplyTo(null)}
                  size="sm"
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Renderizar respostas */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2">
          {comment.replies.map(reply => renderComment(reply, level + 1))}
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-idasam-green-dark mx-auto"></div>
        <p className="text-gray-500 mt-2">Carregando comentários...</p>
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" />
          Comentários ({comments.length})
        </h3>

        <Button
          onClick={() => setShowAddComment(!showAddComment)}
          variant="outline"
        >
          Adicionar Comentário
        </Button>
      </div>

      {/* Formulário para novo comentário */}
      {showAddComment && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <h4 className="font-medium mb-4">Deixe seu comentário</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="author-name">Seu nome *</Label>
                <Input
                  id="author-name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="Digite seu nome"
                />
              </div>
              <div>
                <Label htmlFor="author-email">Seu email *</Label>
                <Input
                  id="author-email"
                  type="email"
                  value={authorEmail}
                  onChange={(e) => setAuthorEmail(e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="mb-4">
              <Label htmlFor="comment-content">Comentário *</Label>
              <Textarea
                id="comment-content"
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                placeholder="Escreva seu comentário..."
                rows={4}
              />
            </div>

            <p className="text-sm text-gray-500 mb-4">
              Seu comentário será revisado antes de ser publicado.
            </p>

            {formError && (
              <p className="text-red-500 text-sm mb-4">{formError}</p>
            )}

            <div className="flex gap-2">
              <Button 
                onClick={handleSubmitComment}
                disabled={submitting}
              >
                <Send className="w-4 h-4 mr-2" />
                {submitting ? 'Enviando...' : 'Enviar Comentário'}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAddComment(false)}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Lista de comentários */}
      {comments.length > 0 ? (
        <div>
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Ainda não há comentários</p>
          <p className="text-gray-400 text-sm">Seja o primeiro a comentar!</p>
        </div>
      )}
    </div>
  );
}