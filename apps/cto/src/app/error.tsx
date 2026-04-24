'use client'

// Root error boundary: captura erros fora do grupo (authenticated),
// como falhas no login ou no proprio root layout.

import { useEffect } from 'react'
import { AlertCircle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[CTO Root Error]', error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-navy">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-status-negative/10 flex items-center justify-center">
            <AlertCircle className="h-7 w-7 text-status-negative" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Algo deu errado
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          Ocorreu um erro inesperado. Tente novamente ou volte ao inicio.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-cyan/80 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </button>
          <Link
            href="/"
            className="flex items-center justify-center gap-2 rounded-lg border border-brand-blue-deep px-4 py-2.5 text-sm font-medium text-text-secondary hover:text-text-primary hover:border-brand-blue transition-colors"
          >
            <Home className="h-4 w-4" />
            Voltar ao inicio
          </Link>
        </div>
        {error.digest && (
          <p className="mt-6 text-[11px] font-mono text-text-secondary/70">
            ref: {error.digest}
          </p>
        )}
      </div>
    </div>
  )
}
