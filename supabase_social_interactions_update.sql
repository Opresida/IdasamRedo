
-- Função para atualizar contador de reação de comentário
CREATE OR REPLACE FUNCTION update_comment_reaction_count(
  p_comment_id UUID,
  p_reaction_type TEXT,
  p_increment BOOLEAN
) RETURNS void AS $$
BEGIN
  IF p_increment THEN
    -- Incrementar contador
    UPDATE comments 
    SET reaction_counts = COALESCE(reaction_counts, '{}'::jsonb) || 
                         jsonb_build_object(p_reaction_type, 
                           COALESCE((reaction_counts->>p_reaction_type)::int, 0) + 1)
    WHERE id = p_comment_id;
  ELSE
    -- Decrementar contador
    UPDATE comments 
    SET reaction_counts = COALESCE(reaction_counts, '{}'::jsonb) || 
                         jsonb_build_object(p_reaction_type, 
                           GREATEST(COALESCE((reaction_counts->>p_reaction_type)::int, 0) - 1, 0))
    WHERE id = p_comment_id;
  END IF;
END;
$$ LANGUAGE plpgsql;
