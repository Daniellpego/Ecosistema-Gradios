'use client'

import { useState } from 'react'
import { Send, Eye, EyeOff, AlertTriangle, CheckCircle2, MessageSquare, Milestone, ArrowRightLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { useUpdates, useCreateUpdate } from '@/hooks/use-updates'
import { useCurrentUser } from '@/hooks/use-current-user'
import { formatRelative } from '@/lib/format'
import type { UpdateTipo } from '@/types/database'

const TIPO_CONFIG: Record<UpdateTipo, { icon: React.ElementType; color: string; label: string }> = {
  nota: { icon: MessageSquare, color: '#00C8F0', label: 'Nota' },
  status_change: { icon: ArrowRightLeft, color: '#94A3B8', label: 'Status' },
  milestone: { icon: Milestone, color: '#F59E0B', label: 'Milestone' },
  bloqueio: { icon: AlertTriangle, color: '#EF4444', label: 'Bloqueio' },
  entrega: { icon: CheckCircle2, color: '#10B981', label: 'Entrega' },
}

export function UpdateFeed({ projetoId }: { projetoId: string }) {
  const { data: updates, isLoading } = useUpdates(projetoId)
  const createUpdate = useCreateUpdate()
  const { user: currentUser } = useCurrentUser()
  const [conteudo, setConteudo] = useState('')
  const [tipo, setTipo] = useState<UpdateTipo>('nota')
  const [visivelSocio, setVisivelSocio] = useState(true)

  function handleSubmit() {
    if (!conteudo.trim()) return
    createUpdate.mutate({
      projeto_id: projetoId,
      autor: currentUser.nome,
      tipo,
      conteudo: conteudo.trim(),
      visivel_socio: visivelSocio,
    })
    setConteudo('')
  }

  if (isLoading) return <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>

  return (
    <div className="space-y-4">
      {/* Post form */}
      <div className="card-glass space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Postar um update..."
            value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            className="flex-1"
          />
          <Select value={tipo} onValueChange={(v) => setTipo(v as UpdateTipo)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(TIPO_CONFIG).filter(([key]) => key !== 'status_change').map(([key, cfg]) => (
                <SelectItem key={key} value={key}>{cfg.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleSubmit} disabled={!conteudo.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Switch checked={visivelSocio} onCheckedChange={setVisivelSocio} />
          <span className="text-xs text-text-muted flex items-center gap-1">
            {visivelSocio ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            {visivelSocio ? 'Visivel para socios' : 'Interno'}
          </span>
        </div>
      </div>

      {/* Feed */}
      {(!updates || updates.length === 0) && (
        <EmptyState icon={MessageSquare} title="Nenhum update" description="Poste o primeiro update deste projeto" />
      )}

      <div className="space-y-2">
        {updates?.map((u, i) => {
          const cfg = TIPO_CONFIG[u.tipo]
          const Icon = cfg.icon
          return (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card-glass !p-4 flex items-start gap-3"
            >
              <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${cfg.color}15` }}>
                <Icon className="h-4 w-4" style={{ color: cfg.color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-text-primary">{u.conteudo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-text-muted">{u.autor}</span>
                  <span className="text-xs text-text-muted">&middot;</span>
                  <span className="text-xs text-text-muted">{formatRelative(u.created_at)}</span>
                  {u.visivel_socio && <Eye className="h-3 w-3 text-text-muted" />}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
