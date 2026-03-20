import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center">
      <p className="text-6xl font-bold text-zinc-800 mb-4">404</p>
      <h2 className="text-lg font-semibold text-white mb-2">Pagina nao encontrada</h2>
      <p className="text-sm text-zinc-500 mb-6">A rota solicitada nao existe.</p>
      <Link
        href="/"
        className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm text-white transition-colors"
      >
        Voltar ao painel
      </Link>
    </div>
  );
}
