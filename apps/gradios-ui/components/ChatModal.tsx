"use client";

import { useState, useRef, useEffect } from "react";
import type { Agent } from "@/lib/constants";
import { useChat } from "@/lib/hooks/useChat";
import { ChatMessage as ChatMsg } from "@/components/ChatMessage";
import { X, Send, Minimize2 } from "lucide-react";

interface ChatModalProps {
  agent: Agent;
  initialPrompt?: string;
  onClose: () => void;
}

export function ChatModal({ agent, initialPrompt, onClose }: ChatModalProps) {
  const [input, setInput] = useState("");
  const { messages, loading, send, clearMessages } = useChat();
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const sentInitial = useRef(false);

  // Envia prompt inicial se fornecido
  useEffect(() => {
    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      send(initialPrompt, agent);
    }
  }, [initialPrompt, agent, send]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!initialPrompt) textareaRef.current?.focus();
  }, [initialPrompt]);

  function handleSend() {
    if (!input.trim() || loading) return;
    send(input, agent);
    setInput("");
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleClose() {
    clearMessages();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-2xl h-[80vh] bg-zinc-900 border border-zinc-800/80 rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/95">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg ${agent.bgColor}`}>
            {agent.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-white">{agent.label}</h3>
            <p className="text-[10px] text-zinc-500">{agent.desc}</p>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {messages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-4xl mb-3">{agent.emoji}</span>
              <p className="text-sm text-zinc-500">
                Pergunte algo ao {agent.label}
              </p>
            </div>
          )}
          {messages.map((msg, i) => (
            <ChatMsg
              key={msg.id}
              message={msg}
              isStreaming={loading && i === messages.length - 1 && msg.role === "agent"}
            />
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-5 py-3 border-t border-zinc-800/80 bg-zinc-900/95">
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder={`Mensagem para ${agent.label}...`}
              rows={2}
              disabled={loading}
              className="flex-1 bg-zinc-800/80 border border-zinc-700/50 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500/40 disabled:opacity-50 transition-all"
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white p-2.5 rounded-xl transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
