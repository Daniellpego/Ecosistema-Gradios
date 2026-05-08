-- ══════════════════════════════════════════════════════════════
-- Migration 016: site_leads (formulário de contato do site institucional)
--
-- Tabela alimentada pela Edge Function `site-lead-submit`. O frontend
-- (gradios.co) envia JSON para a função, que valida, faz rate-limit
-- por IP e insere usando o service_role. Nenhuma role anon insere
-- diretamente nesta tabela.
-- ══════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.site_leads (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nome          TEXT NOT NULL,
  contato       TEXT NOT NULL,
  empresa       TEXT,
  tipo          TEXT NOT NULL,
  mensagem      TEXT NOT NULL,
  origem        TEXT,
  user_agent    TEXT,
  ip_hash       TEXT,
  utm_source    TEXT,
  utm_medium    TEXT,
  utm_campaign  TEXT,
  status        TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo','em_atendimento','convertido','descartado')),
  created_at    TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_site_leads_created ON public.site_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_site_leads_status  ON public.site_leads(status);
CREATE INDEX IF NOT EXISTS idx_site_leads_iphash  ON public.site_leads(ip_hash, created_at DESC);

ALTER TABLE public.site_leads ENABLE ROW LEVEL SECURITY;

-- Apenas service_role insere. Usuários autenticados podem ler/atualizar
-- (CRM/painel interno consome esta tabela).
DO $$ BEGIN
  CREATE POLICY "service_role_insert_site_leads" ON public.site_leads
    FOR INSERT TO service_role WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "auth_select_site_leads" ON public.site_leads
    FOR SELECT TO authenticated USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "auth_update_site_leads" ON public.site_leads
    FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
