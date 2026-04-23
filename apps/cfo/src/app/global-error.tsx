'use client'

// Fallback de ultimo recurso: e invocado quando o proprio root layout falha
// (erro em provider, hydration, etc). Por isso precisa renderizar <html><body>
// completos e nao pode depender do CSS global / fontes. Estilo inline, neutro.

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily:
            'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
          background: '#F8FAFC',
          color: '#0F172A',
        }}
      >
        <div style={{ maxWidth: 420, width: '100%', textAlign: 'center' }}>
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: '0 0 8px' }}>
            Algo deu errado
          </h1>
          <p
            style={{
              fontSize: 14,
              color: '#64748B',
              margin: '0 0 24px',
              lineHeight: 1.5,
            }}
          >
            Ocorreu um erro inesperado ao carregar o painel. Tente novamente.
          </p>
          <button
            onClick={() => reset()}
            style={{
              background: '#00C8F0',
              color: '#0A1628',
              border: 0,
              padding: '10px 20px',
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Tentar novamente
          </button>
          {error.digest && (
            <p
              style={{
                marginTop: 20,
                fontSize: 11,
                color: '#94A3B8',
                fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              }}
            >
              ref: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
