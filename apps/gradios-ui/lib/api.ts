import { JARVIS_URL, SUPABASE_URL, SUPABASE_KEY } from "./constants";

interface FetchOptions {
  timeout?: number;
}

// ─── Supabase helpers ──────────────────────────────────────────────

function supabaseHeaders(): Record<string, string> {
  return {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
    "Content-Type": "application/json",
  };
}

export async function supabaseSelect<T = Record<string, unknown>>(
  table: string,
  params: Record<string, string> = {},
): Promise<T[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return [];
  const qs = new URLSearchParams({ select: "*", ...params });
  const res = await fetchWithTimeout(
    `${SUPABASE_URL}/rest/v1/${table}?${qs}`,
    { method: "GET", headers: supabaseHeaders() },
  );
  if (!res.ok) return [];
  return res.json();
}

export async function supabaseCount(
  table: string,
  filters: Record<string, string> = {},
): Promise<number> {
  if (!SUPABASE_URL || !SUPABASE_KEY) return 0;
  const qs = new URLSearchParams({ select: "id", ...filters });
  const res = await fetchWithTimeout(
    `${SUPABASE_URL}/rest/v1/${table}?${qs}`,
    {
      method: "GET",
      headers: {
        ...supabaseHeaders(),
        Prefer: "count=exact",
        "Range-Unit": "items",
        Range: "0-0",
      },
    },
  );
  if (!res.ok) return 0;
  const range = res.headers.get("content-range");
  if (range) {
    const total = range.split("/")[1];
    return total === "*" ? 0 : parseInt(total, 10);
  }
  return 0;
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  opts: FetchOptions = {}
): Promise<Response> {
  const { timeout = 30000 } = opts;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}

export async function fetchAgents(): Promise<
  Record<string, { name: string; title: string }>
> {
  const res = await fetchWithTimeout(`${JARVIS_URL}/agents`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Falha ao carregar agents");
  return res.json();
}

export async function fetchHealth(): Promise<{
  status: string;
  ollama: boolean;
  models: string[];
  supabase: boolean;
  claude: boolean;
}> {
  const res = await fetchWithTimeout(`${JARVIS_URL}/health`, {
    method: "GET",
  });
  if (!res.ok) throw new Error("Falha no health check");
  return res.json();
}

export function streamAgent(
  agentSlug: string,
  message: string,
  onToken: (token: string) => void,
  onDone: () => void,
  onError: (err: Error) => void
): AbortController {
  const controller = new AbortController();

  (async () => {
    try {
      const res = await fetch(
        `${JARVIS_URL}/jarvis/${agentSlug}/stream`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, stream: true }),
          signal: controller.signal,
        }
      );
      if (!res.ok || !res.body) throw new Error("Falha na conexao com JARVIS");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === "token" && data.token) onToken(data.token);
            if (data.type === "done") onDone();
          } catch {
            continue;
          }
        }
      }
      onDone();
    } catch (e) {
      if ((e as Error).name !== "AbortError") {
        onError(e instanceof Error ? e : new Error(String(e)));
      }
    }
  })();

  return controller;
}
