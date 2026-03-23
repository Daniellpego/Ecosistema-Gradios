-- ══════════════════════════════════════════════════════════════
-- Migration 010: Discord + n8n webhooks on quiz_leads INSERT
--
-- Move webhook calls from frontend (page.tsx) to database triggers
-- using pg_net for async HTTP POST. Imune a AdBlockers.
--
-- Configurar URLs via database settings:
--   ALTER DATABASE postgres SET app.discord_webhook_url = 'https://discord.com/api/webhooks/...';
--   ALTER DATABASE postgres SET app.n8n_email_webhook_url = 'https://n8n.example.com/webhook/...';
--
-- pg_net ja habilitado pela migration 009.
-- ══════════════════════════════════════════════════════════════

-- ─── FUNCAO: Notifica Discord sobre novo lead ──────────────

CREATE OR REPLACE FUNCTION notify_discord_quiz_lead()
RETURNS TRIGGER AS $$
DECLARE
  discord_url TEXT := current_setting('app.discord_webhook_url', true);
  payload TEXT;
BEGIN
  IF discord_url IS NULL OR discord_url = '' THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'content', format(
      E'\U0001F3AF **NOVO LEAD \u2014 DIAGN\u00D3STICO**\n\n'
      '**Nome:** %s\n**Empresa:** %s\n**Email:** %s\n'
      '**WhatsApp:** %s\n**Cidade:** %s\n\n'
      '**Score:** %s/100 \u2014 **Tier %s**\n'
      '**Cargo:** %s\n**Porte:** %s\n**Setor:** %s\n'
      '**Gargalos:** %s\n**Processos manuais:** %s\n'
      '**Sistemas desconectados:** %s\n**Tempo perdido:** %s\n'
      '**Impactos:** %s\n**Urg\u00EAncia:** %s\n**Prioridade:** %s',
      COALESCE(NEW.nome, ''),
      COALESCE(NEW.empresa, ''),
      COALESCE(NEW.email, ''),
      COALESCE(NEW.whatsapp, 'n\u00E3o informado'),
      COALESCE(NEW.cidade, 'n\u00E3o detectada'),
      COALESCE(NEW.score, 0),
      COALESCE(NEW.tier, 'D'),
      COALESCE(NEW.cargo, ''),
      COALESCE(NEW.tamanho, ''),
      COALESCE(NEW.setor, ''),
      COALESCE(array_to_string(NEW.gargalos, ', '), 'Nenhum'),
      COALESCE(NEW.processos, ''),
      COALESCE(NEW.sistemas, ''),
      COALESCE(NEW.tempo, ''),
      COALESCE(array_to_string(NEW.impactos, ', '), 'Nenhum'),
      COALESCE(NEW.urgencia, ''),
      COALESCE(NEW.prioridade, '')
    )
  )::TEXT;

  PERFORM extensions.http_post(
    url     := discord_url,
    body    := payload,
    headers := '{"Content-Type": "application/json"}'::JSONB
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'Discord webhook falhou: % — %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── FUNCAO: Dispara sequencia de emails via n8n ───────────

CREATE OR REPLACE FUNCTION notify_n8n_quiz_lead()
RETURNS TRIGGER AS $$
DECLARE
  n8n_url TEXT := current_setting('app.n8n_email_webhook_url', true);
  payload JSONB;
BEGIN
  IF n8n_url IS NULL OR n8n_url = '' THEN
    RETURN NEW;
  END IF;

  payload := jsonb_build_object(
    'nome',              COALESCE(NEW.nome, ''),
    'email',             COALESCE(NEW.email, ''),
    'empresa',           COALESCE(NEW.empresa, ''),
    'whatsapp',          NEW.whatsapp,
    'setor',             COALESCE(NEW.setor, ''),
    'cargo',             COALESCE(NEW.cargo, ''),
    'porte',             COALESCE(NEW.tamanho, ''),
    'score',             COALESCE(NEW.score, 0),
    'tier',              COALESCE(NEW.tier, 'D'),
    'gargalo_principal', COALESCE(NEW.gargalos[1], 'N\u00E3o informado'),
    'gargalos',          COALESCE(array_to_string(NEW.gargalos, ', '), 'Nenhum'),
    'processos',         COALESCE(NEW.processos, ''),
    'sistemas',          COALESCE(NEW.sistemas, ''),
    'tempo',             COALESCE(NEW.tempo, ''),
    'tempo_horas_mes',   COALESCE(NEW.tempo_horas_mes, ''),
    'impactos',          COALESCE(array_to_string(NEW.impactos, ', '), 'Nenhum'),
    'urgencia',          COALESCE(NEW.urgencia, ''),
    'prioridade',        COALESCE(NEW.prioridade, ''),
    'cidade',            NEW.cidade
  );

  PERFORM extensions.http_post(
    url     := n8n_url,
    body    := payload::TEXT,
    headers := '{"Content-Type": "application/json"}'::JSONB
  );

  RETURN NEW;

EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'n8n webhook falhou: % — %', SQLERRM, SQLSTATE;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── TRIGGERS ──────────────────────────────────────────────

DO $$ BEGIN
  CREATE TRIGGER trg_quiz_lead_discord
    AFTER INSERT ON public.quiz_leads
    FOR EACH ROW EXECUTE FUNCTION notify_discord_quiz_lead();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TRIGGER trg_quiz_lead_n8n
    AFTER INSERT ON public.quiz_leads
    FOR EACH ROW EXECUTE FUNCTION notify_n8n_quiz_lead();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════
-- CONFIGURACAO:
--
-- Setar as URLs no Supabase (SQL Editor ou Dashboard):
--
--   ALTER DATABASE postgres SET app.discord_webhook_url = 'https://discord.com/api/webhooks/SEU_WEBHOOK';
--   ALTER DATABASE postgres SET app.n8n_email_webhook_url = 'https://SEU_N8N/webhook/quiz-email';
--
-- Apos configurar, reiniciar o pooler ou abrir nova conexao
-- para os settings serem carregados.
--
-- VERIFICACAO:
--   SELECT current_setting('app.discord_webhook_url', true);
--   SELECT current_setting('app.n8n_email_webhook_url', true);
-- ══════════════════════════════════════════════════════════════
