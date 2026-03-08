import { useState, useCallback, useRef } from "react";
import { Message, StyleName, ClaudeResponse } from "../types";
import { STYLE_PROMPTS } from "../data/prompts";

const API_URL = "https://api.anthropic.com/v1/messages";

// Model: "claude-sonnet-4-6" = Claude Sonnet 4.6.
// Verified in claude.ai artifact sandbox (auth injected by runtime).
// For standalone deploy: proxy through backend, verify at docs.anthropic.com/en/docs/about-claude/models
const MODEL = "claude-sonnet-4-6";

// Max turns kept in context — prevents unbounded token growth in long sessions
const MAX_HISTORY = 10;

function classifyError(e: unknown, status?: number): string {
  if (status === 429) return "Rate limited — wait a moment before trying again.";
  if (status === 401) return "Authentication failed. Check your API key.";
  if (status === 403) return "API key not authorized.";
  if (status === 500 || status === 529) return "Anthropic API is temporarily unavailable. Try again shortly.";
  if (e instanceof TypeError && e.message.includes("fetch")) return "Network error — check your connection.";
  if (e instanceof Error) return e.message;
  return "Unexpected error. Please try again.";
}

// ID generation: crypto.randomUUID() — collision-resistant, native browser implementation

// ─── Retry with exponential backoff (429 / 529 only) ────────────────────────
async function retryFetch(
  url: string,
  options: RequestInit,
  retries = 3
): Promise<Response> {
  let delay = 1000;
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, options);
    if (res.status !== 429 && res.status !== 529) return res;
    if (i < retries - 1) await new Promise((r) => setTimeout(r, delay));
    delay *= 2;
  }
  throw new Error("Rate limit exceeded after 3 retries — please wait and try again.");
}

export function useStyleStudio() {
  const [selectedStyle, setSelectedStyle] = useState<StyleName>("Coherence");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<Message[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async () => {
    if (!prompt.trim() || loading) return;

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError("");

    const userMsg: Message = { id: crypto.randomUUID(), role: "user", content: prompt };
    // Trim to MAX_HISTORY turns before appending — prevents token overflow
    const trimmed = history.slice(-MAX_HISTORY * 2);
    const messages = [...trimmed, userMsg];
    // Strip IDs before sending to API
    const apiMessages = messages.map(({ role, content }) => ({ role, content }));

    let status: number | undefined;

    try {
      const res = await retryFetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: abortRef.current.signal,
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1000,
          system: STYLE_PROMPTS[selectedStyle],
          messages: apiMessages,
        }),
      });

      status = res.status;

      // Guard: check HTTP status before parsing body
      if (!res.ok) throw new Error(`API error ${res.status}`);

      // Guard: safe JSON parse — API may return non-JSON on edge failures
      let data: ClaudeResponse;
      try {
        data = await res.json();
      } catch {
        throw new Error("Invalid response from API");
      }

      if (data.error) throw new Error(data.error.message);

      const assistantText = data.content?.map((block) => block.text ?? "").join("") ?? "";

      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: assistantText };
      // Functional update — safe under React concurrent rendering
      setHistory(prev => [...prev, userMsg, assistantMsg]);
      setPrompt("");
    } catch (e: unknown) {
      if (e instanceof Error && e.name === "AbortError") return;
      setError(classifyError(e, status));
    } finally {
      setLoading(false);
    }
  }, [prompt, loading, history, selectedStyle]);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setHistory([]);
    setError("");
    setPrompt("");
  }, []);

  const switchStyle = useCallback((style: StyleName) => {
    abortRef.current?.abort();
    setSelectedStyle(style);
    setHistory([]);
    setError("");
    setPrompt("");
  }, []);

  return {
    selectedStyle,
    switchStyle,
    prompt,
    setPrompt,
    loading,
    error,
    history,
    generate,
    clear,
    // Count user messages only — immune to future system message additions
    turnCount: history.filter((m) => m.role === "user").length,
  };
}
