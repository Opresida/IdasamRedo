
-- Script para corrigir o conflito da função increment_article_views

-- Remove todas as versões existentes da função
DROP FUNCTION IF EXISTS increment_article_views(text);
DROP FUNCTION IF EXISTS increment_article_views(uuid);
DROP FUNCTION IF EXISTS increment_article_views(p_article_id text);
DROP FUNCTION IF EXISTS increment_article_views(p_article_id uuid);

-- Recria a função correta que aceita UUID
CREATE OR REPLACE FUNCTION increment_article_views(p_article_id UUID) 
RETURNS void AS $$
BEGIN
  INSERT INTO article_stats (article_id, views) 
  VALUES (p_article_id, 1)
  ON CONFLICT (article_id) 
  DO UPDATE SET 
    views = article_stats.views + 1,
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql;
