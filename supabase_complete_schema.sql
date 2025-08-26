
-- Schema completo para o sistema de notícias do IDASAM

-- 1. Tabela de artigos (principal)
CREATE TABLE IF NOT EXISTS articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category TEXT,
  tags TEXT[],
  image TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabela de estatísticas dos artigos
CREATE TABLE IF NOT EXISTS article_stats (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT UNIQUE NOT NULL,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reaction_counts JSONB DEFAULT '{"like": 0, "love": 0, "clap": 0, "wow": 0, "sad": 0, "angry": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabela de comentários
CREATE TABLE IF NOT EXISTS comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  thread_level INTEGER DEFAULT 0,
  reaction_counts JSONB DEFAULT '{"like": 0, "love": 0, "clap": 0, "wow": 0, "sad": 0, "angry": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Tabela de reações dos artigos
CREATE TABLE IF NOT EXISTS article_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id TEXT NOT NULL,
  user_identifier TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_identifier, reaction_type)
);

-- 5. Tabela de reações dos comentários
CREATE TABLE IF NOT EXISTS comment_reactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  reaction_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_identifier, reaction_type)
);

-- 6. Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir usuários administrativos padrão
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@idasam.org', '$2b$10$hash_simulado_admin', 'Administrador IDASAM', 'admin'),
('editor@idasam.org', '$2b$10$hash_simulado_editor', 'Editor IDASAM', 'editor')
ON CONFLICT (email) DO NOTHING;

-- Função para incrementar visualizações dos artigos
CREATE OR REPLACE FUNCTION increment_article_views(p_article_id TEXT) 
RETURNS void AS $$
BEGIN
  INSERT INTO article_stats (article_id, likes, views) 
  VALUES (p_article_id, 0, 1)
  ON CONFLICT (article_id) 
  DO UPDATE SET 
    views = article_stats.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para adicionar reação ao artigo
CREATE OR REPLACE FUNCTION add_article_reaction(
  p_article_id TEXT,
  p_user_identifier TEXT,
  p_reaction_type TEXT
) RETURNS void AS $$
BEGIN
  -- Inserir a reação
  INSERT INTO article_reactions (article_id, user_identifier, reaction_type) 
  VALUES (p_article_id, p_user_identifier, p_reaction_type)
  ON CONFLICT (article_id, user_identifier, reaction_type) DO NOTHING;
  
  -- Atualizar contadores
  INSERT INTO article_stats (article_id, reaction_counts) 
  VALUES (p_article_id, ('{"' || p_reaction_type || '": 1}')::jsonb)
  ON CONFLICT (article_id) 
  DO UPDATE SET 
    reaction_counts = article_stats.reaction_counts || ('{"' || p_reaction_type || '": ' || 
      (COALESCE((article_stats.reaction_counts->>p_reaction_type)::int, 0) + 1) || '}')::jsonb,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- Função para remover reação do artigo
CREATE OR REPLACE FUNCTION remove_article_reaction(
  p_article_id TEXT,
  p_user_identifier TEXT,
  p_reaction_type TEXT
) RETURNS void AS $$
BEGIN
  -- Remover a reação
  DELETE FROM article_reactions 
  WHERE article_id = p_article_id 
    AND user_identifier = p_user_identifier 
    AND reaction_type = p_reaction_type;
  
  -- Atualizar contadores
  UPDATE article_stats 
  SET 
    reaction_counts = article_stats.reaction_counts || ('{"' || p_reaction_type || '": ' || 
      GREATEST((COALESCE((article_stats.reaction_counts->>p_reaction_type)::int, 0) - 1), 0) || '}')::jsonb,
    updated_at = NOW()
  WHERE article_id = p_article_id;
END;
$$ LANGUAGE plpgsql;

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published, publish_date);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_article_stats_article_id ON article_stats(article_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_article ON article_reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);

-- Inserir alguns artigos de exemplo
INSERT INTO articles (id, title, excerpt, content, author, category, image, tags, featured, published, publish_date) VALUES
('550e8400-e29b-41d4-a716-446655440001', 
 'IDASAM Lança Novo Projeto de Bioeconomia na Amazônia', 
 'Iniciativa inovadora busca conciliar desenvolvimento econômico com preservação ambiental.',
 'Conteúdo completo do artigo sobre o projeto de bioeconomia...',
 'Equipe IDASAM',
 'Bioeconomia',
 'https://i.imgur.com/vVksMXp.jpeg',
 ARRAY['sustentabilidade', 'bioeconomia', 'comunidades'],
 true,
 true,
 NOW()
),
('550e8400-e29b-41d4-a716-446655440002',
 'Capacitação em Tecnologias Sustentáveis para Comunidades Ribeirinhas',
 'Programa de formação técnica beneficia mais de 200 famílias na região amazônica.',
 'Conteúdo completo sobre o programa de capacitação...',
 'Maria Silva',
 'Educação',
 'https://i.imgur.com/example2.jpeg',
 ARRAY['educação', 'tecnologia', 'comunidades'],
 false,
 true,
 NOW() - INTERVAL '1 day'
)
ON CONFLICT (id) DO NOTHING;
