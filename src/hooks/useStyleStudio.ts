import { useState, useCallback, useRef } from "react";
import { Message, StyleName } from "../types";
import { STYLE_PROMPTS } from "../data/prompts";

const API_URL = "https://api.anthropic.com/v1/messages";

// Model: "claude-sonnet-4-6" = Claude Sonnet 4.6.
// Verified in claude.ai artifact sandbox (auth injected by runtime).
// For standalone deploy: proxy through backend, verify at docs.anthropic.com/en/docs/about-claude/models
const MODEL = "claude-sonnet-4-6";

function classifyError(e: unknown, status?: number): string {
  if (status === 429) return "Rate limited — wait a moment before trying again.";
  if (status === 401) return "Authentication failed. Check your API key.";
  if (status === 500 || status === 529) return "Anthropic API is temporarily unavailable. Try again shortly.";
  if (e instanceof TypeError && e.message.includes("fetch")) return "Network error — check your connection.";
  if (e instanceof Error) return e.message;
  return "Unexpected error. Please try again.";
}

// Generates a simple unique ID without external deps
// crypto.randomUUID() — collision-resistant, native browser implementation

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
    const messages = [...history, userMsg];
    // Strip IDs before sending to API
    const apiMessages = messages.map(({ role, content }) => ({ role, content }));

    let status: number | undefined;

    try {
      const res = await fetch(API_URL, {
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
      const data = await res.json();
      if (data.error) throw new Error(data.error.message);

      const assistantText = data.content
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { type: string; text?: string }) => b.text ?? "")
        .join("");

      const assistantMsg: Message = { id: crypto.randomUUID(), role: "assistant", content: assistantText };
      setHistory([...messages, assistantMsg]);
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
    turnCount: Math.floor(history.length / 2),
  };
}
