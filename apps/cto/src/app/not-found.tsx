import { FileQuestion, Home } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-navy">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="h-14 w-14 rounded-full bg-brand-cyan/10 flex items-center justify-center">
            <FileQuestion className="h-7 w-7 text-brand-cyan" aria-hidden="true" />
          </div>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Pagina nao encontrada
        </h2>
        <p className="text-sm text-text-secondary mb-6">
          A pagina que voce procura nao existe ou foi movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-cyan px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-cyan/80 transition-colors"
        >
          <Home className="h-4 w-4" />
          Voltar ao painel
        </Link>
      </div>
    </div>
  )
}
