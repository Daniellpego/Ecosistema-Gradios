'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { Settings, Users, Bell, Palette, Database } from 'lucide-react'
import { PageTransition, StaggerContainer, StaggerItem } from '@/components/motion'
import { PageTitle } from '@/components/page-title'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import { RESPONSAVEIS } from '@/types/database'

export default function ConfiguracoesPage() {
  const [notificacoes, setNotificacoes] = useState(true)
  const [notifQuiz, setNotifQuiz] = useState(true)
  const [notifFollowup, setNotifFollowup] = useState(true)

  return (
    <PageTransition>
      <PageTitle title="Configurações" />
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Configurações</h1>
          <p className="text-sm text-text-secondary mt-1">Configurações do CRM</p>
        </div>

        <StaggerContainer className="space-y-6">
          {/* Equipe */}
          <StaggerItem>
            <div className="card-glass">
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-5 w-5 text-brand-cyan" />
                <h2 className="text-lg font-semibold text-text-primary">Equipe</h2>
              </div>
              <div className="space-y-3">
                {RESPONSAVEIS.map((name) => (
                  <div key={name} className="flex items-center justify-between p-3 rounded-lg bg-bg-navy/50">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-brand-cyan/20 flex items-center justify-center">
                        <span className="text-sm font-bold text-brand-cyan">{name[0]}</span>
                      </div>
                      <span className="text-sm font-medium text-text-primary">{name}</span>
                    </div>
                    <span className="text-xs text-text-secondary">Ativo</span>
                  </div>
                ))}
              </div>
            </div>
          </StaggerItem>

          {/* Notificações */}
          <StaggerItem>
            <div className="card-glass">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="h-5 w-5 text-brand-cyan" />
                <h2 className="text-lg font-semibold text-text-primary">Notificações</h2>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Notificações ativas</p>
                    <p className="text-xs text-text-secondary">Receba alertas sobre novos leads e follow-ups</p>
                  </div>
                  <Switch checked={notificacoes} onCheckedChange={setNotificacoes} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Novos leads do Quiz</p>
                    <p className="text-xs text-text-secondary">Alerta quando um lead entra via quiz</p>
                  </div>
                  <Switch checked={notifQuiz} onCheckedChange={setNotifQuiz} disabled={!notificacoes} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-text-primary">Follow-ups pendentes</p>
                    <p className="text-xs text-text-secondary">Lembrete de follow-ups agendados</p>
                  </div>
                  <Switch checked={notifFollowup} onCheckedChange={setNotifFollowup} disabled={!notificacoes} />
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Info */}
          <StaggerItem>
            <div className="card-glass">
              <div className="flex items-center gap-2 mb-4">
                <Database className="h-5 w-5 text-brand-cyan" />
                <h2 className="text-lg font-semibold text-text-primary">Sistema</h2>
              </div>
              <div className="space-y-3">
                <InfoRow label="Versão" value="2.0.0" />
                <InfoRow label="Banco" value="Supabase (PostgreSQL)" />
                <InfoRow label="Projeto" value="urpuiznydrlwmaqhdids" />
                <InfoRow label="Auth" value="Supabase Auth SSR" />
                <InfoRow label="IA" value="Groq (llama-3.3-70b)" />
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </PageTransition>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between p-2">
      <span className="text-sm text-text-secondary">{label}</span>
      <span className="text-sm font-medium text-text-primary">{value}</span>
    </div>
  )
}
