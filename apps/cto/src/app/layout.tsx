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
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0A1628',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="apple-touch-startup-image" href="/splash-1170x2532.png" media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1284x2778.png" media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
        <link rel="apple-touch-startup-image" href="/splash-828x1792.png" media="(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" />
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
              position="top-center"
              toastOptions={{
                style: {
                  background: '#131F35',
                  border: '1px solid rgba(0,200,240,0.15)',
                  color: '#F0F4F8',
                  fontSize: '13px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                },
              }}
            />
          </TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
