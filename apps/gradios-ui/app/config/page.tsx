"use client";

import { useState } from "react";
import { AGENTS } from "@/lib/constants";
import { StatusBadge } from "@/components/StatusBadge";
import { Zap, ArrowLeft, Save } from "lucide-react";
import Link from "next/link";

interface AgentConfig {
  slug: string;
  active: boolean;
  model: "qwen2.5:14b" | "claude-opus";
}

export default function ConfigPage() {
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434");
  const [jarvisUrl, setJarvisUrl] = useState("http://localhost:8001");
  const [saved, setSaved] = useState(false);
  const [agentConfigs, setAgentConfigs] = useState<AgentConfig[]>(
    AGENTS.map((a) => ({ slug: a.slug, active: true, model: "qwen2.5:14b" }))
  );

  function toggleAgent(slug: string) {
    setAgentConfigs((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, active: !c.active } : c))
    );
  }

  function setModel(slug: string, model: AgentConfig["model"]) {
    setAgentConfigs((prev) =>
      prev.map((c) => (c.slug === slug ? { ...c, model } : c))
    );
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-4">
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
            <h1 className="font-bold text-white">Configuracoes</h1>
            <p className="text-xs text-zinc-500">Personalizar o JARVIS</p>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Conexoes */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Conexoes
          </h2>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl p-6 space-y-5">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                URL do Ollama
              </label>
              <input
                type="text"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-2">
                URL da JARVIS API
              </label>
              <input
                type="text"
                value={jarvisUrl}
                onChange={(e) => setJarvisUrl(e.target.value)}
                className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-4 py-2.5 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 font-mono"
              />
            </div>
          </div>
        </section>

        {/* Agents */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">
            Agents
          </h2>
          <div className="bg-zinc-900/80 border border-zinc-800/80 rounded-xl divide-y divide-zinc-800/80">
            {AGENTS.map((agent) => {
              const config = agentConfigs.find((c) => c.slug === agent.slug);
              if (!config) return null;
              return (
                <div
                  key={agent.slug}
                  className="p-4 flex items-center gap-4"
                >
                  <span className="text-xl flex-shrink-0">{agent.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-white">
                      {agent.label}
                    </h3>
                    <p className="text-xs text-zinc-500">{agent.desc}</p>
                  </div>
                  <select
                    value={config.model}
                    onChange={(e) =>
                      setModel(agent.slug, e.target.value as AgentConfig["model"])
                    }
                    className="bg-zinc-800 border border-zinc-700/50 rounded-lg px-3 py-1.5 text-xs text-zinc-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/40"
                  >
                    <option value="qwen2.5:14b">Qwen 2.5:14b</option>
                    <option value="claude-opus">Claude Opus</option>
                  </select>
                  <button
                    onClick={() => toggleAgent(agent.slug)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      config.active ? "bg-indigo-600" : "bg-zinc-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${
                        config.active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                  <StatusBadge
                    online={config.active}
                    label={config.active ? "Ativo" : "Inativo"}
                  />
                </div>
              );
            })}
          </div>
        </section>

        {/* Salvar */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm transition-all ${
              saved
                ? "bg-emerald-600 text-white"
                : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "Salvo!" : "Salvar configuracoes"}
          </button>
        </div>
      </div>
    </div>
  );
}
