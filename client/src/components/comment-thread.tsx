import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageCircle,
  User,
  Calendar,
  Send,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';

interface ArticleComment {
  id: string;
  articleId: string;
  parentCommentId?: string | null;
  authorName: string;
  authorEmail: string;
  content: string;
  isApproved: string;
  reactionCounts?: string | null;
  createdAt: string;
}

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

  const [showAddComment, setShowAddComment] = useState(false);
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [formError, setFormError] = useState('');

  const { data: comments = [], isLoading } = useQuery<ArticleComment[]>({
    queryKey: ['/api/articles', articleId, 'comments'],
    queryFn: async () => {
      const res = await fetch(`/api/articles/${articleId}/comments`);
      if (!res.ok) return [];
      return res.json();
    },
  });

  const addCommentMutation = useMutation({
    mutationFn: async (data: { authorName: string; authorEmail: string; content: string }) => {
      const res = await fetch(`/api/articles/${articleId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, articleId }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Erro ao enviar comentário');
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/articles', articleId, 'comments'] });
      setAuthorName('');
      setAuthorEmail('');
      setCommentContent('');
      setShowAddComment(false);
      setFormError('');
    },
    onError: (e: Error) => {
      setFormError(e.message || 'Erro ao enviar comentário. Tente novamente.');
    },
  });

  const validateForm = (): boolean => {
    if (!authorName.trim()) { setFormError('Nome é obrigatório'); return false; }
    if (!authorEmail.trim()) { setFormError('Email é obrigatório'); return false; }
    if (!commentContent.trim()) { setFormError('Comentário é obrigatório'); return false; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(authorEmail)) { setFormError('Email inválido'); return false; }
    setFormError('');
    return true;
  };

  const handleSubmitComment = () => {
    if (!validateForm()) return;
    addCommentMutation.mutate({ authorName, authorEmail, content: commentContent });
  };

  const approvedComments = comments.filter(c => c.isApproved === 'true');

  if (isLoading) {
    return (
      <div className="mt-8 space-y-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-[#2A5B46]" />
          Comentários ({approvedComments.length})
        </h3>
        <Button onClick={() => setShowAddComment(!showAddComment)} variant="outline" className="border-[#2A5B46]/20 text-[#2A5B46] hover:bg-[#2A5B46]/5">
          {showAddComment ? 'Cancelar' : 'Adicionar Comentário'}
        </Button>
      </div>

      {showAddComment && (
        <Card className="mb-6 border-[#2A5B46]/10">
          <CardContent className="p-6">
            <h4 className="font-medium mb-4 text-gray-900">Deixe seu comentário</h4>
            <p className="text-sm text-gray-500 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Seu comentário será revisado antes de ser publicado.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="author-name">Seu nome *</Label>
                <Input id="author-name" value={authorName} onChange={(e) => setAuthorName(e.target.value)} placeholder="Digite seu nome" />
              </div>
              <div>
                <Label htmlFor="author-email">Seu email *</Label>
                <Input id="author-email" type="email" value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} placeholder="seu@email.com" />
              </div>
            </div>
            <div className="mb-4">
              <Label htmlFor="comment-content">Comentário *</Label>
              <Textarea id="comment-content" value={commentContent} onChange={(e) => setCommentContent(e.target.value)} placeholder="Escreva seu comentário..." rows={4} />
            </div>
            {formError && <p className="text-red-500 text-sm mb-4">{formError}</p>}
            <div className="flex gap-2">
              <Button onClick={handleSubmitComment} disabled={addCommentMutation.isPending} className="bg-[#2A5B46] hover:bg-[#2A5B46]/90">
                <Send className="w-4 h-4 mr-2" />
                {addCommentMutation.isPending ? 'Enviando...' : 'Enviar Comentário'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddComment(false)}>Cancelar</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {approvedComments.length > 0 ? (
        <div className="space-y-4">
          {approvedComments.map((comment) => (
            <Card key={comment.id} className="bg-gray-50/80 border-gray-100">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-[#2A5B46]/10 flex items-center justify-center text-[#2A5B46] font-bold text-xs">
                    {comment.authorName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <span className="font-medium text-gray-900">{comment.authorName}</span>
                  <span className="text-gray-300">•</span>
                  <div className="flex items-center gap-1 text-gray-500 text-sm">
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(comment.createdAt)}</span>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{comment.content}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50/50 rounded-xl">
          <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Ainda não há comentários aprovados</p>
          <p className="text-gray-400 text-sm">Seja o primeiro a comentar!</p>
        </div>
      )}
    </div>
  );
}
