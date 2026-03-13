'use client'

export const dynamic = 'force-dynamic'

import { PageTransition } from '@/components/motion'
import { Skeleton } from '@/components/ui/skeleton'

export default function DealDetailPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    </PageTransition>
  )
}
