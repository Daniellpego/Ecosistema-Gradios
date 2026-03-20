"use client";

import type { Agent } from "@/lib/constants";

interface AgentCardProps {
  agent: Agent;
  active: boolean;
  onClick: () => void;
}

export function AgentCard({ agent, active, onClick }: AgentCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 group ${
        active
          ? "bg-indigo-600/90 text-white shadow-lg shadow-indigo-500/20"
          : "hover:bg-zinc-800/80 text-zinc-400 hover:text-white"
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span className="text-base flex-shrink-0">{agent.emoji}</span>
        <div className="min-w-0">
          <span className="text-sm font-medium block truncate">
            {agent.label}
          </span>
          <p
            className={`text-xs mt-0.5 truncate ${
              active ? "text-indigo-200" : "text-zinc-500 group-hover:text-zinc-400"
            }`}
          >
            {agent.desc}
          </p>
        </div>
      </div>
    </button>
  );
}
