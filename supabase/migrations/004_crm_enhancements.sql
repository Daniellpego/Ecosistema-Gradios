-- ══════════════════════════════════════════════════════════════
-- Migration 004: CRM Enhancements
--
-- 1. Adiciona colunas faltantes em leads (whatsapp, setor, temperatura, etc.)
-- 2. Adiciona colunas faltantes em deals (tipo_servico, probabilidade, etc.)
-- 3. Cria tabela atividades (timeline de interações)
-- 4. Trigger: mudança de status do lead → atividade automática
-- ══════════════════════════════════════════════════════════════

-- ─── 1. COLUNAS EXTRAS EM LEADS ────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.leads ADD COLUMN whatsapp TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.leads ADD COLUMN setor TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.leads ADD COLUMN temperatura TEXT DEFAULT 'morno'
    CHECK (temperatura IN ('frio', 'morno', 'quente'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.leads ADD COLUMN ultimo_contato TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.leads ADD COLUMN proximo_followup TIMESTAMPTZ;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.leads ADD COLUMN motivo_perda TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.leads ADD COLUMN tags TEXT[] DEFAULT '{}';
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── 2. COLUNAS EXTRAS EM DEALS ────────────────────────────

DO $$ BEGIN
  ALTER TABLE public.deals ADD COLUMN tipo_servico TEXT
    CHECK (tipo_servico IN ('setup', 'mensalidade', 'projeto_avulso', 'consultoria', 'mvp'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.deals ADD COLUMN probabilidade INTEGER DEFAULT 50
    CHECK (probabilidade BETWEEN 0 AND 100);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.deals ADD COLUMN motivo_perda TEXT;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.deals ADD COLUMN data_previsao_fechamento DATE;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- ─── 3. TABELA ATIVIDADES ──────────────────────────────────

CREATE TABLE IF NOT EXISTS public.atividades (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id     UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  deal_id     UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  tipo        TEXT NOT NULL CHECK (tipo IN (
    'nota', 'ligacao', 'whatsapp', 'email', 'reuniao',
    'proposta_enviada', 'followup', 'sistema'
  )),
  descricao   TEXT NOT NULL,
  data        TIMESTAMPTZ DEFAULT now(),
  autor       TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_atividades_lead ON public.atividades(lead_id);
CREATE INDEX IF NOT EXISTS idx_atividades_deal ON public.atividades(deal_id);
CREATE INDEX IF NOT EXISTS idx_atividades_data ON public.atividades(data DESC);

ALTER TABLE public.atividades ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "auth_all_atividades" ON public.atividades
    FOR ALL TO authenticated USING (true) WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "deny_anon_atividades" ON public.atividades
    AS RESTRICTIVE FOR ALL TO anon USING (false) WITH CHECK (false);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.atividades;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 4. INDEXES EXTRAS PARA LEADS ─────────────────────────

CREATE INDEX IF NOT EXISTS idx_leads_temperatura ON public.leads(temperatura);
CREATE INDEX IF NOT EXISTS idx_leads_proximo_followup ON public.leads(proximo_followup);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);

-- ─── 5. TRIGGER: MUDANÇA DE STATUS → ATIVIDADE AUTOMÁTICA ──

CREATE OR REPLACE FUNCTION on_lead_status_change()
RETURNS TRIGGER AS $$
DECLARE
  v_status_labels JSONB := '{
    "novo": "Novo",
    "contatado": "Contatado",
    "qualificado": "Qualificado",
    "reuniao": "Reunião",
    "proposta": "Proposta",
    "fechado_ganho": "Fechado (Ganho)",
    "fechado_perdido": "Fechado (Perdido)"
  }'::JSONB;
  v_old_label TEXT;
  v_new_label TEXT;
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    v_old_label := COALESCE(v_status_labels ->> OLD.status::TEXT, OLD.status::TEXT);
    v_new_label := COALESCE(v_status_labels ->> NEW.status::TEXT, NEW.status::TEXT);

    INSERT INTO public.atividades (lead_id, tipo, descricao, autor)
    VALUES (
      NEW.id,
      'sistema',
      'Status alterado: ' || v_old_label || ' → ' || v_new_label,
      COALESCE(NEW.responsavel, 'Sistema')
    );

    -- Update ultimo_contato
    NEW.ultimo_contato := now();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  CREATE TRIGGER trg_lead_status_change
    BEFORE UPDATE ON public.leads
    FOR EACH ROW EXECUTE FUNCTION on_lead_status_change();
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ─── 6. ADICIONAR 'reuniao' AO ENUM lead_status (se não existir) ──
-- O enum original tem: novo, contatado, qualificado, proposta, negociacao, fechado_ganho, fechado_perdido
-- O CRM precisa de 'reuniao' em vez de 'negociacao'

DO $$ BEGIN
  ALTER TYPE lead_status ADD VALUE IF NOT EXISTS 'reuniao' AFTER 'qualificado';
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ══════════════════════════════════════════════════════════════
-- Verification:
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'leads';
-- SELECT column_name FROM information_schema.columns WHERE table_name = 'deals';
-- SELECT * FROM information_schema.tables WHERE table_name = 'atividades';
-- SELECT tgname FROM pg_trigger WHERE tgname = 'trg_lead_status_change';
-- ══════════════════════════════════════════════════════════════
