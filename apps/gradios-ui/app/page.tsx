"use client";

import { useState, useRef, useEffect } from "react";
import { AGENTS } from "@/lib/constants";
import type { Agent } from "@/lib/constants";
import { useChat } from "@/lib/hooks/useChat";
import { ChatMessage } from "@/components/ChatMessage";
import { AgentCard } from "@/components/AgentCard";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Send,
  Zap,
  Menu,
  X,
} from "lucide-react";

export default function GradiosJarvis() {
  const [activeAgent, setActiveAgent] = useState<Agent>(AGENTS[0]);
  const [input, setInput] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { messages, loading, send, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [activeAgent]);

  function handleSend() {
    if (!input.trim() || loading) return;
    send(input, activeAgent);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function switchAgent(agent: Agent) {
    setActiveAgent(agent);
    clearMessages();
    setSidebarOpen(false);
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-64 bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800/80 flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-5 border-b border-zinc-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white">
                GRADIOS
              </h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">
                JARVIS C-Level
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <p className="text-[10px] uppercase tracking-wider text-zinc-600 font-medium px-3 py-2">
            Agents
          </p>
          {AGENTS.map((a) => (
            <AgentCard
              key={a.slug}
              agent={a}
              active={activeAgent.slug === a.slug}
              onClick={() => switchAgent(a)}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-800/80">
          <div className="flex items-center gap-2 text-xs text-zinc-600">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse-slow" />
            Qwen2.5:14b + Claude
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="px-4 lg:px-6 py-3 border-b border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          <span className="text-lg">{activeAgent.emoji}</span>
          <div className="min-w-0">
            <h2 className="font-semibold text-white text-sm">
              {activeAgent.label}
            </h2>
            <p className="text-xs text-zinc-500">{activeAgent.desc}</p>
          </div>
          <div className="ml-auto">
            <StatusBadge online />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 lg:px-6 py-6 space-y-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="text-5xl mb-4">{activeAgent.emoji}</div>
              <h3 className="text-lg font-semibold text-zinc-300 mb-1">
                {activeAgent.label}
              </h3>
              <p className="text-sm text-zinc-600 max-w-sm">
                Como posso ajudar com {activeAgent.desc.toLowerCase()}?
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              isStreaming={
                loading &&
                i === messages.length - 1 &&
                msg.role === "agent"
              }
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <footer className="px-4 lg:px-6 py-4 border-t border-zinc-800/80 bg-zinc-900/50 backdrop-blur-sm">
          <div className="flex gap-3 items-end max-w-4xl mx-auto">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Pergunte ao ${activeAgent.label}...`}
              rows={2}
              disabled={loading}
              className="flex-1 bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white p-3 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-[10px] text-zinc-600 mt-2 text-center">
            Shift+Enter = nova linha &middot; Enter = enviar
          </p>
        </footer>
      </main>
    </div>
  );
}
