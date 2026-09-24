-- ====================================================
-- SCRIPT DE ACTUALIZACIÓN DE POLÍTICA RLS DE COMENTARIOS
-- Copia y ejecuta este código en el SQL Editor de Supabase
-- ====================================================

DROP POLICY IF EXISTS "Public insert pending comments" ON public.comments;

CREATE POLICY "Public insert pending comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (true);
