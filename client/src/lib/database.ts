import { Pool } from 'pg';

// Cliente PostgreSQL nativo do Replit
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
});

export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};

export const getClient = () => pool;

// Funções específicas para o dashboard
export const dashboardQueries = {
  // Artigos
  getArticles: async () => {
    const result = await query(`
      SELECT 
        a.*,
        c.name as category_name,
        u.name as author_name,
        COALESCE(stats.views, 0) as views,
        COALESCE(stats.likes, 0) as likes
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      LEFT JOIN article_stats stats ON a.id = stats.article_id
      WHERE a.published = true
      ORDER BY a.created_at DESC
    `);
    return result.rows;
  },

  getArticlesFull: async () => {
    const result = await query(`
      SELECT 
        a.*,
        c.name as category_name,
        u.name as author_name,
        COALESCE(stats.views, 0) as views,
        COALESCE(stats.likes, 0) as likes
      FROM articles a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN admin_users u ON a.author_id = u.id
      LEFT JOIN article_stats stats ON a.id = stats.article_id
      ORDER BY a.created_at DESC
    `);
    return result.rows;
  },

  // Categorias
  getCategories: async () => {
    const result = await query(`
      SELECT * FROM categories 
      ORDER BY name
    `);
    return result.rows;
  },

  // Comentários
  getComments: async () => {
    const result = await query(`
      SELECT 
        c.*,
        a.title as article_title
      FROM comments c
      LEFT JOIN articles a ON c.article_id = a.id
      ORDER BY c.created_at DESC
      LIMIT 50
    `);
    return result.rows;
  },

  // Estatísticas de artigos
  getArticleStats: async () => {
    const result = await query(`
      SELECT 
        article_id,
        views,
        likes,
        comments_count
      FROM article_stats
    `);
    return result.rows;
  },

  // Incrementar views
  incrementViews: async (articleId: string) => {
    await query(`
      INSERT INTO article_stats (article_id, views)
      VALUES ($1, 1)
      ON CONFLICT (article_id)
      DO UPDATE SET 
        views = article_stats.views + 1,
        updated_at = NOW()
    `, [articleId]);
  }
};