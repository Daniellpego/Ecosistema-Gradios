'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  RefreshCw,
  Target,
  FileText,
  Trash2,
  CheckCircle2,
  XCircle,
  Clock,
  Phone,
  Mail,
  MessageCircle,
  Users,
  FileCheck,
  Settings,
} from 'lucide-react'
import { PageTransition } from '@/components/motion'
import { PageTitle } from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useDealById, useUpdateDeal, useDeleteDeal, useDealActivities } from '@/hooks/use-deals'
import { useLeadById, useCreateActivity } from '@/hooks/use-leads'
import { useToast } from '@/components/toast-provider'
import { formatCurrency, formatDate, formatTimeAgo } from '@/lib/format'
import type { DealStatus, TipoServico, AtividadeTipo } from '@/types/database'

const STATUS_LABELS: Record<DealStatus, string> = {
  aberto: 'Aberto',
  ganho: 'Ganho',
  perdido: 'Perdido',
}

const STATUS_BADGE_CLASSES: Record<DealStatus, string> = {
  aberto: 'bg-[#00C8F0]/15 text-[#00C8F0] border-[#00C8F0]/30',
  ganho: 'bg-[#10B981]/15 text-[#10B981] border-[#10B981]/30',
  perdido: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/30',
}

const TIPO_SERVICO_LABELS: Record<TipoServico, string> = {
  setup: 'Setup',
  mensalidade: 'Mensalidade',
  projeto_avulso: 'Projeto Avulso',
  consultoria: 'Consultoria',
  mvp: 'MVP',
}

const ATIVIDADE_TIPO_LABELS: Record<AtividadeTipo, string> = {
  nota: 'Nota',
  ligacao: 'Ligação',
  whatsapp: 'WhatsApp',
  email: 'Email',
  reuniao: 'Reunião',
  proposta_enviada: 'Proposta Enviada',
  followup: 'Follow-up',
  sistema: 'Sistema',
}

const ATIVIDADE_ICONS: Record<AtividadeTipo, typeof FileText> = {
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
  const dealId = params.id as string

  const { data: deal, isLoading: dealLoading } = useDealById(dealId)
  const { data: lead, isLoading: leadLoading } = useLeadById(deal?.lead_id ?? '')
  const { data: activities, isLoading: activitiesLoading } = useDealActivities(dealId)
  const updateDeal = useUpdateDeal()
  const deleteDeal = useDeleteDeal()
  const createActivity = useCreateActivity()

  const { addToast } = useToast()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [perdidoDialogOpen, setPerdidoDialogOpen] = useState(false)
  const [motivoPerda, setMotivoPerda] = useState('')
  const [probabilidade, setProbabilidade] = useState<number | null>(null)

  // Activity form state
  const [activityTipo, setActivityTipo] = useState<AtividadeTipo>('nota')
  const [activityDescricao, setActivityDescricao] = useState('')
  const [activitySubmitting, setActivitySubmitting] = useState(false)

  function handleMarkGanho() {
    if (!deal) return
    updateDeal.mutate(
      {
        id: deal.id,
        status: 'ganho' as DealStatus,
        probabilidade: 100,
        data_previsao_fechamento: new Date().toISOString().split('T')[0],
      },
      { onSuccess: () => addToast('Deal marcado como Ganho!', 'success') }
    )
  }

  function handleMarkPerdido() {
    if (!deal || !motivoPerda.trim()) return
    updateDeal.mutate(
      {
        id: deal.id,
        status: 'perdido' as DealStatus,
        probabilidade: 0,
      },
      {
        onSuccess: () => {
          setPerdidoDialogOpen(false)
          setMotivoPerda('')
          addToast('Deal marcado como Perdido.', 'warning')
        },
      }
    )
  }

  function handleUpdateProbabilidade() {
    if (!deal || probabilidade === null) return
    updateDeal.mutate(
      { id: deal.id, probabilidade },
      { onSuccess: () => addToast('Probabilidade atualizada.', 'info') }
    )
  }

  function handleDelete() {
    if (!deal) return
    deleteDeal.mutate(deal.id, {
      onSuccess: () => {
        addToast('Deal excluído.', 'info')
        router.push('/deals')
      },
    })
  }

  function handleSubmitActivity(e: React.FormEvent) {
    e.preventDefault()
    if (!deal || !activityDescricao.trim()) return

    setActivitySubmitting(true)
    createActivity.mutate(
      {
        lead_id: deal.lead_id ?? dealId,
        deal_id: dealId,
        tipo: activityTipo,
        descricao: activityDescricao.trim(),
        autor: 'Usuario',
      },
      {
        onSuccess: () => {
          setActivityDescricao('')
          setActivityTipo('nota')
          setActivitySubmitting(false)
          addToast('Atividade registrada.', 'success')
        },
        onError: () => {
          setActivitySubmitting(false)
        },
      }
    )
  }

  if (dealLoading) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-6">
              <Skeleton className="h-64" />
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
            <div className="lg:col-span-2 space-y-6">
              <Skeleton className="h-48" />
              <Skeleton className="h-64" />
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (!deal) {
    return (
      <PageTransition>
        <div className="space-y-6">
          <Button variant="ghost" onClick={() => router.push('/deals')} className="text-text-secondary hover:text-text-primary">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div className="card-glass text-center py-12">
            <p className="text-text-secondary">Deal não encontrado.</p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <PageTitle title="Detalhes do Deal" />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => router.push('/deals')} className="text-text-secondary hover:text-text-primary">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-text-primary">{deal.titulo}</h1>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border ${STATUS_BADGE_CLASSES[deal.status]}`}>
                  {STATUS_LABELS[deal.status]}
                </span>
              </div>
              <p className="text-lg text-brand-cyan font-semibold mt-1">{formatCurrency(deal.valor)}</p>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column - 3/5 */}
          <div className="lg:col-span-3 space-y-6">
            {/* Deal Info Card */}
            <div className="card-glass space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Informações do Deal</h2>
              <Separator className="bg-brand-blue-deep/30" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoField icon={DollarSign} label="Valor" value={formatCurrency(deal.valor)} />
                <InfoField icon={RefreshCw} label="MRR" value={formatCurrency(deal.mrr)} />
                <InfoField icon={Target} label="Probabilidade" value={`${deal.probabilidade}%`} />
                <InfoField
                  icon={FileText}
                  label="Tipo de Serviço"
                  value={deal.tipo_servico ? TIPO_SERVICO_LABELS[deal.tipo_servico] : '-'}
                />
                <InfoField
                  icon={Calendar}
                  label="Previsão de Fechamento"
                  value={deal.data_previsao_fechamento ? formatDate(deal.data_previsao_fechamento) : '-'}
                />
                <InfoField
                  icon={Calendar}
                  label="Data de Fechamento"
                  value={deal.data_fechamento ? formatDate(deal.data_fechamento) : '-'}
                />
                <InfoField icon={Clock} label="Criado" value={formatDate(deal.created_at)} />
                <InfoField icon={Clock} label="Atualizado" value={formatTimeAgo(deal.updated_at)} />
              </div>
              {deal.categoria && (
                <>
                  <Separator className="bg-brand-blue-deep/30" />
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Categoria</p>
                    <p className="text-sm text-text-primary">{deal.categoria}</p>
                  </div>
                </>
              )}
              {deal.notas && (
                <>
                  <Separator className="bg-brand-blue-deep/30" />
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Notas</p>
                    <p className="text-sm text-text-primary whitespace-pre-wrap">{deal.notas}</p>
                  </div>
                </>
              )}
              {deal.motivo_perda && (
                <>
                  <Separator className="bg-brand-blue-deep/30" />
                  <div>
                    <p className="text-xs text-text-secondary mb-1">Motivo da Perda</p>
                    <p className="text-sm text-status-negative">{deal.motivo_perda}</p>
                  </div>
                </>
              )}
            </div>

            {/* Lead Info Card */}
            {deal.lead_id && (
              <div className="card-glass space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-text-primary">Lead Associado</h2>
                  {lead && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => router.push(`/leads/${lead.id}`)}
                      className="text-brand-cyan hover:text-brand-cyan/80"
                    >
                      Ver Lead
                    </Button>
                  )}
                </div>
                <Separator className="bg-brand-blue-deep/30" />
                {leadLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                ) : lead ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-text-secondary">Nome</p>
                      <p className="text-sm text-text-primary font-medium">{lead.nome}</p>
                    </div>
                    {lead.empresa && (
                      <div>
                        <p className="text-xs text-text-secondary">Empresa</p>
                        <p className="text-sm text-text-primary">{lead.empresa}</p>
                      </div>
                    )}
                    {lead.email && (
                      <div>
                        <p className="text-xs text-text-secondary">Email</p>
                        <p className="text-sm text-text-primary">{lead.email}</p>
                      </div>
                    )}
                    {lead.telefone && (
                      <div>
                        <p className="text-xs text-text-secondary">Telefone</p>
                        <p className="text-sm text-text-primary">{lead.telefone}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-xs text-text-secondary">Status</p>
                      <p className="text-sm text-text-primary capitalize">{lead.status}</p>
                    </div>
                    <div>
                      <p className="text-xs text-text-secondary">Temperatura</p>
                      <p className="text-sm text-text-primary capitalize">{lead.temperatura}</p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-text-secondary">Lead não encontrado.</p>
                )}
              </div>
            )}

            {/* Activity Timeline */}
            <div className="card-glass space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Timeline de Atividades</h2>
              <Separator className="bg-brand-blue-deep/30" />
              {activitiesLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : !activities || activities.length === 0 ? (
                <p className="text-sm text-text-secondary py-4 text-center">Nenhuma atividade registrada.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => {
                    const tipo = activity.tipo as AtividadeTipo
                    const IconComponent = ATIVIDADE_ICONS[tipo] ?? FileText
                    return (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-brand-blue-deep/30 shrink-0">
                          <IconComponent className="h-4 w-4 text-brand-cyan" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-medium text-brand-cyan">
                              {ATIVIDADE_TIPO_LABELS[tipo] ?? tipo}
                            </span>
                            <span className="text-xs text-text-secondary">
                              {formatTimeAgo(activity.data)}
                            </span>
                            <span className="text-xs text-text-secondary">
                              por {activity.autor}
                            </span>
                          </div>
                          <p className="text-sm text-text-primary mt-1">{activity.descricao}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - 2/5 */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <div className="card-glass space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Ações</h2>
              <Separator className="bg-brand-blue-deep/30" />

              {deal.status === 'aberto' && (
                <div className="space-y-3">
                  <Button
                    className="w-full bg-[#10B981] hover:bg-[#10B981]/80 text-white"
                    onClick={handleMarkGanho}
                    disabled={updateDeal.isPending}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Marcar como Ganho
                  </Button>
                  <Button
                    className="w-full bg-[#EF4444] hover:bg-[#EF4444]/80 text-white"
                    onClick={() => setPerdidoDialogOpen(true)}
                    disabled={updateDeal.isPending}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Marcar como Perdido
                  </Button>
                </div>
              )}

              {deal.status !== 'aberto' && (
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => updateDeal.mutate({ id: deal.id, status: 'aberto' as DealStatus, probabilidade: 50 })}
                  disabled={updateDeal.isPending}
                >
                  Reabrir Deal
                </Button>
              )}

              <Separator className="bg-brand-blue-deep/30" />

              {/* Update Probability */}
              <div className="space-y-2">
                <Label htmlFor="prob_update">Atualizar Probabilidade</Label>
                <div className="flex gap-2">
                  <Input
                    id="prob_update"
                    type="number"
                    min="0"
                    max="100"
                    placeholder={String(deal.probabilidade)}
                    value={probabilidade ?? ''}
                    onChange={(e) => setProbabilidade(e.target.value ? Number(e.target.value) : null)}
                  />
                  <Button
                    size="sm"
                    onClick={handleUpdateProbabilidade}
                    disabled={probabilidade === null || updateDeal.isPending}
                  >
                    Salvar
                  </Button>
                </div>
              </div>

              <Separator className="bg-brand-blue-deep/30" />

              {/* Delete */}
              <Button
                variant="ghost"
                className="w-full text-status-negative hover:text-status-negative hover:bg-status-negative/10"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir Deal
              </Button>
            </div>

            {/* Activity Input Form */}
            <div className="card-glass space-y-4">
              <h2 className="text-lg font-semibold text-text-primary">Registrar Atividade</h2>
              <Separator className="bg-brand-blue-deep/30" />
              <form onSubmit={handleSubmitActivity} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="activity_tipo">Tipo</Label>
                  <Select
                    value={activityTipo}
                    onValueChange={(v) => setActivityTipo(v as AtividadeTipo)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nota">Nota</SelectItem>
                      <SelectItem value="ligacao">Ligação</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="reuniao">Reunião</SelectItem>
                      <SelectItem value="proposta_enviada">Proposta Enviada</SelectItem>
                      <SelectItem value="followup">Follow-up</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="activity_desc">Descrição</Label>
                  <textarea
                    id="activity_desc"
                    rows={3}
                    value={activityDescricao}
                    onChange={(e) => setActivityDescricao(e.target.value)}
                    placeholder="Descreva a atividade..."
                    className="flex w-full rounded-lg border border-brand-blue-deep/30 bg-bg-navy px-3 py-2 text-sm text-text-primary placeholder:text-text-dark focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-colors resize-none"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={activitySubmitting || !activityDescricao.trim()}
                >
                  {activitySubmitting ? 'Registrando...' : 'Registrar Atividade'}
                </Button>
              </form>
            </div>
          </div>
        </div>

        {/* Perdido Dialog */}
        <Dialog open={perdidoDialogOpen} onOpenChange={setPerdidoDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Marcar como Perdido</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="motivo_perda">Motivo da perda *</Label>
                <textarea
                  id="motivo_perda"
                  rows={3}
                  value={motivoPerda}
                  onChange={(e) => setMotivoPerda(e.target.value)}
                  placeholder="Descreva o motivo da perda..."
                  className="flex w-full rounded-lg border border-brand-blue-deep/30 bg-bg-navy px-3 py-2 text-sm text-text-primary placeholder:text-text-dark focus:border-brand-cyan focus:outline-none focus:ring-1 focus:ring-brand-cyan/50 transition-colors resize-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setPerdidoDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#EF4444] hover:bg-[#EF4444]/80 text-white"
                  onClick={handleMarkPerdido}
                  disabled={!motivoPerda.trim() || updateDeal.isPending}
                >
                  {updateDeal.isPending ? 'Salvando...' : 'Confirmar Perda'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Excluir Deal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-text-secondary">
                Tem certeza que deseja excluir o deal <strong className="text-text-primary">{deal.titulo}</strong>? Esta ação não pode ser desfeita.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-[#EF4444] hover:bg-[#EF4444]/80 text-white"
                  onClick={handleDelete}
                  disabled={deleteDeal.isPending}
                >
                  {deleteDeal.isPending ? 'Excluindo...' : 'Excluir'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  )
}

function InfoField({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof DollarSign
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-3">
      <Icon className="h-4 w-4 text-text-secondary shrink-0" />
      <div>
        <p className="text-xs text-text-secondary">{label}</p>
        <p className="text-sm text-text-primary font-medium">{value}</p>
      </div>
    </div>
  )
}
