-- ══════════════════════════════════════════════════════════════
-- Migration 006: Create quiz_leads table
--
-- The site-principal diagnostico page inserts directly into
-- quiz_leads (separate from the CRM quiz_sessions table).
-- This table stores the full quiz response + AI diagnosis.
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.quiz_leads (
  id                UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome              TEXT NOT NULL,
  empresa           TEXT NOT NULL,
  email             TEXT NOT NULL,
  whatsapp          TEXT,
  cidade            TEXT,
  score             INTEGER NOT NULL DEFAULT 0,
  tier              TEXT NOT NULL DEFAULT 'D' CHECK (tier IN ('A', 'B', 'C', 'D')),
  cargo             TEXT,
  tamanho           TEXT,
  setor             TEXT,
  gargalos          TEXT[],
  processos         TEXT,
  sistemas          TEXT,
  tempo             TEXT,
  tempo_horas_mes   TEXT,
  impactos          TEXT[],
  urgencia          TEXT,
  prioridade        TEXT,
  diagnostico_ia    TEXT,
  utm_source        TEXT,
  utm_medium        TEXT,
  utm_campaign      TEXT,
  created_at        TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_quiz_leads_email ON public.quiz_leads(email);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_tier ON public.quiz_leads(tier);
CREATE INDEX IF NOT EXISTS idx_quiz_leads_created ON public.quiz_leads(created_at DESC);

-- RLS: anon can INSERT + UPDATE (public quiz, no auth needed)
ALTER TABLE public.quiz_leads ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "anon_insert_quiz_leads" ON public.quiz_leads
    FOR INSERT TO anon WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "anon_update_quiz_leads" ON public.quiz_leads
    FOR UPDATE TO anon USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "auth_all_quiz_leads" ON public.quiz_leads
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Realtime (optional — useful if CRM wants to listen)
DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.quiz_leads;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
