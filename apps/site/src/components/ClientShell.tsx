"use client";

import dynamic from "next/dynamic";

// Non-critical UX enhancements — lazy load to reduce initial JS bundle
// In Next.js 15, `ssr: false` with `next/dynamic` must be in a Client Component
const ScrollProgress = dynamic(
  () => import("@/components/ScrollProgress").then((m) => m.ScrollProgress),
  { ssr: false }
);
const SmoothScrollProvider = dynamic(
  () =>
    import("@/providers/smooth-scroll").then((m) => m.SmoothScrollProvider),
  { ssr: false }
);
const WhatsAppFloat = dynamic(
  () => import("@/components/WhatsAppFloat").then((m) => m.WhatsAppFloat),
  { ssr: false }
);
const StickyCtaBar = dynamic(
  () => import("@/components/StickyCtaBar").then((m) => m.StickyCtaBar),
  { ssr: false }
);
const CookieBanner = dynamic(
  () => import("@/components/CookieBanner").then((m) => m.CookieBanner),
  { ssr: false }
);

export function ClientShell({ children }: { children: React.ReactNode }) {
  return (
    <SmoothScrollProvider>
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-bold"
      >
        Pular para o conteudo principal
      </a>
      <ScrollProgress />
      <StickyCtaBar />
      {children}
      <WhatsAppFloat />
      <CookieBanner />
    </SmoothScrollProvider>
  );
}
