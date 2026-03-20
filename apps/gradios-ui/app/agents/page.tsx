"use client";

import { useState, useEffect, useCallback } from "react";
import { AGENTS, AGENT_MAP } from "@/lib/constants";
import type { Agent } from "@/lib/constants";
import { fetchHealth, supabaseSelect } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { ChatModal } from "@/components/ChatModal";
import {
  Bot,
  Zap,
  FileText,
  Clock,
  RefreshCw,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

interface AgentStats {
  totalEstudos: number;
  ultimaAcao: string | null;
  ultimaAcaoTitulo: string | null;
}

// ─── Component ──────────────────────────────────────────────────────

export default function AgentsPage() {
  const [stats, setStats] = useState<Record<string, AgentStats>>({});
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatAgent, setChatAgent] = useState<Agent | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const health = await fetchHealth().catch(() => ({ ollama: false, models: [], supabase: false, claude: false, status: "error" }));
      setOllamaOnline(health.ollama);

      interface StudyRow {
        id: string;
        agent: string;
        title: string;
        created_at: string;
      }
      const estudos = await supabaseSelect<StudyRow>(
        "jarvis_studies",
        { select: "id,agent,title,created_at", order: "created_at.desc" },
      );

      const agentStats: Record<string, AgentStats> = {};
      for (const a of AGENTS) {
        const agentEstudos = estudos.filter((e) => e.agent === a.slug);
        const ultimo = agentEstudos[0] ?? null;
        agentStats[a.slug] = {
          totalEstudos: agentEstudos.length,
          ultimaAcao: ultimo?.created_at ?? null,
          ultimaAcaoTitulo: ultimo?.title ?? null,
        };
      }
      setStats(agentStats);
    } catch (err) {
      console.error("Erro ao carregar agents:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function formatRelative(iso: string | null): string {
    if (!iso) return "nunca";
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "agora";
    if (mins < 60) return `${mins}min atras`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h atras`;
    const days = Math.floor(hrs / 24);
    return `${days}d atras`;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-indigo-500/10 flex items-center justify-center">
              <Bot className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Agents</h1>
              <p className="text-xs text-zinc-500 mt-0.5">{AGENTS.length} agents especializados</p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </header>

      <div className="p-6">
        {/* Summary */}
        <div className="flex items-center gap-6 mb-6 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${ollamaOnline ? "bg-emerald-400" : "bg-zinc-600"}`} />
            <span>Ollama {ollamaOnline ? "online" : "offline"}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" />
            <span>{ollamaOnline ? AGENTS.length : 0} ativos</span>
          </div>
        </div>

        {/* Agent Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {AGENTS.map((agent) => {
            const s = stats[agent.slug];
            return (
              <div
                key={agent.slug}
                className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-5 flex flex-col"
              >
                {/* Top: emoji + name + status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl ${agent.bgColor}`}>
                      {agent.emoji}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{agent.label}</h3>
                      <p className="text-[11px] text-zinc-500">{agent.desc}</p>
                    </div>
                  </div>
                  <StatusBadge online={ollamaOnline} />
                </div>

                {/* Stats */}
                <div className="space-y-2.5 flex-1">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <FileText className="w-3.5 h-3.5 text-zinc-600" />
                    <span>{s?.totalEstudos ?? 0} estudos gerados</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <Clock className="w-3.5 h-3.5 text-zinc-600" />
                    <span>Ultima acao: {formatRelative(s?.ultimaAcao ?? null)}</span>
                  </div>
                  {s?.ultimaAcaoTitulo && (
                    <p className="text-[11px] text-zinc-600 truncate pl-5.5" title={s.ultimaAcaoTitulo}>
                      {s.ultimaAcaoTitulo}
                    </p>
                  )}
                </div>

                {/* Action button */}
                <button
                  onClick={() => setChatAgent(agent)}
                  className="mt-4 w-full py-2 px-3 rounded-lg bg-zinc-800/60 hover:bg-indigo-600/80 border border-zinc-700/40 hover:border-indigo-500/40 text-xs font-medium text-zinc-300 hover:text-white transition-all"
                >
                  Acionar agent
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Modal */}
      {chatAgent && (
        <ChatModal
          agent={chatAgent}
          onClose={() => setChatAgent(null)}
        />
      )}
    </div>
  );
}
