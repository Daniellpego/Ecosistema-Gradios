alter table public.leads
  add column tenant_id text,
  add column email text,
  add column raw_quiz_response jsonb,
  add column lead_status text default 'new',
  add column lead_tags text[] default '{}',
  add column updated_at timestamptz default timezone('utc'::text, now()),
  add column consent boolean default true;

create index if not exists idx_leads_whatsapp on public.leads (whatsapp);
create index if not exists idx_leads_email on public.leads (email);
create index if not exists idx_leads_tenant on public.leads (tenant_id);

alter table public.leads enable row level security;

create policy leads_tenant_select on public.leads for select using (tenant_id = current_setting('my.tenant', true));
create policy leads_tenant_insert on public.leads for insert with check (tenant_id = current_setting('my.tenant', true));
create policy leads_tenant_update on public.leads for update using (tenant_id = current_setting('my.tenant', true)) with check (tenant_id = current_setting('my.tenant', true));
create policy leads_tenant_delete on public.leads for delete using (tenant_id = current_setting('my.tenant', true));
