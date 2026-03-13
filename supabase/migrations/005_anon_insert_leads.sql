-- ══════════════════════════════════════════════════════════════
-- Migration 005 — Allow anon INSERT on leads (quiz do site)
--
-- Problem: Policy "deny_anon_leads" (RESTRICTIVE) blocks ALL
-- anon operations, including INSERT from the public quiz.
-- Solution: Drop the restrictive deny and create granular policies:
--   - anon can INSERT (quiz creates leads)
--   - anon cannot SELECT/UPDATE/DELETE
--   - authenticated keeps full access
-- ══════════════════════════════════════════════════════════════

-- Drop the old restrictive deny-all policy for anon
DROP POLICY IF EXISTS "deny_anon_leads" ON public.leads;

-- Allow anon to INSERT leads (quiz do site precisa criar leads)
CREATE POLICY "anon_insert_leads" ON public.leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- Explicitly deny anon SELECT (leads are private)
CREATE POLICY "deny_anon_select_leads" ON public.leads
  FOR SELECT TO anon
  USING (false);

-- Explicitly deny anon UPDATE
CREATE POLICY "deny_anon_update_leads" ON public.leads
  FOR UPDATE TO anon
  USING (false);

-- Explicitly deny anon DELETE
CREATE POLICY "deny_anon_delete_leads" ON public.leads
  FOR DELETE TO anon
  USING (false);
