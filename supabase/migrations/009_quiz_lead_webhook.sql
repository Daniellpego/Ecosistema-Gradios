-- ══════════════════════════════════════════════════════════════
-- Migration 009: Webhook — quiz_leads INSERT → JARVIS CRM
--
-- Quando um lead completa o quiz em gradios.co/diagnostico,
-- o Supabase chama POST /jarvis/crm/novo-lead automaticamente.
--
-- IMPORTANTE: O webhook via pg_net requer a extensao pg_net
-- habilitada no Supabase (Extensions → pg_net → Enable).
-- A URL do JARVIS precisa ser acessivel pelo Supabase
-- (localhost NAO funciona em producao — usar URL publica ou tunnel).
--
-- ALTERNATIVA LOCAL: usar Supabase Realtime no frontend
-- para ouvir INSERTs e chamar o endpoint diretamente.
-- ══════════════════════════════════════════════════════════════

-- ─── HABILITAR pg_net (necessario para webhooks HTTP) ─────

CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ─── FUNCAO: Envia novo lead para JARVIS CRM ─────────────

CREATE OR REPLACE FUNCTION notify_jarvis_novo_lead()
RETURNS TRIGGER AS $$
DECLARE
  jarvis_url TEXT := 'http://localhost:8001/jarvis/crm/novo-lead';
  payload JSONB;
BEGIN
  -- Monta payload com dados do lead
  payload := jsonb_build_object(
    'lead', jsonb_build_object(
      'id',             NEW.id,
      'nome',           COALESCE(NEW.nome, ''),
      'empresa',        COALESCE(NEW.empresa, ''),
      'email',          COALESCE(NEW.email, ''),
      'whatsapp',       COALESCE(NEW.whatsapp, ''),
      'score',          COALESCE(NEW.score, 0),
      'tier',           COALESCE(NEW.tier, 'D'),
      'cargo',          COALESCE(NEW.cargo, ''),
      'tamanho',        COALESCE(NEW.tamanho, ''),
      'setor',          COALESCE(NEW.setor, ''),
      'gargalos',       COALESCE(to_jsonb(NEW.gargalos), '[]'::jsonb),
      'urgencia',       COALESCE(NEW.urgencia, ''),
      'prioridade',     COALESCE(NEW.prioridade, ''),
      'created_at',     NEW.created_at
    )
  );

  -- Envia HTTP POST via pg_net (async, nao bloqueia o INSERT)
  PERFORM extensions.http_post(
    url     := jarvis_url,
    body    := payload::TEXT,
    headers := '{"Content-Type": "application/json"}'::JSONB
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  -- Nunca bloqueia o INSERT — se JARVIS estiver offline, silencia
  RAISE WARNING 'JARVIS webhook falhou: % — %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── TRIGGER: Dispara a cada INSERT em quiz_leads ─────────

DO $$ BEGIN
  CREATE TRIGGER trg_quiz_lead_notify_jarvis
    AFTER INSERT ON public.quiz_leads
    FOR EACH ROW EXECUTE FUNCTION notify_jarvis_novo_lead();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════
-- CONFIGURACAO PARA PRODUCAO:
--
-- 1. Substitua 'http://localhost:8001' pela URL publica do JARVIS
--    Opcoes:
--    a) VPS com IP publico: http://SEU_IP:8001
--    b) Cloudflare Tunnel: https://jarvis.gradios.co
--    c) ngrok (temporario): https://XXXX.ngrok-free.app
--
-- 2. Para alterar a URL sem refazer a migration:
--    CREATE OR REPLACE FUNCTION notify_jarvis_novo_lead()
--    ... (mesmo corpo, nova URL)
--
-- ALTERNATIVA SEM pg_net (funciona local):
-- Use Supabase Realtime no frontend ou um cron job que
-- poll a tabela quiz_leads a cada 30 segundos.
-- ══════════════════════════════════════════════════════════════

-- ─── VERIFICACAO ──────────────────────────────────────────

-- SELECT tgname FROM pg_trigger WHERE tgname = 'trg_quiz_lead_notify_jarvis';
-- SELECT proname FROM pg_proc WHERE proname = 'notify_jarvis_novo_lead';
