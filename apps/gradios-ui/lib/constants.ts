export const JARVIS_URL =
  process.env.NEXT_PUBLIC_JARVIS_URL ?? "http://localhost:8001";

export const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://urpuiznydrlwmaqhdids.supabase.co";

export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ?? "";

export interface Agent {
  slug: string;
  label: string;
  desc: string;
  emoji: string;
  color: string;
  bgColor: string;
}

export const AGENTS: Agent[] = [
  { slug: "manufatura", label: "Manufatura", desc: "ROI industrial",        emoji: "\u{1F3ED}", color: "text-orange-400", bgColor: "bg-orange-500/10" },
  { slug: "fiscal",     label: "Fiscal",     desc: "ICMS/CFOP 2026",       emoji: "\u{1F4CA}", color: "text-emerald-400", bgColor: "bg-emerald-500/10" },
  { slug: "copy",       label: "Copy",       desc: "Textos que vendem",    emoji: "\u{270D}\u{FE0F}",  color: "text-pink-400", bgColor: "bg-pink-500/10" },
  { slug: "dev",        label: "Dev",        desc: "Next.js + Supabase",   emoji: "\u{1F4BB}", color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
  { slug: "ads",        label: "Ads",        desc: "ROAS 5x+",            emoji: "\u{1F4E2}", color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  { slug: "brand",      label: "Brand",      desc: "Identidade premium",   emoji: "\u{1F3A8}", color: "text-purple-400", bgColor: "bg-purple-500/10" },
  { slug: "cfo",        label: "CFO",        desc: "Dashboard financeiro", emoji: "\u{1F4B0}", color: "text-green-400", bgColor: "bg-green-500/10" },
  { slug: "crm",        label: "CRM",        desc: "Pipeline clientes",   emoji: "\u{1F91D}", color: "text-blue-400", bgColor: "bg-blue-500/10" },
];

export const AGENT_MAP = Object.fromEntries(AGENTS.map((a) => [a.slug, a]));

export interface NavItem {
  href: string;
  label: string;
  icon: string;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/",         label: "Painel",   icon: "LayoutDashboard" },
  { href: "/agents",   label: "Agents",   icon: "Bot" },
  { href: "/estudos",  label: "Estudos",  icon: "FileText" },
  { href: "/alertas",  label: "Alertas",  icon: "Bell" },
];
