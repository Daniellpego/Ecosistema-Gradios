'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Trash2, Loader2, FileText, Phone, MessageCircle,
  Mail, Users, FileCheck, RefreshCw, Settings, CheckCircle2, XCircle,
} from 'lucide-react'
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useDealById, useUpdateDeal, useDeleteDeal, useDealActivities } from '@/hooks/use-deals'
import { useLeadById, useCreateActivity } from '@/hooks/use-leads'
import { ATIVIDADE_LABELS, type AtividadeTipo } from '@/types/database'
import { formatCurrency, formatDate, formatTimeAgo } from '@/lib/format'

const TIPO_SERVICO_LABELS: Record<string, string> = {
  setup: 'Setup',
  mensalidade: 'Mensalidade',
  projeto_avulso: 'Projeto Avulso',
  consultoria: 'Consultoria',
  mvp: 'MVP',
}

const STATUS_COLORS: Record<string, string> = {
  aberto: '#00C8F0',
  ganho: '#10B981',
  perdido: '#EF4444',
}

const STATUS_LABELS: Record<string, string> = {
  aberto: 'Aberto',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

const ACTIVITY_ICONS: Record<string, typeof FileText> = {
  nota: FileText,
  ligacao: Phone,
  whatsapp: MessageCircle,
  email: Mail,
  reuniao: Users,
  proposta_enviada: FileCheck,
  followup: RefreshCw,
  sistema: Settings,
}

export default function DealDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const { data: deal, isLoading } = useDealById(id)
  const { data: activities } = useDealActivities(id)
  const updateDeal = useUpdateDeal()
  const deleteDeal = useDeleteDeal()
  const createActivity = useCreateActivity()

  const leadId = deal?.lead_id ?? ''
  const { data: lead } = useLeadById(leadId)

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [perdaOpen, setPerdaOpen] = useState(false)
  const [motivoPerda, setMotivoPerda] = useState('')
  const [activityType, setActivityType] = useState<AtividadeTipo>('nota')
  const [activityDesc, setActivityDesc] = useState('')

  async function handleGanho() {
    if (!deal) return
    await updateDeal.mutateAsync({
      id: deal.id,
      status: 'ganho',
      data_fechamento: new Date().toISOString().split('T')[0],
    } as Parameters<typeof updateDeal.mutateAsync>[0])
  }

  async function handlePerda() {
    if (!deal || !motivoPerda.trim()) return
    await updateDeal.mutateAsync({
      id: deal.id,
      status: 'perdido',
      motivo_perda: motivoPerda,
      data_fechamento: new Date().toISOString().split('T')[0],
    } as Parameters<typeof updateDeal.mutateAsync>[0])
    setPerdaOpen(false)
    setMotivoPerda('')
  }

  async function handleDelete() {
    if (!deal) return
    await deleteDeal.mutateAsync(deal.id)
    router.push('/deals')
  }

  async function handleProbabilidade(prob: string) {
    if (!deal) return
    await updateDeal.mutateAsync({ id: deal.id, probabilidade: Number(prob) })
  }

  async function handleAddActivity(e: React.FormEvent) {
    e.preventDefault()
    if (!activityDesc.trim() || !deal) return
    await createActivity.mutateAsync({
      lead_id: deal.lead_id ?? '',
      deal_id: deal.id,
      tipo: activityType,
      descricao: activityDesc,
      autor: 'Bryan',
    })
    setActivityDesc('')
  }

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-10 w-48" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!deal) {
    return (
      <PageTransition>
        <div className="text-center py-20">
          <p className="text-text-secondary">Deal não encontrado</p>
          <Link href="/deals">
            <Button variant="ghost" className="mt-4">Voltar aos Deals</Button>
          </Link>
        </div>
      </PageTransition>
    )
  }

  const statusColor = STATUS_COLORS[deal.status] ?? '#94A3B8'

  return (
    <PageTransition>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/deals">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-text-primary">{deal.titulo}</h1>
                <span
                  className="text-xs font-semibold px-2.5 py-0.5 rounded-md"
                  style={{ color: statusColor, background: `${statusColor}20` }}
                >
                  {STATUS_LABELS[deal.status] ?? deal.status}
                </span>
              </div>
              <p className="text-lg font-bold text-brand-cyan">{formatCurrency(deal.valor)}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setDeleteConfirm(true)}>
            <Trash2 className="h-4 w-4 text-status-negative" />
          </Button>
        </div>

        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-3 space-y-6">
            {/* Deal Info */}
            <StaggerItem>
              <div className="card-glass">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Informações do Deal</h2>
                <div className="grid grid-cols-2 gap-4">
                  <InfoRow label="Valor">{formatCurrency(deal.valor)}</InfoRow>
                  <InfoRow label="MRR">{deal.mrr > 0 ? formatCurrency(deal.mrr) : '-'}</InfoRow>
                  <InfoRow label="Tipo Serviço">
                    {deal.tipo_servico ? TIPO_SERVICO_LABELS[deal.tipo_servico] ?? deal.tipo_servico : '-'}
                  </InfoRow>
                  <InfoRow label="Probabilidade">
                    <span className="text-sm font-medium text-brand-cyan">{deal.probabilidade}%</span>
                  </InfoRow>
                  <InfoRow label="Previsão Fechamento">
                    {deal.data_previsao_fechamento ? formatDate(deal.data_previsao_fechamento) : '-'}
                  </InfoRow>
                  <InfoRow label="Data Fechamento">
                    {deal.data_fechamento ? formatDate(deal.data_fechamento) : '-'}
                  </InfoRow>
                  <InfoRow label="Criado em">{formatDate(deal.created_at)}</InfoRow>
                  {deal.motivo_perda && (
                    <InfoRow label="Motivo da Perda">
                      <span className="text-sm text-status-negative">{deal.motivo_perda}</span>
                    </InfoRow>
                  )}
                </div>
                {deal.notas && (
                  <>
                    <Separator className="my-4" />
                    <div>
                      <p className="text-xs text-text-secondary mb-1">Notas</p>
                      <p className="text-sm text-text-primary whitespace-pre-wrap">{deal.notas}</p>
                    </div>
                  </>
                )}
              </div>
            </StaggerItem>

            {/* Lead Card */}
            {lead && (
              <StaggerItem>
                <div className="card-glass">
                  <h2 className="text-lg font-semibold text-text-primary mb-4">Lead Vinculado</h2>
                  <Link href={`/leads/${lead.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-bg-navy/50 hover:bg-bg-navy transition-colors">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{lead.nome}</p>
                        <p className="text-xs text-text-secondary">{lead.empresa ?? 'Sem empresa'}</p>
                      </div>
                      <span className="text-sm text-brand-cyan">{formatCurrency(lead.valor_estimado)}</span>
                    </div>
                  </Link>
                </div>
              </StaggerItem>
            )}

            {/* Activity Timeline */}
            <StaggerItem>
              <div className="card-glass">
                <h2 className="text-lg font-semibold text-text-primary mb-4">Timeline</h2>
                {!activities || activities.length === 0 ? (
                  <p className="text-sm text-text-secondary text-center py-6">
                    Nenhuma atividade registrada
                  </p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => {
                      const Icon = ACTIVITY_ICONS[activity.tipo] ?? FileText
                      return (
                        <div key={activity.id} className="flex gap-3">
                          <div className="p-1.5 rounded-md bg-brand-blue-deep/30 h-fit">
                            <Icon className="h-3.5 w-3.5 text-brand-cyan" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-medium text-text-primary">
                                {ATIVIDADE_LABELS[activity.tipo as AtividadeTipo] ?? activity.tipo}
                              </span>
                              <span className="text-xs text-text-dark">
                                {formatTimeAgo(activity.data)}
                              </span>
                            </div>
                            <p className="text-sm text-text-secondary mt-0.5">{activity.descricao}</p>
                            <p className="text-xs text-text-dark mt-0.5">por {activity.autor}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </StaggerItem>
          </div>

          {/* Right Column - Actions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            {deal.status === 'aberto' && (
              <StaggerItem>
                <div className="card-glass space-y-3">
                  <h2 className="text-lg font-semibold text-text-primary">Ações</h2>

                  <Button
                    className="w-full bg-status-positive/10 text-status-positive hover:bg-status-positive/20"
                    onClick={handleGanho}
                    disabled={updateDeal.isPending}
                  >
                    {updateDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    Marcar como Ganho
                  </Button>

                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={() => setPerdaOpen(true)}
                  >
                    <XCircle className="h-4 w-4" />
                    Marcar como Perdido
                  </Button>

                  <Separator />

                  <div>
                    <p className="text-xs text-text-secondary mb-1.5">Probabilidade</p>
                    <Select value={String(deal.probabilidade)} onValueChange={handleProbabilidade}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10, 25, 50, 75, 90, 100].map((p) => (
                          <SelectItem key={p} value={String(p)}>{p}%</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </StaggerItem>
            )}

            {/* Add Activity */}
            <StaggerItem>
              <div className="card-glass">
                <h2 className="text-lg font-semibold text-text-primary mb-3">Registrar Atividade</h2>
                <form onSubmit={handleAddActivity} className="space-y-3">
                  <Select value={activityType} onValueChange={(v) => setActivityType(v as AtividadeTipo)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.entries(ATIVIDADE_LABELS) as Array<[AtividadeTipo, string]>)
                        .filter(([k]) => k !== 'sistema')
                        .map(([val, label]) => (
                          <SelectItem key={val} value={val}>{label}</SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Descreva a atividade..."
                    value={activityDesc}
                    onChange={(e) => setActivityDesc(e.target.value)}
                  />
                  <Button
                    type="submit"
                    size="sm"
                    className="w-full"
                    disabled={!activityDesc.trim() || createActivity.isPending}
                  >
                    {createActivity.isPending && <Loader2 className="h-3 w-3 animate-spin" />}
                    Registrar
                  </Button>
                </form>
              </div>
            </StaggerItem>
          </div>
        </StaggerContainer>
      </div>

      {/* Perda Dialog */}
      <Dialog open={perdaOpen} onOpenChange={setPerdaOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Motivo da Perda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <textarea
              placeholder="Por que este deal foi perdido?"
              value={motivoPerda}
              onChange={(e) => setMotivoPerda(e.target.value)}
              rows={3}
              className="flex w-full rounded-[10px] bg-bg-input px-3 py-2 text-sm text-text-primary placeholder:text-text-dark focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-colors resize-none"
              style={{ border: '1.5px solid #153B5F' }}
            />
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setPerdaOpen(false)}>Cancelar</Button>
              <Button
                variant="destructive"
                onClick={handlePerda}
                disabled={!motivoPerda.trim() || updateDeal.isPending}
              >
                {updateDeal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar Perda
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteConfirm} onOpenChange={setDeleteConfirm}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir Deal</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-text-secondary">
            Tem certeza que deseja excluir <strong className="text-text-primary">{deal.titulo}</strong>?
          </p>
          <div className="flex gap-2 justify-end mt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirm(false)}>Cancelar</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteDeal.isPending}
            >
              {deleteDeal.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  )
}

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-text-secondary mb-0.5">{label}</p>
      <div>{children}</div>
    </div>
  )
}
