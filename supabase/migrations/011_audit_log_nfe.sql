-- Migration 011: Audit log + NF-e fields on receitas
-- Date: 2026-04-03

-- Audit log table
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_email text,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id text,
  details jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read audit log" ON public.audit_log FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert audit log" ON public.audit_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- NF-e fields on receitas
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS nf_numero text;
ALTER TABLE receitas ADD COLUMN IF NOT EXISTS nf_chave_acesso text;
