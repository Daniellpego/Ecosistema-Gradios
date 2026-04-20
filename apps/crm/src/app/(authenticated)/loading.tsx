import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-full sm:w-36" />
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card-glass p-3 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-9 flex-1" />
        <Skeleton className="h-9 w-full sm:w-40" />
        <Skeleton className="h-9 w-full sm:w-40" />
      </div>

      {/* Tabela de leads/deals */}
      <div className="card-glass overflow-hidden">
        <div className="hidden sm:grid grid-cols-6 gap-4 px-4 py-3 border-b border-white/5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-full" />
          ))}
        </div>
        <div className="divide-y divide-white/5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="grid grid-cols-2 sm:grid-cols-6 gap-4 px-4 py-4">
              <Skeleton className="h-4 w-full sm:col-span-2" />
              <Skeleton className="h-4 w-3/4 hidden sm:block" />
              <Skeleton className="h-4 w-2/3 hidden sm:block" />
              <Skeleton className="h-4 w-1/2 hidden sm:block" />
              <Skeleton className="h-6 w-20 rounded-full justify-self-end" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
