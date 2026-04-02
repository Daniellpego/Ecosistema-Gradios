import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { QueryProvider } from '@/providers/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gradios — CTO Panel',
  description: 'Gestao de projetos e operacoes — Gradios',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A1628',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link rel="preconnect" href="https://urpuiznydrlwmaqhdids.supabase.co" />
        <link rel="dns-prefetch" href="https://urpuiznydrlwmaqhdids.supabase.co" />
      </head>
      <body>
        <QueryProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster
              theme="dark"
              position="bottom-right"
              toastOptions={{
                style: {
                  background: '#131F35',
                  border: '1px solid rgba(21,59,95,0.4)',
                  color: '#F0F4F8',
                  fontSize: '13px',
                },
              }}
            />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
