'use client'

import { useEffect } from 'react'

export function PageTitle({ title }: { title: string }) {
  useEffect(() => {
    document.title = `${title} | BG Tech CRM`
  }, [title])
  return null
}
