"use client";

import { useState, useRef, useCallback } from "react";
import { streamAgent } from "../api";
import type { Agent } from "../constants";

export interface ChatMessage {
  id: string;
  role: "user" | "agent";
  text: string;
  agent?: string;
  agentSlug?: string;
  timestamp: Date;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const send = useCallback(
    (text: string, agent: Agent) => {
      if (!text.trim() || loading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        text: text.trim(),
        timestamp: new Date(),
      };

      const agentMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "agent",
        text: "",
        agent: agent.label,
        agentSlug: agent.slug,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg, agentMsg]);
      setLoading(true);

      let accumulated = "";

      abortRef.current = streamAgent(
        agent.slug,
        text.trim(),
        (token) => {
          accumulated += token;
          const current = accumulated;
          setMessages((prev) => {
            const copy = [...prev];
            copy[copy.length - 1] = { ...copy[copy.length - 1], text: current };
            return copy;
          });
        },
        () => setLoading(false),
        (err) => {
          setMessages((prev) => [
            ...prev,
            {
              id: crypto.randomUUID(),
              role: "agent",
              text: `Erro: ${err.message}`,
              agent: "Sistema",
              timestamp: new Date(),
            },
          ]);
          setLoading(false);
        }
      );
    },
    [loading]
  );

  const clearMessages = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setLoading(false);
  }, []);

  return { messages, loading, send, clearMessages };
}
