'use client'

// Error boundary de segmento: captura falhas em qualquer page.tsx
// autenticada (dashboard, receitas, etc) sem derrubar a app toda. O root
// layout e os providers continuam montados; reset() re-renderiza so o
// segmento com o erro.

import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthenticatedError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md card-glass text-center">
        <div className="flex justify-center mb-3">
          <div className="h-10 w-10 rounded-full bg-status-negative/10 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-status-negative" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-text-primary mb-1">
          Nao foi possivel carregar esta secao
        </h2>
        <p className="text-sm text-text-secondary mb-5">
          Ocorreu um erro inesperado. Voce pode tentar novamente sem sair do painel.
        </p>
        <Button onClick={() => reset()} className="w-full">
          Tentar novamente
        </Button>
        {error.digest && (
          <p className="mt-4 text-[11px] font-mono text-text-secondary/70">
            ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
