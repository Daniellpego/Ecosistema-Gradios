"use client";

import { useState, useEffect, useCallback } from "react";
import { AGENT_MAP } from "@/lib/constants";
import { supabaseSelect } from "@/lib/api";
import { MarkdownContent } from "@/components/MarkdownContent";
import {
  Bell,
  RefreshCw,
  AlertTriangle,
  Eye,
  CheckCircle2,
  Clock,
  Filter,
  X,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────

type AlertaStatus = "novo" | "visto" | "resolvido";

interface Alerta {
  id: string;
  title: string;
  agent: string;
  content: string;
  summary: string | null;
  tags: string[];
  status: string;
  created_at: string;
  // Status local (nao persiste no Supabase por ora)
  alertaStatus: AlertaStatus;
}

// ─── Helpers ────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<AlertaStatus, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  novo:      { label: "Novo",      icon: AlertTriangle, color: "text-amber-400",   bg: "bg-amber-500/10" },
  visto:     { label: "Visto",     icon: Eye,           color: "text-blue-400",    bg: "bg-blue-500/10" },
  resolvido: { label: "Resolvido", icon: CheckCircle2,  color: "text-emerald-400", bg: "bg-emerald-500/10" },
};

// ─── Component ──────────────────────────────────────────────────────

export default function AlertasPage() {
  const [alertas, setAlertas] = useState<Alerta[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<AlertaStatus | "all">("all");
  const [selectedAlerta, setSelectedAlerta] = useState<Alerta | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      interface StudyRow {
        id: string;
        title: string;
        agent: string;
        content: string;
        summary: string | null;
        tags: string[];
        status: string;
        created_at: string;
      }
      const rows = await supabaseSelect<StudyRow>(
        "jarvis_studies",
        {
          select: "id,title,agent,content,summary,tags,status,created_at",
          "tags": "cs.{alerta-crm}",
          order: "created_at.desc",
          limit: "100",
        },
      );

      // Carrega status local do localStorage
      const savedStatuses = loadStatusesFromStorage();

      const mapped: Alerta[] = rows.map((r) => ({
        ...r,
        alertaStatus: savedStatuses[r.id] ?? "novo",
      }));

      setAlertas(mapped);
    } catch (err) {
      console.error("Erro ao carregar alertas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function loadStatusesFromStorage(): Record<string, AlertaStatus> {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("aiox_alerta_statuses");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  }

  function saveStatusToStorage(id: string, status: AlertaStatus) {
    const current = loadStatusesFromStorage();
    current[id] = status;
    localStorage.setItem("aiox_alerta_statuses", JSON.stringify(current));
  }

  function updateAlertaStatus(id: string, newStatus: AlertaStatus) {
    setAlertas((prev) =>
      prev.map((a) => (a.id === id ? { ...a, alertaStatus: newStatus } : a))
    );
    saveStatusToStorage(id, newStatus);

    if (selectedAlerta?.id === id) {
      setSelectedAlerta((prev) => prev ? { ...prev, alertaStatus: newStatus } : null);
    }
  }

  function handleSelect(alerta: Alerta) {
    setSelectedAlerta(alerta);
    // Auto-marcar como visto se novo
    if (alerta.alertaStatus === "novo") {
      updateAlertaStatus(alerta.id, "visto");
    }
  }

  const filtered = alertas.filter((a) => {
    if (filterStatus === "all") return true;
    return a.alertaStatus === filterStatus;
  });

  const counts = {
    novo: alertas.filter((a) => a.alertaStatus === "novo").length,
    visto: alertas.filter((a) => a.alertaStatus === "visto").length,
    resolvido: alertas.filter((a) => a.alertaStatus === "resolvido").length,
  };

  function formatRelative(iso: string): string {
    const d = new Date(iso);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    const hrs = Math.floor(diff / 3600000);
    if (hrs < 1) return "agora";
    if (hrs < 24) return `${hrs}h atras`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d atras`;
    return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Alertas</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {alertas.length} alertas autonomos {counts.novo > 0 ? `\u00B7 ${counts.novo} novos` : ""}
              </p>
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
        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6">
          <FilterTab
            label="Todos"
            count={alertas.length}
            active={filterStatus === "all"}
            onClick={() => setFilterStatus("all")}
          />
          {(["novo", "visto", "resolvido"] as AlertaStatus[]).map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <FilterTab
                key={s}
                label={cfg.label}
                count={counts[s]}
                active={filterStatus === s}
                onClick={() => setFilterStatus(s)}
                color={cfg.color}
              />
            );
          })}
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {loading && alertas.length === 0 && (
              <div className="py-12 text-center text-sm text-zinc-600">Carregando...</div>
            )}
            {!loading && filtered.length === 0 && (
              <div className="py-12 text-center text-sm text-zinc-600">
                Nenhum alerta {filterStatus !== "all" ? `com status "${filterStatus}"` : "encontrado"}
              </div>
            )}
            {filtered.map((alerta) => {
              const agent = AGENT_MAP[alerta.agent];
              const cfg = STATUS_CONFIG[alerta.alertaStatus];
              const selected = selectedAlerta?.id === alerta.id;
              const StatusIcon = cfg.icon;

              return (
                <button
                  key={alerta.id}
                  onClick={() => handleSelect(alerta)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selected
                      ? "bg-zinc-800/60 border-indigo-500/40"
                      : "bg-zinc-900/40 border-zinc-800/60 hover:border-zinc-700/60"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${cfg.bg}`}>
                      <StatusIcon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-zinc-200 line-clamp-2">
                        {alerta.title}
                      </h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className={`text-[10px] font-medium ${agent?.color ?? "text-zinc-500"}`}>
                          {agent?.label ?? alerta.agent}
                        </span>
                        <span className="text-[10px] text-zinc-600 flex items-center gap-0.5">
                          <Clock className="w-2.5 h-2.5" />
                          {formatRelative(alerta.created_at)}
                        </span>
                      </div>
                    </div>
                    {alerta.alertaStatus === "novo" && (
                      <div className="w-2 h-2 rounded-full bg-amber-400 shrink-0 mt-1.5" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Viewer */}
          <div className="lg:col-span-2">
            {selectedAlerta ? (
              <div className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl overflow-hidden sticky top-24">
                {/* Viewer header */}
                <div className="flex items-center gap-3 px-6 py-4 border-b border-zinc-800/40">
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${STATUS_CONFIG[selectedAlerta.alertaStatus].bg}`}>
                    {(() => {
                      const Icon = STATUS_CONFIG[selectedAlerta.alertaStatus].icon;
                      return <Icon className={`w-5 h-5 ${STATUS_CONFIG[selectedAlerta.alertaStatus].color}`} />;
                    })()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-white">{selectedAlerta.title}</h2>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      {AGENT_MAP[selectedAlerta.agent]?.label ?? selectedAlerta.agent} \u00B7{" "}
                      {new Date(selectedAlerta.created_at).toLocaleString("pt-BR")}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedAlerta(null)}
                    className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Status actions */}
                <div className="px-6 py-3 border-b border-zinc-800/40 flex gap-2">
                  {(["novo", "visto", "resolvido"] as AlertaStatus[]).map((s) => {
                    const cfg = STATUS_CONFIG[s];
                    const active = selectedAlerta.alertaStatus === s;
                    return (
                      <button
                        key={s}
                        onClick={() => updateAlertaStatus(selectedAlerta.id, s)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          active
                            ? `${cfg.bg} ${cfg.color} border border-current/20`
                            : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/40"
                        }`}
                      >
                        {(() => {
                          const Icon = cfg.icon;
                          return <Icon className="w-3.5 h-3.5" />;
                        })()}
                        {cfg.label}
                      </button>
                    );
                  })}
                </div>

                {/* Content */}
                <div className="px-6 py-5 max-h-[calc(100vh-350px)] overflow-y-auto prose-jarvis">
                  {selectedAlerta.summary && (
                    <div className="mb-4 p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/40">
                      <p className="text-[11px] text-zinc-500 uppercase tracking-wider mb-1">Resumo</p>
                      <p className="text-sm text-zinc-300">{selectedAlerta.summary}</p>
                    </div>
                  )}
                  <MarkdownContent content={selectedAlerta.content ?? ""} />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 bg-zinc-900/30 border border-zinc-800/40 rounded-xl">
                <Bell className="w-8 h-8 text-zinc-700 mb-3" />
                <p className="text-sm text-zinc-600">Selecione um alerta para visualizar</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────

function FilterTab({
  label,
  count,
  active,
  onClick,
  color,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  color?: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active
          ? "bg-zinc-800/80 text-white border border-zinc-700/60"
          : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/30"
      }`}
    >
      <span>{label}</span>
      {count > 0 && (
        <span className={`text-[10px] ${active ? (color ?? "text-zinc-400") : "text-zinc-600"}`}>
          {count}
        </span>
      )}
    </button>
  );
}
