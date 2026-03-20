"use client";

import { useState, useEffect, useCallback } from "react";
import { AGENTS } from "@/lib/constants";
import { fetchHealth } from "@/lib/api";
import { StatusBadge } from "@/components/StatusBadge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Zap, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface HealthData {
  ollama: boolean;
  models: string[];
  supabase: boolean;
  claude: boolean;
}

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadHealth = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchHealth();
      setHealth(data);
      setError("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao conectar");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHealth();
    const interval = setInterval(loadHealth, 30000);
    return () => clearInterval(interval);
  }, [loadHealth]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-white">Dashboard</h1>
            <p className="text-xs text-zinc-500">Metricas e status do sistema</p>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Status Cards */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Status do Sistema
          </h2>
          {loading && !health ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
              <p className="text-red-400 text-sm">{error}</p>
              <button
                onClick={loadHealth}
                className="mt-3 text-xs text-red-400 hover:text-red-300 underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : health ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatusCard
                title="Ollama"
                online={health.ollama}
                detail={health.models.length > 0 ? health.models.join(", ") : "Sem modelos"}
              />
              <StatusCard
                title="Supabase"
                online={health.supabase}
                detail={health.supabase ? "Conectado" : "Nao configurado"}
              />
              <StatusCard
                title="Claude API"
                online={health.claude}
                detail={health.claude ? "API key ativa" : "Sem API key"}
              />
              <StatusCard
                title="JARVIS API"
                online
                detail="FastAPI v2.0"
              />
            </div>
          ) : null}
        </section>

        {/* Agents Grid */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Agents Disponiveis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AGENTS.map((agent) => (
              <div
                key={agent.slug}
                className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-4 hover:border-zinc-700/80 transition-colors"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <div>
                    <h3 className="font-medium text-sm text-white">
                      {agent.label}
                    </h3>
                    <p className="text-xs text-zinc-500">{agent.desc}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <StatusBadge online label="Ativo" />
                  <span className={`text-xs ${agent.color}`}>{agent.slug}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Modelos */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Modelos Carregados
          </h2>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6">
            {health?.models && health.models.length > 0 ? (
              <div className="space-y-3">
                {health.models.map((model) => (
                  <div
                    key={model}
                    className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-3"
                  >
                    <span className="text-sm font-mono text-zinc-200">
                      {model}
                    </span>
                    <StatusBadge online label="Loaded" />
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-500 text-center py-4">
                Nenhum modelo carregado no Ollama
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatusCard({
  title,
  online,
  detail,
}: {
  title: string;
  online: boolean;
  detail: string;
}) {
  return (
    <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-zinc-300">{title}</h3>
        <StatusBadge online={online} />
      </div>
      <p className="text-xs text-zinc-500 truncate">{detail}</p>
    </div>
  );
}
