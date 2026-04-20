import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { QueryProvider } from '@/providers/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster } from 'sonner'
import './globals.css'

export const metadata: Metadata = {
  title: 'Gradios — CTO Panel',
  description: 'Gestão de projetos e operações — Gradios',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Gradios CTO',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#f7f9fb',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://urpuiznydrlwmaqhdids.supabase.co" />
      </head>
      <body>
        <QueryProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster theme="light" position="top-center" toastOptions={{ style: { background: '#FFFFFF', border: '1px solid rgba(0,191,255,0.15)', color: '#0F172A', fontSize: '13px', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)' } }} />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
