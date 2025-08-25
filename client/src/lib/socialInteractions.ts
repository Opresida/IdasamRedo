
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

class SocialInteractionsManager {
  // Gerenciar reações de artigos
  async toggleArticleReaction(articleId: string, reactionType: string, userIdentifier: string): Promise<boolean> {
    try {
      // Verificar se já reagiu
      const { data: existingReaction } = await supabase
        .from('article_reactions')
        .select('id')
        .eq('article_id', articleId)
        .eq('user_identifier', userIdentifier)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remover reação
        const { error } = await supabase
          .rpc('remove_article_reaction', {
            p_article_id: articleId,
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
            p_article_id: articleId,
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

  // Gerenciar reações de comentários
  async toggleCommentReaction(commentId: string, reactionType: string, userIdentifier: string): Promise<boolean> {
    try {
      // Verificar se já reagiu
      const { data: existingReaction } = await supabase
        .from('comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_identifier', userIdentifier)
        .eq('reaction_type', reactionType)
        .single();

      if (existingReaction) {
        // Remover reação
        const { error: deleteError } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_identifier', userIdentifier)
          .eq('reaction_type', reactionType);

        if (deleteError) throw deleteError;

        // Atualizar contador no comentário
        const { error: updateError } = await supabase
          .rpc('update_comment_reaction_count', {
            p_comment_id: commentId,
            p_reaction_type: reactionType,
            p_increment: false
          });

        if (updateError) console.warn('Erro ao atualizar contador:', updateError);
        
        return false; // Removeu a reação
      } else {
        // Adicionar reação
        const { error } = await supabase
          .rpc('add_comment_reaction', {
            p_comment_id: commentId,
            p_user_identifier: userIdentifier,
            p_reaction_type: reactionType
          });

        if (error) throw error;
        
        return true; // Adicionou a reação
      }
    } catch (error) {
      console.error('Erro ao alternar reação do comentário:', error);
      throw error;
    }
  }

  // Buscar reações do usuário para um artigo
  async getUserArticleReactions(articleId: string, userIdentifier: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('article_reactions')
        .select('reaction_type')
        .eq('article_id', articleId)
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
      const { data, error } = await supabase
        .from('comment_reactions')
        .select('comment_id, reaction_type')
        .in('comment_id', commentIds)
        .eq('user_identifier', userIdentifier);

      if (error) throw error;

      const reactions: Record<string, string[]> = {};
      data?.forEach(reaction => {
        if (!reactions[reaction.comment_id]) {
          reactions[reaction.comment_id] = [];
        }
        reactions[reaction.comment_id].push(reaction.reaction_type);
      });

      return reactions;
    } catch (error) {
      console.error('Erro ao buscar reações dos comentários:', error);
      return {};
    }
  }

  // Adicionar comentário (incluindo resposta)
  async addComment(
    articleId: string,
    author: string,
    content: string,
    parentCommentId?: string
  ): Promise<CommentWithThread> {
    try {
      const threadLevel = parentCommentId ? 1 : 0; // Máximo 2 níveis (0 e 1)

      const { data, error } = await supabase
        .from('comments')
        .insert({
          article_id: articleId,
          author: author.trim(),
          content: content.trim(),
          parent_comment_id: parentCommentId || null,
          thread_level: threadLevel,
          reaction_counts: {
            like: 0,
            love: 0,
            clap: 0,
            wow: 0,
            sad: 0,
            angry: 0
          }
        })
        .select()
        .single();

      if (error) throw error;

      // Invalidar cache de comentários
      newsCache.invalidateComments(articleId);

      return data as CommentWithThread;
    } catch (error) {
      console.error('Erro ao adicionar comentário:', error);
      throw error;
    }
  }

  // Buscar comentários com threads organizadas
  async getCommentsWithThreads(articleId: string): Promise<CommentWithThread[]> {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('article_id', articleId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Organizar em threads
      return this.organizeCommentsIntoThreads(data || []);
    } catch (error) {
      console.error('Erro ao buscar comentários:', error);
      throw error;
    }
  }

  // Organizar comentários em estrutura de thread
  private organizeCommentsIntoThreads(comments: CommentWithThread[]): CommentWithThread[] {
    const commentMap = new Map<string, CommentWithThread>();
    const rootComments: CommentWithThread[] = [];

    // Criar mapa de comentários
    comments.forEach(comment => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Organizar hierarquia
    comments.forEach(comment => {
      const commentWithReplies = commentMap.get(comment.id)!;
      
      if (comment.parent_comment_id) {
        // É uma resposta
        const parent = commentMap.get(comment.parent_comment_id);
        if (parent) {
          parent.replies = parent.replies || [];
          parent.replies.push(commentWithReplies);
          // Ordenar respostas por data (mais antigas primeiro)
          parent.replies.sort((a, b) => 
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          );
        }
      } else {
        // É comentário raiz
        rootComments.push(commentWithReplies);
      }
    });

    // Ordenar comentários raiz por data (mais recentes primeiro)
    return rootComments.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  // Função utilitária para gerar identificador único do usuário
  getUserIdentifier(): string {
    let identifier = localStorage.getItem('user_identifier');
    if (!identifier) {
      identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('user_identifier', identifier);
    }
    return identifier;
  }
}

export const socialInteractions = new SocialInteractionsManager();
