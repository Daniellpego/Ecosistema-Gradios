'use client'

import { AlertTriangle, RefreshCw, WifiOff, ShieldAlert } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { cn } from '@/lib/utils'

interface ErrorStateProps {
  message: string
  className?: string
  /** Optional: pass query keys to retry specific queries */
  retryKeys?: string[][]
}

function diagnoseError(message: string): { icon: React.ElementType; hint: string } {
  const lower = message.toLowerCase()
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('conexao')) {
    return { icon: WifiOff, hint: 'Verifique sua conexao com a internet' }
  }
  if (lower.includes('auth') || lower.includes('401') || lower.includes('permission')) {
    return { icon: ShieldAlert, hint: 'Sessao expirada — tente fazer login novamente' }
  }
  return { icon: AlertTriangle, hint: message }
}

export function ErrorState({ message, className, retryKeys }: ErrorStateProps) {
  const queryClient = useQueryClient()
  const { icon: Icon, hint } = diagnoseError(message)

  function handleRetry() {
    if (retryKeys && retryKeys.length > 0) {
      retryKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }))
    } else {
      queryClient.invalidateQueries()
    }
  }

  return (
    <div className={cn('card-glass flex flex-col items-center justify-center py-16 text-center', className)}>
      <div
        className="h-14 w-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}
      >
        <Icon className="h-6 w-6 text-status-negative" />
      </div>
      <h3 className="text-sm font-semibold text-text-primary mb-1">Falha ao carregar</h3>
      <p className="text-sm text-text-muted max-w-sm mb-5">{hint}</p>
      <button
        onClick={handleRetry}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-brand-cyan transition-all hover:bg-brand-cyan/10 active:scale-95"
        style={{ border: '1px solid rgba(0,200,240,0.25)' }}
      >
        <RefreshCw className="h-4 w-4" />
        Tentar novamente
      </button>
    </div>
  )
}
