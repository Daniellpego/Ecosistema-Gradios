"use client";

import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { trackWhatsAppClick } from "@/lib/meta-pixel";

export function WhatsAppFab() {
  const pathname = usePathname();

  // Esconder WhatsApp no funil do diagnóstico para não sobrepor CTAs
  if (pathname === "/diagnostico") return null;

  return (
    <motion.a
      href="https://wa.me/5543988372540"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      onClick={() => trackWhatsAppClick(pathname || "unknown")}
      className="fixed bottom-6 right-6 z-50 group"
      initial={{ opacity: 0, y: 12, scale: 0.75 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: "spring", stiffness: 100, damping: 15, delay: 2 }}
    >
      {/* Desktop: glass bar + integrated icon — Mobile: circle only */}
      <div className="flex items-center animate-wpp-breath rounded-full sm:rounded-full group-hover:scale-105 transition-transform duration-300">
        {/* Unified glass container — desktop */}
        <div className="hidden sm:flex items-center gap-3 bg-[#0f172a]/80 backdrop-blur-xl rounded-full pl-5 pr-1.5 py-1.5 border border-white/[0.08] shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
          <span className="text-white text-sm font-semibold whitespace-nowrap">Fale com a gente</span>
          <div className="w-10 h-10 bg-[#25D366] rounded-full flex items-center justify-center flex-shrink-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_2px_8px_rgba(37,211,102,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.27z" />
            </svg>
          </div>
        </div>

        {/* Mobile: circle only */}
        <div className="sm:hidden w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_16px_rgba(37,211,102,0.4)]">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-7 h-7 text-white" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.78.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.4 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.1-.23-.16-.48-.27z" />
          </svg>
        </div>
      </div>
    </motion.a>
  );
}
