'use client'

import Image from 'next/image'

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <Image
        src="/logo-64.png"
        alt="Gradios"
        width={32}
        height={32}
        className="rounded-lg shrink-0"
        priority
      />
      {!collapsed && (
        <div className="flex flex-col">
          <span className="text-sm font-bold text-text-primary leading-tight">Gradios</span>
          <span className="text-[10px] font-medium text-brand-cyan leading-tight">CTO Panel</span>
        </div>
      )}
    </div>
  )
}
