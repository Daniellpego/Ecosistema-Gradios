'use client'

import { useEffect } from 'react'

export function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | Gradios CRM`
  }, [title])
  return null
}
