import { supabase } from '@/supabaseClient';

export interface CommentWithThread {
  id: string;
  article_id: string;
  author_name: string;
  author_email: string;
  content: string;
  parent_comment_id: string | null;
  is_approved: boolean;
  reaction_counts: Record<string, number>;
  created_at: string;
  updated_at: string;
  replies?: CommentWithThread[];
}

export interface ReactionCounts {
  like?: number;
  love?: number;
  laugh?: number;
  angry?: number;
  sad?: number;
}

// Função para obter ou criar um identificador único para o usuário anônimo
function getUserIdentifier(): string {
  let identifier = localStorage.getItem('user_identifier');
  if (!identifier) {
    identifier = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('user_identifier', identifier);
  }
  return identifier;
}

// Função para adicionar um comentário (usando author_name e author_email)
export async function addComment(
  articleId: string,
  content: string,
  authorName: string,
  authorEmail: string,
  parentCommentId?: string
): Promise<CommentWithThread | null> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        article_id: articleId,
        author_name: authorName,
        author_email: authorEmail,
        content: content,
        parent_comment_id: parentCommentId || null,
        is_approved: false, // Comentários precisam ser aprovados
        reaction_counts: {}
      }])
      .select()
      .single();

    if (error) throw error;
    return data as CommentWithThread;
  } catch (error) {
    console.error('Erro ao adicionar comentário:', error);
    return null;
  }
}

// Função para buscar comentários de um artigo
export async function getComments(articleId: string): Promise<CommentWithThread[]> {
  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('article_id', articleId)
      .eq('is_approved', true) // Só buscar comentários aprovados
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Organizar comentários em thread (com replies)
    const commentsMap = new Map<string, CommentWithThread>();
    const rootComments: CommentWithThread[] = [];

    (data || []).forEach(comment => {
      const commentWithReplies: CommentWithThread = {
        ...comment,
        replies: []
      };
      commentsMap.set(comment.id, commentWithReplies);

      if (!comment.parent_comment_id) {
        rootComments.push(commentWithReplies);
      } else {
        const parentComment = commentsMap.get(comment.parent_comment_id);
        if (parentComment) {
          if (!parentComment.replies) {
            parentComment.replies = [];
          }
          parentComment.replies.push(commentWithReplies);
        }
      }
    });

    return rootComments;
  } catch (error) {
    console.error('Erro ao buscar comentários:', error);
    return [];
  }
}

// Função para reagir a um artigo
export async function toggleArticleReaction(
  articleId: string,
  reactionType: string
): Promise<boolean> {
  try {
    const userIdentifier = getUserIdentifier();

    // Verificar se o usuário já reagiu
    const { data: existingReaction, error: checkError } = await supabase
      .from('article_reactions')
      .select('*')
      .eq('article_id', articleId)
      .eq('user_identifier', userIdentifier)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Remover a reação se for a mesma
        const { error: deleteError } = await supabase
          .from('article_reactions')
          .delete()
          .eq('article_id', articleId)
          .eq('user_identifier', userIdentifier);

        if (deleteError) throw deleteError;
      } else {
        // Atualizar para nova reação
        const { error: updateError } = await supabase
          .from('article_reactions')
          .update({ reaction_type: reactionType })
          .eq('article_id', articleId)
          .eq('user_identifier', userIdentifier);

        if (updateError) throw updateError;
      }
    } else {
      // Inserir nova reação
      const { error: insertError } = await supabase
        .from('article_reactions')
        .insert([{
          article_id: articleId,
          user_identifier: userIdentifier,
          reaction_type: reactionType
        }]);

      if (insertError) throw insertError;
    }

    // Atualizar contadores na tabela article_stats
    await updateArticleReactionCounts(articleId);
    return true;
  } catch (error) {
    console.error('Erro ao reagir ao artigo:', error);
    return false;
  }
}

// Função para reagir a um comentário
export async function toggleCommentReaction(
  commentId: string,
  reactionType: string
): Promise<boolean> {
  try {
    const userIdentifier = getUserIdentifier();

    // Verificar se o usuário já reagiu
    const { data: existingReaction, error: checkError } = await supabase
      .from('comment_reactions')
      .select('*')
      .eq('comment_id', commentId)
      .eq('user_identifier', userIdentifier)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existingReaction) {
      if (existingReaction.reaction_type === reactionType) {
        // Remover a reação se for a mesma
        const { error: deleteError } = await supabase
          .from('comment_reactions')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_identifier', userIdentifier);

        if (deleteError) throw deleteError;
      } else {
        // Atualizar para nova reação
        const { error: updateError } = await supabase
          .from('comment_reactions')
          .update({ reaction_type: reactionType })
          .eq('comment_id', commentId)
          .eq('user_identifier', userIdentifier);

        if (updateError) throw updateError;
      }
    } else {
      // Inserir nova reação
      const { error: insertError } = await supabase
        .from('comment_reactions')
        .insert([{
          comment_id: commentId,
          user_identifier: userIdentifier,
          reaction_type: reactionType
        }]);

      if (insertError) throw insertError;
    }

    // Atualizar contadores na tabela comments
    await updateCommentReactionCounts(commentId);
    return true;
  } catch (error) {
    console.error('Erro ao reagir ao comentário:', error);
    return false;
  }
}

// Função auxiliar para atualizar contadores de reação de artigos
async function updateArticleReactionCounts(articleId: string): Promise<void> {
  try {
    // Buscar todas as reações do artigo
    const { data: reactions, error } = await supabase
      .from('article_reactions')
      .select('reaction_type')
      .eq('article_id', articleId);

    if (error) throw error;

    // Contar reações por tipo
    const reactionCounts: Record<string, number> = {};
    (reactions || []).forEach(reaction => {
      reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
    });

    // Atualizar ou inserir na tabela article_stats
    const { error: upsertError } = await supabase
      .from('article_stats')
      .upsert({
        article_id: articleId,
        reaction_counts: reactionCounts,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'article_id'
      });

    if (upsertError) throw upsertError;
  } catch (error) {
    console.error('Erro ao atualizar contadores de reação do artigo:', error);
  }
}

// Função auxiliar para atualizar contadores de reação de comentários
async function updateCommentReactionCounts(commentId: string): Promise<void> {
  try {
    // Buscar todas as reações do comentário
    const { data: reactions, error } = await supabase
      .from('comment_reactions')
      .select('reaction_type')
      .eq('comment_id', commentId);

    if (error) throw error;

    // Contar reações por tipo
    const reactionCounts: Record<string, number> = {};
    (reactions || []).forEach(reaction => {
      reactionCounts[reaction.reaction_type] = (reactionCounts[reaction.reaction_type] || 0) + 1;
    });

    // Atualizar a tabela comments
    const { error: updateError } = await supabase
      .from('comments')
      .update({
        reaction_counts: reactionCounts,
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Erro ao atualizar contadores de reação do comentário:', error);
  }
}

// Função para obter as reações atuais do usuário
export async function getUserReactions(articleId: string): Promise<Record<string, string | null>> {
  try {
    const userIdentifier = getUserIdentifier();

    const { data: articleReaction, error: articleError } = await supabase
      .from('article_reactions')
      .select('reaction_type')
      .eq('article_id', articleId)
      .eq('user_identifier', userIdentifier)
      .single();

    if (articleError && articleError.code !== 'PGRST116') {
      throw articleError;
    }

    return {
      article: articleReaction?.reaction_type || null
    };
  } catch (error) {
    console.error('Erro ao buscar reações do usuário:', error);
    return { article: null };
  }
}

// Função para obter estatísticas atualizadas de um artigo
export async function getArticleStats(articleId: string): Promise<ReactionCounts> {
  try {
    const { data, error } = await supabase
      .from('article_stats')
      .select('reaction_counts')
      .eq('article_id', articleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      throw error;
    }

    return data?.reaction_counts || {};
  } catch (error) {
    console.error('Erro ao buscar estatísticas do artigo:', error);
    return {};
  }
}