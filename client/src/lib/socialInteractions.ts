// Mock implementation for social interactions - ready for internal database integration

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
function getAnonymousUserId(): string {
  let userId = localStorage.getItem('anonymous_user_id');
  if (!userId) {
    userId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('anonymous_user_id', userId);
  }
  return userId;
}

// Mock data para desenvolvimento
const MOCK_COMMENTS: CommentWithThread[] = [
  {
    id: '1',
    article_id: '1',
    author_name: 'Ana Silva',
    author_email: 'ana@email.com',
    content: 'Excelente iniciativa! É isso que precisamos para desenvolver a Amazônia de forma sustentável.',
    parent_comment_id: null,
    is_approved: true,
    reaction_counts: { like: 12, love: 3 },
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    replies: [
      {
        id: '2',
        article_id: '1',
        author_name: 'Carlos Santos',
        author_email: 'carlos@email.com',
        content: 'Concordo plenamente! Já era hora de vermos projetos assim.',
        parent_comment_id: '1',
        is_approved: true,
        reaction_counts: { like: 5 },
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      }
    ]
  }
];

// Function to get comments for a specific content
export async function getComments(contentId: string, contentType: 'article' | 'news' = 'article') {
  try {
    // First try to get from API
    const response = await fetch(`/api/comments?contentId=${contentId}&contentType=${contentType}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('API not available, using mock data:', error);
  }

  // Fallback to mock data
  await new Promise(resolve => setTimeout(resolve, 500));
  return MOCK_COMMENTS.filter(comment =>
    comment.article_id === contentId && comment.parent_comment_id === null
  );
}

export const addComment = async (
  articleId: string,
  content: string,
  userId: string,
  parentId?: string
): Promise<CommentWithThread> => {
  if (!articleId?.trim()) {
    throw new Error('Article ID is required');
  }
  if (!content?.trim()) {
    throw new Error('Comment content is required');
  }
  if (!userId?.trim()) {
    throw new Error('User ID is required');
  }

  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));

  const newComment: CommentWithThread = {
    id: Date.now().toString(),
    article_id: articleId,
    author_name: "Anonymous", // Placeholder, will be resolved by backend or user profile
    author_email: "anonymous@example.com", // Placeholder
    content: content,
    parent_comment_id: parentId || null,
    is_approved: false, // Comments need approval in real system
    reaction_counts: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // In real implementation, this would save to database
  console.log('Comment would be saved:', newComment);

  return newComment;
}

export async function addReaction(
  articleId: string,
  reactionType: string
): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const userId = getAnonymousUserId();

  // Save to localStorage
  saveUserReactionLocally(articleId, reactionType);

  // In real implementation, this would save to database
  console.log('Reaction would be saved:', { articleId, reactionType, userId });
}

export async function getReactionCounts(articleId: string): Promise<ReactionCounts> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Return mock data - in real implementation, this would come from database
  const mockArticleReactions: Record<string, ReactionCounts> = {
    '1': { like: 89, love: 23, laugh: 5 },
    '2': { like: 67, love: 12, laugh: 3 },
    '3': { like: 45, love: 8, laugh: 2 },
    '4': { like: 112, love: 34, laugh: 7 },
    '5': { like: 58, love: 15, laugh: 4 },
    '6': { like: 43, love: 9, laugh: 1 }
  };

  return mockArticleReactions[articleId] || { like: 0 };
}

// Function to get reactions for a specific content
export async function getReactions(contentId: string) {
  try {
    const response = await fetch(`/api/reactions?contentId=${contentId}`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('API not available, using mock data:', error);
  }

  // Fallback to mock data
  return await getReactionCounts(contentId);
}

export async function getUserReaction(
  articleId: string
): Promise<string | null> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));

  // Check localStorage for user's previous reactions
  const userReactions = JSON.parse(localStorage.getItem('user_reactions') || '{}');
  return userReactions[articleId] || null;
}

export async function removeReaction(articleId: string): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  // Remove from localStorage
  const userReactions = JSON.parse(localStorage.getItem('user_reactions') || '{}');
  delete userReactions[articleId];
  localStorage.setItem('user_reactions', JSON.stringify(userReactions));

  console.log('Reaction would be removed from database');
}

// Helper function to save user reaction locally
export function saveUserReactionLocally(articleId: string, reactionType: string): void {
  const userReactions = JSON.parse(localStorage.getItem('user_reactions') || '{}');
  userReactions[articleId] = reactionType;
  localStorage.setItem('user_reactions', JSON.stringify(userReactions));
}

export async function toggleCommentReaction(
  commentId: string,
  reactionType: string
): Promise<void> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const userId = getAnonymousUserId();

  // In real implementation, this would toggle the reaction in the database
  console.log('Comment reaction would be toggled:', { commentId, reactionType, userId });
}