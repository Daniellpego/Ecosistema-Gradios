"use client";

import { useState, useEffect, useCallback } from "react";
import { JARVIS_URL } from "@/lib/constants";
import { UserMenu } from "@/components/UserMenu";
import {
  Calendar,
  Plus,
  Clock,
  Users,
  MapPin,
  ExternalLink,
  Loader2,
  X,
  RefreshCw,
  CalendarDays,
} from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────

interface Evento {
  id: string;
  summary: string;
  start: string;
  end: string;
  description: string;
  attendees: string[];
  htmlLink: string;
}

interface AgendaResponse {
  status: string;
  message?: string;
  eventos: Evento[];
  total: number;
}

// ─── Helpers ────────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return "N/A";
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  });
}

function formatTime(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function isToday(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.toDateString() === now.toDateString();
}

function groupByDate(eventos: Evento[]): Map<string, Evento[]> {
  const groups = new Map<string, Evento[]>();
  for (const e of eventos) {
    const key = new Date(e.start).toDateString();
    const existing = groups.get(key) ?? [];
    existing.push(e);
    groups.set(key, existing);
  }
  return groups;
}

// ─── Main ───────────────────────────────────────────────────────

export default function AgendaPage() {
  const [data, setData] = useState<AgendaResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const loadAgenda = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${JARVIS_URL}/jarvis/agenda/proximos`, {
        signal: AbortSignal.timeout(10000),
      });
      if (res.ok) {
        setData(await res.json());
      }
    } catch {
      setData({ status: "error", eventos: [], total: 0, message: "Falha ao conectar com JARVIS" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAgenda(); }, [loadAgenda]);

  const eventos = data?.eventos ?? [];
  const grouped = groupByDate(eventos as Evento[]);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CalendarDays className="w-5 h-5 text-indigo-400" />
            <div>
              <h1 className="text-xl font-bold tracking-tight">Agenda</h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                {data?.total ?? 0} eventos nos proximos 7 dias
                {data?.status === "fallback" && " (modo offline)"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAgenda}
              disabled={loading}
              className="p-2 rounded-lg hover:bg-zinc-800/60 text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-40"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              Agendar reuniao
            </button>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="p-6 space-y-6">
        {/* Status banner */}
        {data?.status === "fallback" && (
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl px-4 py-3 text-sm text-yellow-400">
            Google Calendar nao configurado — mostrando reunioes salvas no AIOX
          </div>
        )}
        {data?.status === "error" && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">
            {data.message}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
          </div>
        )}

        {/* Empty state */}
        {!loading && eventos.length === 0 && (
          <div className="text-center py-20">
            <Calendar className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Nenhum evento nos proximos 7 dias</p>
            <button
              onClick={() => setShowModal(true)}
              className="mt-3 text-sm text-indigo-400 hover:text-indigo-300"
            >
              Agendar primeira reuniao
            </button>
          </div>
        )}

        {/* Events grouped by date */}
        {!loading && Array.from(grouped.entries()).map(([dateStr, events]) => (
          <div key={dateStr} className="space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${isToday(events[0].start) ? "bg-indigo-400" : "bg-zinc-600"}`} />
              <h3 className={`text-sm font-medium ${isToday(events[0].start) ? "text-indigo-400" : "text-zinc-400"}`}>
                {isToday(events[0].start) ? "Hoje" : formatDate(events[0].start)}
              </h3>
              <span className="text-[10px] text-zinc-600 bg-zinc-800/60 px-1.5 rounded-full">
                {events.length}
              </span>
            </div>

            <div className="space-y-2">
              {events.map((evento) => (
                <div
                  key={evento.id}
                  className="bg-zinc-900/40 border border-zinc-800/60 rounded-xl p-4 hover:border-zinc-700/60 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        {evento.summary}
                      </p>
                      {evento.description && (
                        <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                          {evento.description}
                        </p>
                      )}
                    </div>
                    {evento.htmlLink && (
                      <a
                        href={evento.htmlLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg hover:bg-zinc-800/60 text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs text-zinc-500">
                      <Clock className="w-3 h-3" />
                      {formatTime(evento.start)} — {formatTime(evento.end)}
                    </span>
                    {evento.attendees && evento.attendees.length > 0 && (
                      <span className="flex items-center gap-1 text-xs text-zinc-500">
                        <Users className="w-3 h-3" />
                        {evento.attendees.length} convidado{evento.attendees.length > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Modal agendar reuniao */}
      {showModal && (
        <AgendarReuniaoModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); loadAgenda(); }}
        />
      )}
    </div>
  );
}

// ─── Modal ──────────────────────────────────────────────────────

function AgendarReuniaoModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    lead_nome: "",
    empresa: "",
    data: "",
    hora: "10:00",
    duracao_minutos: 60,
    email_lead: "",
    whatsapp_lead: "",
    descricao: "",
  });
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setResult(null);
    try {
      const res = await fetch(`${JARVIS_URL}/jarvis/agenda/criar-reuniao`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setResult("Reuniao agendada com sucesso!");
        setTimeout(onSaved, 1500);
      } else {
        const err = await res.json().catch(() => ({ detail: "Erro desconhecido" }));
        setResult(`Erro: ${err.detail ?? res.statusText}`);
      }
    } catch {
      setResult("Erro ao conectar com JARVIS");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
          <h2 className="text-sm font-semibold text-zinc-200">Agendar reuniao com lead</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300">
            <X className="w-4 h-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Nome do lead</label>
              <input
                value={form.lead_nome}
                onChange={(e) => setForm({ ...form, lead_nome: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="Joao Silva"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Empresa</label>
              <input
                value={form.empresa}
                onChange={(e) => setForm({ ...form, empresa: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="TechFlow SP"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Data</label>
              <input
                type="date"
                value={form.data}
                onChange={(e) => setForm({ ...form, data: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Hora</label>
              <input
                type="time"
                value={form.hora}
                onChange={(e) => setForm({ ...form, hora: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Email do lead</label>
              <input
                type="email"
                value={form.email_lead}
                onChange={(e) => setForm({ ...form, email_lead: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="joao@techflow.com"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">WhatsApp do lead</label>
              <input
                value={form.whatsapp_lead}
                onChange={(e) => setForm({ ...form, whatsapp_lead: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                placeholder="5511999999999"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-400 mb-1">Descricao / pauta</label>
            <textarea
              value={form.descricao}
              onChange={(e) => setForm({ ...form, descricao: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-sm text-zinc-200 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
              placeholder="Apresentar proposta de automacao..."
            />
          </div>

          {result && (
            <div className={`text-sm px-3 py-2 rounded-lg border ${
              result.startsWith("Erro")
                ? "bg-red-500/10 border-red-500/20 text-red-400"
                : "bg-green-500/10 border-green-500/20 text-green-400"
            }`}>
              {result}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-sm font-medium text-white transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
            Agendar reuniao
          </button>
        </form>
      </div>
    </div>
  );
}
