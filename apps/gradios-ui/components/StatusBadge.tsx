interface StatusBadgeProps {
  online: boolean;
  label?: string;
}

export function StatusBadge({ online, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full ${
        online
          ? "bg-emerald-500/15 text-emerald-400"
          : "bg-red-500/15 text-red-400"
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          online ? "bg-emerald-400 animate-pulse-slow" : "bg-red-400"
        }`}
      />
      {label ?? (online ? "Online" : "Offline")}
    </span>
  );
}
