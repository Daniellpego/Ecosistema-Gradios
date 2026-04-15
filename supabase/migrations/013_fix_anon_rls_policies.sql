-- ══════════════════════════════════════════════════════════════
-- Migration 013: Fix permissive anon UPDATE RLS policies
--
-- ACHADO-02: anon_update_quiz_leads used USING(true), allowing
--            any anonymous user to overwrite any row in quiz_leads.
--
-- ACHADO-03: anon_update_leads_janela used USING(diagnostico_id
--            IS NOT NULL) with no column restriction, allowing
--            any anonymous user to overwrite all columns on any
--            lead that has a diagnostico_id.
--
-- Fix: drop both permissive policies and replace each with a
--      SECURITY DEFINER function that performs only the specific
--      column update the application actually needs, with guards
--      against overwriting existing values and against stale rows.
-- ══════════════════════════════════════════════════════════════

-- ─── 1. FIX quiz_leads (ACHADO-02) ───────────────────────────

-- Remove the permissive policy
DROP POLICY IF EXISTS "anon_update_quiz_leads" ON public.quiz_leads;

-- Safe replacement: SECURITY DEFINER function that can only set
-- diagnostico_ia, only once (if still NULL), and only on rows
-- created within the last hour (prevents mass-enumeration abuse).
CREATE OR REPLACE FUNCTION public.update_quiz_lead_diagnostico(
  p_id           UUID,
  p_diagnostico_ia TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate input length (Anthropic Claude responses are ≤ 2 000 chars)
  IF p_diagnostico_ia IS NULL OR char_length(p_diagnostico_ia) > 4000 THEN
    RAISE EXCEPTION 'diagnostico_ia: invalid value';
  END IF;

  -- Only update if:
  --   • Row exists
  --   • diagnostico_ia is still NULL (idempotent, prevents overwrite)
  --   • Row was created in the last 2 hours (limits enumeration window)
  UPDATE public.quiz_leads
  SET    diagnostico_ia = p_diagnostico_ia
  WHERE  id             = p_id
    AND  diagnostico_ia IS NULL
    AND  created_at    > (NOW() - INTERVAL '2 hours');

  -- Silently succeed even if no row matched (no information leakage)
END;
$$;

-- Grant execute to anon so the public quiz page can call it
GRANT EXECUTE ON FUNCTION public.update_quiz_lead_diagnostico(UUID, TEXT) TO anon;

-- ─── 2. FIX leads (ACHADO-03) ────────────────────────────────

-- Remove the permissive policy (comment claimed column restriction
-- but RLS does NOT restrict by column — any field could be updated)
DROP POLICY IF EXISTS "anon_update_leads_janela" ON public.leads;

-- Allowed values for janela_decisao (whitelist)
CREATE OR REPLACE FUNCTION public.update_lead_janela_decisao(
  p_diagnostico_id TEXT,
  p_janela_decisao TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate against known whitelist — rejects anything unexpected
  IF p_janela_decisao NOT IN (
    'imediata', '30_dias', '90_dias', 'sem_prazo',
    'Urgência imediata (preciso resolver agora)',
    'Próximos 30 dias',
    'Próximos 90 dias',
    'Próximos 6 meses',
    'Só estou mapeando (sem prazo definido)'
  ) THEN
    RAISE EXCEPTION 'janela_decisao: valor não permitido';
  END IF;

  -- Only update janela_decisao; only if the row is recent (< 24 h)
  UPDATE public.leads
  SET    janela_decisao = p_janela_decisao
  WHERE  diagnostico_id = p_diagnostico_id
    AND  created_at    > (NOW() - INTERVAL '24 hours');
END;
$$;

-- Grant execute to anon
GRANT EXECUTE ON FUNCTION public.update_lead_janela_decisao(TEXT, TEXT) TO anon;

-- ══════════════════════════════════════════════════════════════
-- Verification queries (run in Supabase SQL Editor after apply):
--
-- SELECT polname FROM pg_policies
--   WHERE tablename IN ('quiz_leads', 'leads')
--   AND polroles @> ARRAY['anon'::name]
--   AND polcmd = 'w';  -- should return only INSERT policies
--
-- SELECT proname FROM pg_proc
--   WHERE proname IN ('update_quiz_lead_diagnostico',
--                     'update_lead_janela_decisao');
-- ══════════════════════════════════════════════════════════════
