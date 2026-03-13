'use client'

export const dynamic = 'force-dynamic'

import { PageTransition } from '@/components/motion'
import { Skeleton } from '@/components/ui/skeleton'

export default function LeadDetailPage() {
  return (
    <PageTransition>
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <div className="lg:col-span-2">
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
