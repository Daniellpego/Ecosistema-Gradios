import { Skeleton } from '@/components/ui/skeleton'

export default function Loading() {
  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40" />
          <Skeleton className="h-4 w-56" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Skeleton className="h-9 flex-1 sm:max-w-xs" />
        <Skeleton className="h-9 w-full sm:w-40" />
      </div>

      {/* Kanban 4 colunas x 3 cards */}
      <div className="flex gap-3 sm:gap-4 overflow-x-auto pb-4 -mx-4 px-4 sm:mx-0 sm:px-0 snap-x snap-mandatory sm:snap-none">
        {Array.from({ length: 4 }).map((_, col) => (
          <div
            key={col}
            className="flex-shrink-0 w-[85vw] sm:w-auto sm:flex-1 min-w-0 space-y-3 snap-start"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-6 rounded-full" />
            </div>
            <Skeleton className="h-px w-full" />
            {Array.from({ length: 3 }).map((_, card) => (
              <div key={card} className="card-glass p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                <div className="flex items-center gap-2 pt-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-5 rounded-full ml-auto" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
