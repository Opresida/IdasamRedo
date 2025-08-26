
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
  author_name: string;  // Mudou de 'author' para 'author_name'
  author_email?: string; // Novo campo opcional
  content: string;
  created_at: string;
  parent_comment_id?: string;
  thread_level: number;
  reaction_counts: ReactionCounts;
  replies?: CommentWithThread[];
  is_approved: boolean; // Novo campo para moderação
}

export interface ArticleStats {
  likes: number;
  views: number;
  comments: CommentWithThread[];
  reaction_counts: ReactionCounts;
  userReactions: string[];
}

class SocialInteractionsManager {
  
  // Função para obter identificador único do usuário (anônimo)
  getUserIdentifier(): string {
    let identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
      identifier = `anonymous_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_identifier', identifier);
    }
    return identifier;
  }

  // ===================================
  // COMENTÁRIOS (ÁREA PÚBLICA)
  // ===================================

  // Adicionar comentário público (sem autenticação)
  async addComment(
    articleId: string, 
    authorName: string, 
    content: string, 
    authorEmail?: string, 
    parentCommentId?: string
  ): Promise<CommentWithThread> {
    try {
      const articleUUID = this.ensureUUID(articleId);
      const parentUUID = parentCommentId ? this.ensureUUID(parentCommentId) : null;

      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleUUID,
          author_name: authorName.trim(),
          author_email: authorEmail?.trim() || null,
          content: content.trim(),
          parent_comment_id: parentUUID,
          is_approved: true, // Auto-aprovar por enquanto
          reaction_counts: {
            like: 0, love: 0, clap: 0, wow: 0, sad: 0, angry: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache
      newsCache.invalidateArticleStats(articleId);

      // Retornar com a estrutura esperada
      return {
        ...data,
        thread_level: parentCommentId ? 1 : 0,
        replies: []
      };

    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  // Buscar comentários organizados em threads
  async getCommentsWithThreads(articleId: string): Promise<CommentWithThread[]> {
    try {
      const articleUUID = this.ensureUUID(articleId);

      const { data: comments, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleUUID)
        .eq('is_approved', true) // Apenas comentários aprovados
        .order('created_at', { ascending: true });

      if (error) throw error;

      return this.organizeCommentsIntoThreads(comments || []);

    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      return [];
    }
  }

  // ===================================
  // REAÇÕES (ÁREA PÚBLICA)
  // ===================================

  // Alternar reação do artigo
  async toggleArticleReaction(articleId: string, reactionType: string, userIdentifier: string): Promise<boolean> {
    try {
      const articleUUID = this.ensureUUID(articleId);
      
      // Verificar se já reagiu
      const { data: existingReaction } = await supabase
        .from('article_reactions')
        .select('user_identifier')
        .eq('article_id', articleUUID)
        .eq('user_identifier', userIdentifier)
        .single();

      if (existingReaction) {
        // Remover reação existente
        const { error: deleteError } = await supabase
          .from('article_reactions')
          .delete()
          .eq('article_id', articleUUID)
          .eq('user_identifier', userIdentifier);

        if (deleteError) throw deleteError;

        // Decrementar contador no article_stats
        await this.updateArticleReactionCount(articleUUID, reactionType, -1);
        
        newsCache.invalidateArticleStats(articleId);
        return false; // Removeu a reação

      } else {
        // Adicionar nova reação
        const { error: insertError } = await supabase
          .from('article_reactions')
          .insert({
            article_id: articleUUID,
            user_identifier: userIdentifier,
            reaction_type: reactionType
          });

        if (insertError) throw insertError;

        // Incrementar contador no article_stats
        await this.updateArticleReactionCount(articleUUID, reactionType, 1);
        
        newsCache.invalidateArticleStats(articleId);
        return true; // Adicionou a reação
      }

    } catch (error) {
      console.error('Erro ao alternar reação do artigo:', error);
      throw error;
    }
  }

  // Alternar reação do comentário
  async toggleCommentReaction(commentId: string, reactionType: string, userIdentifier: string): Promise<boolean> {
    try {
      const commentUUID = this.ensureUUID(commentId);

      // Verificar se já reagiu
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('user_identifier')
        .eq('comment_id', commentUUID)
        .eq('user_identifier', userIdentifier)
        .single();

      if (existingReaction) {
        // Remover reação
        const { error: deleteError } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentUUID)
          .eq('user_identifier', userIdentifier);

        if (deleteError) throw deleteError;

        // Decrementar contador no comentário
        await this.updateCommentReactionCount(commentUUID, reactionType, -1);
        return false;

      } else {
        // Adicionar reação
        const { error: insertError } = await supabase
          .from('comment_reactions')
          .insert({
            comment_id: commentUUID,
            user_identifier: userIdentifier,
            reaction_type: reactionType
          });

        if (insertError) throw insertError;

        // Incrementar contador no comentário
        await this.updateCommentReactionCount(commentUUID, reactionType, 1);
        return true;
      }

    } catch (error) {
      console.error('Erro ao alternar reação do comentário:', error);
      throw error;
    }
  }

  // Buscar reações do usuário para artigo
  async getUserArticleReactions(articleId: string, userIdentifier: string): Promise<string[]> {
    try {
      const articleUUID = this.ensureUUID(articleId);

      const { data, error } = await supabase
        .from('article_reactions')
        .select('reaction_type')
        .eq('article_id', articleUUID)
        .eq('user_identifier', userIdentifier);

      if (error) throw error;

      return data?.map(r => r.reaction_type) || [];

    } catch (error) {
      console.error('Erro ao buscar reações do usuário:', error);
      return [];
    }
  }

  // Buscar reações do usuário para comentários
  async getUserCommentReactions(commentIds: string[], userIdentifier: string): Promise<Record<string, string[]>> {
    try {
      if (commentIds.length === 0) return {};

      const commentUUIDs = commentIds.map(id => this.ensureUUID(id));

      const { data, error } = await supabase
        .from('comment_reactions')
        .select('comment_id, reaction_type')
        .in('comment_id', commentUUIDs)
        .eq('user_identifier', userIdentifier);

      if (error) throw error;

      const result: Record<string, string[]> = {};
      data?.forEach(reaction => {
        if (!result[reaction.comment_id]) {
          result[reaction.comment_id] = [];
        }
        result[reaction.comment_id].push(reaction.reaction_type);
      });

      return result;

    } catch (error) {
      console.error('Erro ao buscar reações de comentários:', error);
      return {};
    }
  }

  // ===================================
  // FUNÇÕES AUXILIARES PRIVADAS
  // ===================================

  private async updateArticleReactionCount(articleUUID: string, reactionType: string, increment: number) {
    // Criar/atualizar estatísticas do artigo
    const { data: stats } = await supabase
      .from('article_stats')
      .select('reaction_counts')
      .eq('article_id', articleUUID)
      .single();

    let reactionCounts = stats?.reaction_counts || {};
    reactionCounts[reactionType] = Math.max(0, (reactionCounts[reactionType] || 0) + increment);

    const { error } = await supabase
      .from('article_stats')
      .upsert({
        article_id: articleUUID,
        reaction_counts: reactionCounts,
        updated_at: new Date().toISOString()
      });

    if (error) throw error;
  }

  private async updateCommentReactionCount(commentUUID: string, reactionType: string, increment: number) {
    // Buscar contadores atuais do comentário
    const { data: comment } = await supabase
      .from('comments')
      .select('reaction_counts')
      .eq('id', commentUUID)
      .single();

    let reactionCounts = comment?.reaction_counts || {};
    reactionCounts[reactionType] = Math.max(0, (reactionCounts[reactionType] || 0) + increment);

    const { error } = await supabase
      .from('comments')
      .update({
        reaction_counts: reactionCounts,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentUUID);

    if (error) throw error;
  }

  private ensureUUID(id: string): string {
    // Se já é um UUID válido, retorna como está
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      return id;
    }
    
    // Para IDs numéricos simples, criar UUID determinístico
    // Isso é uma solução temporária - idealmente todos os IDs já seriam UUIDs
    const hash = this.simpleHash(id);
    return `550e8400-e29b-41d4-a716-${hash.slice(0, 12)}`;
  }

  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(16).padStart(12, '0');
  }

  private organizeCommentsIntoThreads(comments: any[]): CommentWithThread[] {
    const commentMap = new Map();
    const rootComments: CommentWithThread[] = [];

    // Primeiro passo: criar mapa de todos os comentários
    comments.forEach(comment => {
      const commentWithReplies: CommentWithThread = {
        ...comment,
        thread_level: comment.parent_comment_id ? 1 : 0,
        replies: []
      };
      commentMap.set(comment.id, commentWithReplies);

      // Se é um comentário raiz, adicionar à lista principal
      if (!comment.parent_comment_id) {
        rootComments.push(commentWithReplies);
      }
    });

    // Segundo passo: organizar as respostas
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

// Função utilitária para organizar comentários em threads (exportada para uso externo)
export function organizeCommentsIntoThreads(comments: any[]): CommentWithThread[] {
  return socialInteractions['organizeCommentsIntoThreads'](comments);
}
