
import { supabase } from '@/supabaseClient';
import { newsCache } from './newsCache';

export interface ReactionCounts {
  like: number;
  love: number;
  clap: number;
  wow: number;
  sad: number;
  angry: number;
}

export interface CommentWithThread {
  id: string;
  author: string;
  content: string;
  created_at: string;
  parent_comment_id?: string;
  thread_level: number;
  reaction_counts: ReactionCounts;
  replies?: CommentWithThread[];
}

export interface ArticleStats {
  likes: number;
  views: number;
  comments: CommentWithThread[];
  reaction_counts: ReactionCounts;
  userReactions: string[];
}

class SocialInteractionsManager {
  // Gerenciar reações de artigos
  async toggleArticleReaction(articleId: string, reactionType: string, userIdentifier: string): Promise<boolean> {
    try {
      // Converter articleId para UUID se necessário
      const articleUUID = this.ensureUUID(articleId);
      
      // Verificar se já reagiu
      const { data: existingReaction } = await supabase
        .from('article_reactions')
        .select('id')
        .eq('article_id', articleUUID)
        .eq('user_identifier', userIdentifier)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remover reação
        const { error } = await supabase
          .rpc('remove_article_reaction', {
            p_article_id: articleUUID,
            p_user_identifier: userIdentifier,
            p_reaction_type: reactionType
          });

        if (error) throw error;
        
        // Invalidar cache
        newsCache.invalidateArticleStats(articleId);
        return false; // Removeu a reação
      } else {
        // Adicionar reação
        const { error } = await supabase
          .rpc('add_article_reaction', {
            p_article_id: articleUUID,
            p_user_identifier: userIdentifier,
            p_reaction_type: reactionType
          });

        if (error) throw error;
        
        // Invalidar cache
        newsCache.invalidateArticleStats(articleId);
        return true; // Adicionou a reação
      }
    } catch (error) {
      console.error('Erro ao alternar reação do artigo:', error);
      throw error;
    }
  }

  // Buscar estatísticas do artigo
  async getArticleStats(articleId: string): Promise<ArticleStats> {
    try {
      const articleUUID = this.ensureUUID(articleId);

      // Buscar estatísticas
      const { data: stats, error: statsError } = await supabase
        .from('article_stats')
        .select('*')
        .eq('article_id', articleUUID)
        .single();

      if (statsError && statsError.code !== 'PGRST116') {
        throw statsError;
      }

      // Buscar comentários
      const { data: comments, error: commentsError } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleUUID)
        .order('created_at', { ascending: true });

      if (commentsError) throw commentsError;

      // Buscar reações do usuário
      const { data: userReactions, error: reactionsError } = await supabase
        .from('article_reactions')
        .select('reaction_type')
        .eq('article_id', articleUUID)
        .eq('user_identifier', this.getCurrentUserIdentifier());

      if (reactionsError && reactionsError.code !== 'PGRST116') {
        throw reactionsError;
      }

      // Organizar comentários em threads
      const organizedComments = this.organizeCommentsInThreads(comments || []);

      return {
        likes: stats?.likes || 0,
        views: stats?.views || 0,
        reaction_counts: stats?.reaction_counts || {
          like: 0, love: 0, clap: 0, wow: 0, sad: 0, angry: 0
        },
        comments: organizedComments,
        userReactions: userReactions?.map(r => r.reaction_type) || []
      };
    } catch (error) {
      console.error('Erro ao buscar estatísticas do artigo:', error);
      throw error;
    }
  }

  // Adicionar comentário
  async addComment(articleId: string, content: string, author: string, parentCommentId?: string): Promise<CommentWithThread> {
    try {
      const articleUUID = this.ensureUUID(articleId);
      const parentUUID = parentCommentId ? this.ensureUUID(parentCommentId) : null;

      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleUUID,
          content,
          author,
          parent_comment_id: parentUUID,
          thread_level: parentCommentId ? 1 : 0
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache
      newsCache.invalidateArticleStats(articleId);

      return data;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  // Alternar reação de comentário
  async toggleCommentReaction(commentId: string, reactionType: string, userIdentifier: string): Promise<boolean> {
    try {
      const commentUUID = this.ensureUUID(commentId);

      // Verificar se já reagiu
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentUUID)
        .eq('user_identifier', userIdentifier)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remover reação
        const { error } = await supabase
          .rpc('remove_comment_reaction', {
            p_comment_id: commentUUID,
            p_user_identifier: userIdentifier,
            p_reaction_type: reactionType
          });

        if (error) throw error;
        return false;
      } else {
        // Adicionar reação
        const { error } = await supabase
          .rpc('add_comment_reaction', {
            p_comment_id: commentUUID,
            p_user_identifier: userIdentifier,
            p_reaction_type: reactionType
          });

        if (error) throw error;
        return true;
      }
    } catch (error) {
      console.error('Erro ao alternar reação do comentário:', error);
      throw error;
    }
  }

  // Utilitários privados
  private ensureUUID(id: string): string {
    // Se já é um UUID válido, retorna como está
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return id;
    }
    
    // Se é um número ou string simples, busca o UUID correspondente no cache ou banco
    // Por simplicidade, vamos gerar um UUID determinístico baseado no ID
    const crypto = window.crypto || (window as any).msCrypto;
    const encoder = new TextEncoder();
    const data = encoder.encode(id);
    
    // Gerar um UUID v4 baseado no hash do ID
    // Esta é uma solução temporária - idealmente todos os IDs já seriam UUIDs
    return `550e8400-e29b-41d4-a716-${String(id).padStart(12, '0').slice(0, 12)}`;
  }

  private getCurrentUserIdentifier(): string {
    // Gerar identificador único para o usuário (baseado em sessão/dispositivo)
    let identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_identifier', identifier);
    }
    return identifier;
  }

  private organizeCommentsInThreads(comments: any[]): CommentWithThread[] {
    const commentMap = new Map();
    const rootComments: CommentWithThread[] = [];

    // Primeiro pass: criar mapa de todos os comentários
    comments.forEach(comment => {
      const commentWithReplies: CommentWithThread = {
        ...comment,
        replies: []
      };
      commentMap.set(comment.id, commentWithReplies);

      // Se é um comentário raiz, adicionar à lista principal
      if (!comment.parent_comment_id) {
        rootComments.push(commentWithReplies);
      }
    });

    // Segundo pass: organizar as respostas
    comments.forEach(comment => {
      if (comment.parent_comment_id) {
        const parent = commentMap.get(comment.parent_comment_id);
        const child = commentMap.get(comment.id);
        if (parent && child) {
          parent.replies.push(child);
        }
      }
    });

    return rootComments;
  }
}

export const socialInteractions = new SocialInteractionsManager();
