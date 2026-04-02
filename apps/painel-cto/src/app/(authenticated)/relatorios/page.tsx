'use client'

import { FileBarChart, Download, Clock, FileText, TrendingUp, DollarSign, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { usePresentations } from '@/hooks/use-relatorios'
import { formatDate } from '@/lib/format'

const TIPO_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  status_report: { icon: FileText, color: '#00C8F0', label: 'Status Report' },
  roadmap: { icon: TrendingUp, color: '#10B981', label: 'Roadmap' },
  financeiro: { icon: DollarSign, color: '#F59E0B', label: 'Financeiro' },
  custom: { icon: FileBarChart, color: '#1A6AAA', label: 'Custom' },
}

export default function RelatoriosPage() {
  const { data: presentations, isLoading } = usePresentations()

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-5">
          <Skeleton className="h-8 w-48 rounded-xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="section-header-icon" style={{ background: 'rgba(0,200,240,0.12)', border: '1px solid rgba(0,200,240,0.2)' }}>
            <FileBarChart className="h-4 w-4 text-brand-cyan" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-text-primary">Relatorios</h1>
            <p className="text-xs text-text-muted">Gere e acesse apresentacoes da operacao</p>
          </div>
        </div>

        {/* Quick Generate */}
        <StaggerItem>
          <div className="card-glass relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,200,240,0.4), transparent)' }} />
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="h-4 w-4 text-brand-cyan" />
              <h3 className="text-sm font-semibold text-text-primary">Gerar Relatorio</h3>
            </div>
            <p className="text-xs text-text-muted mb-4 leading-relaxed">
              Use o Claude Code com as skills de PPTX para gerar apresentacoes automaticamente.
              Diga: &quot;gere um relatorio de status&quot; ou &quot;apresentacao financeira&quot;.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(TIPO_CONFIG).map(([key, cfg]) => {
                const Icon = cfg.icon
                return (
                  <motion.div
                    key={key}
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="rounded-xl p-4 flex flex-col items-center gap-2.5 text-center cursor-pointer transition-colors"
                    style={{ background: `${cfg.color}08`, border: `1px solid ${cfg.color}18` }}
                  >
                    <div
                      className="h-10 w-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}
                    >
                      <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                    </div>
                    <span className="text-xs font-semibold text-text-primary">{cfg.label}</span>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </StaggerItem>

        {/* Library */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Biblioteca</h3>
            <span className="text-xs text-text-muted">{presentations?.length ?? 0} relatorios</span>
          </div>

          {(!presentations || presentations.length === 0) && (
            <div className="card-glass flex flex-col items-center justify-center py-16 text-center">
              <div className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'rgba(0,200,240,0.08)', border: '1px dashed rgba(0,200,240,0.25)' }}>
                <FileBarChart className="h-7 w-7 text-brand-cyan opacity-50" />
              </div>
              <p className="text-sm font-semibold text-text-secondary">Nenhuma apresentacao gerada</p>
              <p className="text-xs text-text-muted mt-1 max-w-sm">Use o comando de geracao acima para criar seu primeiro relatorio PPTX</p>
            </div>
          )}

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {presentations?.map((p) => {
              const cfg = TIPO_CONFIG[p.tipo] ?? { icon: FileBarChart, color: '#1A6AAA', label: 'Custom' }
              const Icon = cfg.icon
              return (
                <StaggerItem key={p.id}>
                  <motion.div
                    whileHover={{ y: -2, transition: { duration: 0.2 } }}
                    className="card-glass-hover"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div
                        className="h-10 w-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${cfg.color}15`, border: `1px solid ${cfg.color}25` }}
                      >
                        <Icon className="h-5 w-5" style={{ color: cfg.color }} />
                      </div>
                      <Badge variant="cyan">{cfg.label}</Badge>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-1 line-clamp-2">{p.titulo}</h4>
                    <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                      <Clock className="h-3 w-3" />
                      {formatDate(p.created_at)}
                      <span>&middot;</span>
                      <span>{p.generated_by}</span>
                    </div>
                    <Button size="sm" variant="secondary" className="w-full" asChild>
                      <a href={p.storage_url} download>
                        <Download className="h-3 w-3" /> Download .pptx
                      </a>
                    </Button>
                  </motion.div>
                </StaggerItem>
              )
            })}
          </StaggerContainer>
        </div>
      </div>
    </PageTransition>
  )
}
