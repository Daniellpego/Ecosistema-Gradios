import type { ReactNode } from 'react'
import AuthenticatedLayoutClient from './layout-client'

export const dynamic = 'force-dynamic'

export default function AuthenticatedLayout({ children }: { children: ReactNode }) {
  return <AuthenticatedLayoutClient>{children}</AuthenticatedLayoutClient>
}
