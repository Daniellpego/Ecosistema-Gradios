'use client'

export const dynamic = 'force-dynamic'

import { PageTransition } from '@/components/motion'
import { Skeleton } from '@/components/ui/skeleton'

export default function DealsPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Deals</h1>
            <p className="text-sm text-text-secondary mt-1">Negociações abertas e fechadas</p>
          </div>
        </div>

        <Skeleton className="h-96" />
      </div>
    </PageTransition>
  )
}
