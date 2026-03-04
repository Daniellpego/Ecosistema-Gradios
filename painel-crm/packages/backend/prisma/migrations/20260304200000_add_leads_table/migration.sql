-- CreateTable: leads (quiz / Facebook integration)
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "nome" TEXT,
    "empresa" TEXT,
    "email" TEXT,
    "whatsapp" TEXT,
    "segmento" TEXT,
    "horas_perdidas" TEXT,
    "dor_principal" TEXT,
    "faturamento" TEXT,
    "maturidade" TEXT,
    "janela_decisao" TEXT,
    "lead_temperature" TEXT,
    "score" INTEGER,
    "custo_mensal" TEXT,
    "diagnostico_id" TEXT,
    "raw_quiz_response" JSONB,
    "lead_status" TEXT NOT NULL DEFAULT 'new',
    "lead_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "consent" BOOLEAN NOT NULL DEFAULT true,
    "opportunity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- Indexes for dedupe and filtering
CREATE INDEX "leads_tenant_id_idx" ON "leads"("tenant_id");
CREATE INDEX "leads_whatsapp_idx" ON "leads"("whatsapp");
CREATE INDEX "leads_email_idx" ON "leads"("email");
CREATE INDEX "leads_lead_status_idx" ON "leads"("lead_status");

-- AddColumn: agent_logs.lead_id (optional FK to leads)
ALTER TABLE "agent_logs" ADD COLUMN "lead_id" TEXT;
ALTER TABLE "agent_logs" ADD COLUMN "model" TEXT;

-- CreateIndex
CREATE INDEX "agent_logs_lead_id_idx" ON "agent_logs"("lead_id");

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "agent_logs" ADD CONSTRAINT "agent_logs_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Enable RLS on leads table
ALTER TABLE "leads" ENABLE ROW LEVEL SECURITY;

-- RLS policies using current_setting('my.tenant', true)
CREATE POLICY "leads_tenant_isolation_select" ON "leads"
    FOR SELECT USING (tenant_id = current_setting('my.tenant', true));

CREATE POLICY "leads_tenant_isolation_insert" ON "leads"
    FOR INSERT WITH CHECK (tenant_id = current_setting('my.tenant', true));

CREATE POLICY "leads_tenant_isolation_update" ON "leads"
    FOR UPDATE USING (tenant_id = current_setting('my.tenant', true))
    WITH CHECK (tenant_id = current_setting('my.tenant', true));

CREATE POLICY "leads_tenant_isolation_delete" ON "leads"
    FOR DELETE USING (tenant_id = current_setting('my.tenant', true));
