"use client";

import { useState, useEffect, useCallback } from "react";
import { AGENTS, AGENT_MAP } from "@/lib/constants";
import type { Agent } from "@/lib/constants";
import { fetchHealth, supabaseSelect, supabaseCount } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { ChatModal } from "@/components/ChatModal";
import {
  Users,
  DollarSign,
  Bot,
  AlertTriangle,
  Activity,
  ArrowRight,
  RefreshCw,
  Wifi,
  WifiOff,
  Clock,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

interface KpiData {
  leadsHoje: number;
  totalLeads: number;
  leadsQuentes: number;
  agentsAtivos: number;
  alertasPendentes: number;
  estudosTotal: number;
}

interface FeedItem {
  id: string;
  tipo: "estudo" | "alerta" | "interacao";
  titulo: string;
  agent: string;
  timestamp: string;
  tags: string[];
}

interface SystemStatus {
  ollama: boolean;
  supabase: boolean;
  claude: boolean;
  evolution: boolean;
}

// ─── Quick Actions ──────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "Analisar pipeline", agent: "crm", prompt: "Analise o pipeline atual de vendas e sugira acoes para acelerar conversoes" },
  { label: "Gerar proposta",    agent: "copy", prompt: "Gere uma proposta comercial para um lead de automacao industrial" },
  { label: "Ver DRE",           agent: "cfo", prompt: "Gere um DRE resumido do mes atual com analise de margem" },
  { label: "Alertas CRM",       agent: "crm", prompt: "Liste todos os leads sem contato ha mais de 2 dias com acoes recomendadas" },
];

// ─── Main Component ─────────────────────────────────────────────────

export default function PainelPrincipal() {
  const [kpis, setKpis] = useState<KpiData>({
    leadsHoje: 0,
    totalLeads: 0,
    leadsQuentes: 0,
    agentsAtivos: 8,
    alertasPendentes: 0,
    estudosTotal: 0,
  });
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [status, setStatus] = useState<SystemStatus>({
    ollama: false,
    supabase: false,
    claude: false,
    evolution: false,
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);
  const [chatPrompt, setChatPrompt] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Health check
      const health = await fetchHealth().catch(() => ({
        ollama: false,
        supabase: false,
        claude: false,
        models: [],
        status: "error",
      }));

      // Evolution check
      let evoOk = false;
      try {
        const r = await fetch("http://localhost:8080", { signal: AbortSignal.timeout(3000) });
        evoOk = r.ok;
      } catch { /* offline */ }

      setStatus({
        ollama: health.ollama,
        supabase: health.supabase,
        claude: health.claude,
        evolution: evoOk,
      });

      // KPIs from Supabase
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      const hojeISO = hoje.toISOString();

      const [leadsHoje, totalLeads, leadsQuentes, alertas, estudos] = await Promise.all([
        supabaseCount("leads", { created_at: `gte.${hojeISO}` }),
        supabaseCount("leads"),
        supabaseCount("leads", { lead_temperature: "eq.quente" }),
        supabaseCount("jarvis_studies", { "tags": "cs.{alerta-crm}" }),
        supabaseCount("jarvis_studies"),
      ]);

      setKpis({
        leadsHoje,
        totalLeads,
        leadsQuentes,
        agentsAtivos: health.ollama ? 8 : 0,
        alertasPendentes: alertas,
        estudosTotal: estudos,
      });

      // Feed: ultimos estudos + alertas
      interface StudyRow {
        id: string;
        title: string;
        agent: string;
        tags: string[];
        status: string;
        created_at: string;
      }
      const recentStudies = await supabaseSelect<StudyRow>(
        "jarvis_studies",
        { select: "id,title,agent,tags,status,created_at", order: "created_at.desc", limit: "15" },
      );

      const feedItems: FeedItem[] = recentStudies.map((s) => ({
        id: s.id,
        tipo: (s.tags ?? []).includes("alerta-crm") ? "alerta" as const : "estudo" as const,
        titulo: s.title ?? "Sem titulo",
        agent: s.agent ?? "sistema",
        timestamp: s.created_at,
        tags: s.tags ?? [],
      }));

      setFeed(feedItems);
      setLastUpdate(new Date());
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 60000); // refresh a cada 60s
    return () => clearInterval(interval);
  }, [loadData]);

  function openChat(agentSlug: string, prompt?: string) {
    const agent = AGENT_MAP[agentSlug];
    if (agent) {
      setChatAgent(agent);
      setChatPrompt(prompt ?? "");
    }
  }

  function formatTime(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h`;
    return `${Math.floor(hrs / 24)}d`;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight">GRADIOS AIOX</h1>
            <p className="text-xs text-zinc-500 mt-0.5">Orquestrador Autonomo de Operacoes</p>
          </div>

          <div className="flex items-center gap-4">
            {/* System status dots */}
            <div className="hidden sm:flex items-center gap-3">
              <StatusDot label="Ollama" ok={status.ollama} />
              <StatusDot label="Supabase" ok={status.supabase} />
              <StatusDot label="WhatsApp" ok={status.evolution} />
            </div>

            <button
              onClick={loadData}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
              title="Atualizar dados"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <span className="text-[10px] text-zinc-600">
              {lastUpdate.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={<Users className="w-5 h-5" />}
            label="Leads hoje"
            value={kpis.leadsHoje}
            sub={`${kpis.totalLeads} total \u00B7 ${kpis.leadsQuentes} quentes`}
            color="text-blue-400"
            bgColor="bg-blue-500/10"
          />
          <KpiCard
            icon={<DollarSign className="w-5 h-5" />}
            label="Estudos gerados"
            value={kpis.estudosTotal}
            sub="analises e relatorios"
            color="text-green-400"
            bgColor="bg-green-500/10"
          />
          <KpiCard
            icon={<Bot className="w-5 h-5" />}
            label="Agents ativos"
            value={kpis.agentsAtivos}
            sub={kpis.agentsAtivos > 0 ? "todos online" : "offline"}
            color="text-indigo-400"
            bgColor="bg-indigo-500/10"
          />
          <KpiCard
            icon={<AlertTriangle className="w-5 h-5" />}
            label="Alertas CRM"
            value={kpis.alertasPendentes}
            sub="gerados automaticamente"
            color="text-amber-400"
            bgColor="bg-amber-500/10"
          />
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-medium text-zinc-400 mb-3">Acoes rapidas</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {QUICK_ACTIONS.map((action) => {
              const agent = AGENT_MAP[action.agent];
              return (
                <button
                  key={action.label}
                  onClick={() => openChat(action.agent, action.prompt)}
                  className="group flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/60 rounded-xl px-4 py-3 hover:border-indigo-500/30 hover:bg-zinc-800/40 transition-all text-left"
                >
                  <span className="text-lg">{agent?.emoji ?? "\u{1F916}"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-200 group-hover:text-white transition-colors">
                      {action.label}
                    </p>
                    <p className="text-[10px] text-zinc-600">{agent?.label}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-zinc-600 group-hover:text-indigo-400 transition-colors" />
                </button>
              );
            })}
          </div>
        </section>

        {/* Main grid: Feed + Agents */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <section className="lg:col-span-2">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-zinc-400">Atividade recente</h2>
              <Activity className="w-4 h-4 text-zinc-600" />
            </div>
            <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl divide-y divide-zinc-800/40">
              {feed.length === 0 && !loading && (
                <div className="px-4 py-8 text-center text-sm text-zinc-600">
                  Nenhuma atividade registrada ainda
                </div>
              )}
              {loading && feed.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-zinc-600">
                  Carregando...
                </div>
              )}
              {feed.map((item) => {
                const agent = AGENT_MAP[item.agent];
                return (
                  <div
                    key={item.id}
                    className="flex items-start gap-3 px-4 py-3 hover:bg-zinc-800/20 transition-colors"
                  >
                    <div className={`mt-0.5 w-8 h-8 rounded-lg flex items-center justify-center text-sm ${
                      item.tipo === "alerta" ? "bg-amber-500/10" : (agent?.bgColor ?? "bg-zinc-800")
                    }`}>
                      {item.tipo === "alerta" ? "\u{1F6A8}" : (agent?.emoji ?? "\u{1F4C4}")}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200 truncate">{item.titulo}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] font-medium ${agent?.color ?? "text-zinc-500"}`}>
                          {agent?.label ?? item.agent}
                        </span>
                        {item.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className="text-[10px] text-zinc-600 bg-zinc-800/60 px-1.5 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-zinc-600 whitespace-nowrap">
                      <Clock className="w-3 h-3" />
                      {formatTime(item.timestamp)}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Agents mini-grid */}
          <section>
            <h2 className="text-sm font-medium text-zinc-400 mb-3">Agents</h2>
            <div className="space-y-2">
              {AGENTS.map((agent) => (
                <button
                  key={agent.slug}
                  onClick={() => openChat(agent.slug)}
                  className="w-full group flex items-center gap-3 bg-zinc-900/40 border border-zinc-800/60 rounded-xl px-4 py-3 hover:border-zinc-700/60 hover:bg-zinc-800/30 transition-all text-left"
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm ${agent.bgColor}`}>
                    {agent.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                      {agent.label}
                    </p>
                    <p className="text-[10px] text-zinc-600">{agent.desc}</p>
                  </div>
                  <StatusBadge online={kpis.agentsAtivos > 0} />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Chat Modal */}
      {chatAgent && (
        <ChatModal
          agent={chatAgent}
          initialPrompt={chatPrompt}
          onClose={() => { setChatAgent(null); setChatPrompt(""); }}
        />
      )}
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  sub,
  color,
  bgColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  sub: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${bgColor} ${color}`}>
          {icon}
        </div>
        <span className="text-xs text-zinc-500 font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-[11px] text-zinc-500 mt-1">{sub}</p>
    </div>
  );
}

function StatusDot({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-1.5" title={`${label}: ${ok ? "online" : "offline"}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${ok ? "bg-emerald-400" : "bg-zinc-600"}`} />
      <span className="text-[10px] text-zinc-500">{label}</span>
    </div>
  );
}
