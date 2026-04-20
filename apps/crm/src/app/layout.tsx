import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Poppins } from 'next/font/google'
import { QueryProvider } from '@/providers/query-provider'
import { TooltipProvider } from '@/components/ui/tooltip'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
  adjustFontFallback: true,
})

export const metadata: Metadata = {
  title: 'Gradios — CRM',
  description: 'Painel comercial e gestão de leads — Gradios',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#FFFFFF',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={poppins.variable}>
      <body className="font-sans">
        <QueryProvider>
          <TooltipProvider delayDuration={200}>{children}</TooltipProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
