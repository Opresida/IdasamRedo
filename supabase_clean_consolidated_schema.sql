
-- ================================================================
-- SCHEMA CONSOLIDADO E LIMPO PARA O SISTEMA DE NOTÍCIAS IDASAM
-- Remove todas as duplicações e cria estrutura única
-- ================================================================

-- Remover todas as tabelas existentes (limpeza total)
DROP TABLE IF EXISTS comment_reactions CASCADE;
DROP TABLE IF EXISTS article_reactions CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS article_stats CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS articles CASCADE;
DROP TABLE IF EXISTS article_tags CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS user_sessions CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ================================================================
-- 1. TABELA DE USUÁRIOS ADMINISTRATIVOS (ÚNICA)
-- ================================================================
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('admin', 'editor')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 2. TABELA DE CATEGORIAS
-- ================================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  color VARCHAR(7) DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 3. TABELA DE TAGS
-- ================================================================
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(30) UNIQUE NOT NULL,
  slug VARCHAR(30) UNIQUE NOT NULL,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 4. TABELA DE ARTIGOS (ESTRUTURA UNIFICADA)
-- ================================================================
CREATE TABLE articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE,
  excerpt TEXT,
  content TEXT NOT NULL,
  author TEXT NOT NULL,
  category_id UUID REFERENCES categories(id),
  image TEXT,
  featured BOOLEAN DEFAULT false,
  published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 5. TABELA DE RELAÇÃO ARTIGOS-TAGS (MANY-TO-MANY)
-- ================================================================
CREATE TABLE article_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, tag_id)
);

-- ================================================================
-- 6. TABELA DE ESTATÍSTICAS DOS ARTIGOS (ÚNICA)
-- ================================================================
CREATE TABLE article_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID UNIQUE NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  reaction_counts JSONB DEFAULT '{"like": 0, "love": 0, "clap": 0, "wow": 0, "sad": 0, "angry": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 7. TABELA DE COMENTÁRIOS
-- ================================================================
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  content TEXT NOT NULL,
  parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  thread_level INTEGER DEFAULT 0,
  reaction_counts JSONB DEFAULT '{"like": 0, "love": 0, "clap": 0, "wow": 0, "sad": 0, "angry": 0}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- 8. TABELA DE REAÇÕES DOS ARTIGOS
-- ================================================================
CREATE TABLE article_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'clap', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(article_id, user_identifier, reaction_type)
);

-- ================================================================
-- 9. TABELA DE REAÇÕES DOS COMENTÁRIOS
-- ================================================================
CREATE TABLE comment_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comment_id UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  user_identifier TEXT NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'love', 'clap', 'wow', 'sad', 'angry')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(comment_id, user_identifier, reaction_type)
);

-- ================================================================
-- 10. TABELA DE SESSÕES DE USUÁRIOS
-- ================================================================
CREATE TABLE user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================================
-- FUNÇÕES SQL OTIMIZADAS
-- ================================================================

-- Função para incrementar visualizações
CREATE OR REPLACE FUNCTION increment_article_views(p_article_id UUID) 
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
  p_article_id UUID,
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
  p_article_id UUID,
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

-- Função para adicionar reação ao comentário
CREATE OR REPLACE FUNCTION add_comment_reaction(
  p_comment_id UUID,
  p_user_identifier TEXT,
  p_reaction_type TEXT
) RETURNS void AS $$
BEGIN
  -- Inserir a reação
  INSERT INTO comment_reactions (comment_id, user_identifier, reaction_type) 
  VALUES (p_comment_id, p_user_identifier, p_reaction_type)
  ON CONFLICT (comment_id, user_identifier, reaction_type) DO NOTHING;
  
  -- Atualizar contador no comentário
  UPDATE comments 
  SET 
    reaction_counts = COALESCE(reaction_counts, '{}'::jsonb) || 
                     jsonb_build_object(p_reaction_type, 
                       COALESCE((reaction_counts->>p_reaction_type)::int, 0) + 1),
    updated_at = NOW()
  WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql;

-- Função para remover reação do comentário
CREATE OR REPLACE FUNCTION remove_comment_reaction(
  p_comment_id UUID,
  p_user_identifier TEXT,
  p_reaction_type TEXT
) RETURNS void AS $$
BEGIN
  -- Remover a reação
  DELETE FROM comment_reactions 
  WHERE comment_id = p_comment_id 
    AND user_identifier = p_user_identifier 
    AND reaction_type = p_reaction_type;
  
  -- Atualizar contador no comentário
  UPDATE comments 
  SET 
    reaction_counts = COALESCE(reaction_counts, '{}'::jsonb) || 
                     jsonb_build_object(p_reaction_type, 
                       GREATEST(COALESCE((reaction_counts->>p_reaction_type)::int, 0) - 1, 0)),
    updated_at = NOW()
  WHERE id = p_comment_id;
END;
$$ LANGUAGE plpgsql;

-- ================================================================
-- ÍNDICES PARA PERFORMANCE
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published, publish_date);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category_id);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_comments_article_id ON comments(article_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent ON comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_article_stats_article_id ON article_stats(article_id);
CREATE INDEX IF NOT EXISTS idx_article_reactions_article ON article_reactions(article_id);
CREATE INDEX IF NOT EXISTS idx_comment_reactions_comment ON comment_reactions(comment_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_article ON article_tags(article_id);
CREATE INDEX IF NOT EXISTS idx_article_tags_tag ON article_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);

-- ================================================================
-- DADOS INICIAIS
-- ================================================================

-- Inserir usuários administrativos
INSERT INTO admin_users (email, password_hash, name, role) VALUES
('admin@idasam.org', '$2b$10$hash_simulado_admin', 'Administrador IDASAM', 'admin'),
('editor@idasam.org', '$2b$10$hash_simulado_editor', 'Editor IDASAM', 'editor')
ON CONFLICT (email) DO NOTHING;

-- Inserir categorias
INSERT INTO categories (name, slug, description, color) VALUES
('Bioeconomia', 'bioeconomia', 'Artigos sobre desenvolvimento econômico sustentável', '#22C55E'),
('Educação', 'educacao', 'Programas educacionais e de capacitação', '#3B82F6'),
('Tecnologia', 'tecnologia', 'Inovações e soluções tecnológicas', '#8B5CF6'),
('Pesquisa', 'pesquisa', 'Estudos e pesquisas científicas', '#F59E0B'),
('Conservação', 'conservacao', 'Projetos de preservação ambiental', '#10B981')
ON CONFLICT (slug) DO NOTHING;

-- Inserir tags
INSERT INTO tags (name, slug, usage_count) VALUES
('sustentabilidade', 'sustentabilidade', 0),
('bioeconomia', 'bioeconomia', 0),
('comunidades', 'comunidades', 0),
('educação', 'educacao', 0),
('tecnologia', 'tecnologia', 0),
('inovação', 'inovacao', 0),
('amazônia', 'amazonia', 0),
('ribeirinhos', 'ribeirinhos', 0),
('capacitação', 'capacitacao', 0),
('pesquisa', 'pesquisa', 0)
ON CONFLICT (slug) DO NOTHING;

-- Inserir artigos de exemplo com UUIDs e referências corretas
WITH inserted_categories AS (
  SELECT id, slug FROM categories
),
bioeconomia_cat AS (
  SELECT id FROM inserted_categories WHERE slug = 'bioeconomia'
),
educacao_cat AS (
  SELECT id FROM inserted_categories WHERE slug = 'educacao'
),
inserted_articles AS (
  INSERT INTO articles (id, title, slug, excerpt, content, author, category_id, image, featured, published, publish_date) 
  SELECT 
    '550e8400-e29b-41d4-a716-446655440001'::uuid,
    'IDASAM Lança Novo Projeto de Bioeconomia na Amazônia',
    'idasam-lanca-novo-projeto-bioeconomia-amazonia',
    'Iniciativa inovadora busca conciliar desenvolvimento econômico com preservação ambiental.',
    'Conteúdo completo do artigo sobre o projeto de bioeconomia que visa transformar a realidade das comunidades amazônicas através de práticas sustentáveis...',
    'Equipe IDASAM',
    bioeconomia_cat.id,
    'https://i.imgur.com/vVksMXp.jpeg',
    true,
    true,
    NOW()
  FROM bioeconomia_cat
  UNION ALL
  SELECT 
    '550e8400-e29b-41d4-a716-446655440002'::uuid,
    'Capacitação em Tecnologias Sustentáveis para Comunidades Ribeirinhas',
    'capacitacao-tecnologias-sustentaveis-comunidades-ribeirinhas',
    'Programa de formação técnica beneficia mais de 200 famílias na região amazônica.',
    'Conteúdo completo sobre o programa de capacitação que está transformando a vida das comunidades ribeirinhas...',
    'Maria Silva',
    educacao_cat.id,
    'https://i.imgur.com/example2.jpeg',
    false,
    true,
    NOW() - INTERVAL '1 day'
  FROM educacao_cat
  RETURNING id, title
)
SELECT * FROM inserted_articles;

-- Associar tags aos artigos
WITH article_bioeconomia AS (
  SELECT id FROM articles WHERE slug = 'idasam-lanca-novo-projeto-bioeconomia-amazonia'
),
article_capacitacao AS (
  SELECT id FROM articles WHERE slug = 'capacitacao-tecnologias-sustentaveis-comunidades-ribeirinhas'
),
tag_sustentabilidade AS (SELECT id FROM tags WHERE slug = 'sustentabilidade'),
tag_bioeconomia AS (SELECT id FROM tags WHERE slug = 'bioeconomia'),
tag_comunidades AS (SELECT id FROM tags WHERE slug = 'comunidades'),
tag_educacao AS (SELECT id FROM tags WHERE slug = 'educacao'),
tag_tecnologia AS (SELECT id FROM tags WHERE slug = 'tecnologia')
INSERT INTO article_tags (article_id, tag_id)
SELECT a.id, t.id FROM article_bioeconomia a, tag_sustentabilidade t
UNION ALL
SELECT a.id, t.id FROM article_bioeconomia a, tag_bioeconomia t  
UNION ALL
SELECT a.id, t.id FROM article_bioeconomia a, tag_comunidades t
UNION ALL
SELECT a.id, t.id FROM article_capacitacao a, tag_educacao t
UNION ALL
SELECT a.id, t.id FROM article_capacitacao a, tag_tecnologia t
UNION ALL
SELECT a.id, t.id FROM article_capacitacao a, tag_comunidades t
ON CONFLICT (article_id, tag_id) DO NOTHING;

-- ================================================================
-- TRIGGERS PARA ATUALIZAÇÃO AUTOMÁTICA
-- ================================================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger nas tabelas necessárias
CREATE TRIGGER update_articles_updated_at BEFORE UPDATE ON articles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_article_stats_updated_at BEFORE UPDATE ON article_stats
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- VIEWS ÚTEIS PARA CONSULTAS OTIMIZADAS
-- ================================================================

-- View para artigos com informações completas
CREATE OR REPLACE VIEW articles_full AS
SELECT 
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.content,
    a.author,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    a.image,
    a.featured,
    a.published,
    a.publish_date,
    a.created_at,
    a.updated_at,
    COALESCE(s.views, 0) as views,
    COALESCE(s.likes, 0) as likes,
    COALESCE(s.reaction_counts, '{}') as reaction_counts,
    array_agg(DISTINCT t.name) FILTER (WHERE t.name IS NOT NULL) as tags
FROM articles a
LEFT JOIN categories c ON a.category_id = c.id
LEFT JOIN article_stats s ON a.id = s.article_id
LEFT JOIN article_tags at ON a.id = at.article_id
LEFT JOIN tags t ON at.tag_id = t.id
GROUP BY a.id, a.title, a.slug, a.excerpt, a.content, a.author, c.name, c.slug, c.color, 
         a.image, a.featured, a.published, a.publish_date, a.created_at, a.updated_at,
         s.views, s.likes, s.reaction_counts;

-- ================================================================
-- POLÍTICAS DE SEGURANÇA RLS (ROW LEVEL SECURITY)
-- ================================================================

-- Habilitar RLS nas tabelas sensíveis
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- Política para admin_users (apenas administradores podem ver/editar)
CREATE POLICY admin_users_policy ON admin_users
    USING (auth.jwt() ->> 'role' = 'admin');

-- Política para user_sessions (usuários podem ver apenas suas próprias sessões)
CREATE POLICY user_sessions_policy ON user_sessions
    USING (user_id = (auth.jwt() ->> 'sub')::uuid);

-- ================================================================
-- FIM DO SCHEMA CONSOLIDADO
-- ================================================================

COMMENT ON DATABASE postgres IS 'Schema consolidado do IDASAM - Sistema de Notícias sem duplicações';
