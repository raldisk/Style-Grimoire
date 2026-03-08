import { useRef, useEffect, useState, useCallback } from "react";
import { STYLE_META } from "../data/styles";
import { STYLE_PROMPTS } from "../data/prompts";
import { Message, StyleName } from "../types";
import { RenderedResponse } from "./RenderedResponse";
import { ThinkingIndicator } from "./ThinkingIndicator";

interface Props {
  selected: StyleName;
  history: Message[];
  loading: boolean;
  error: string;
  prompt: string;
  setPrompt: (v: string) => void;
  onGenerate: () => void;
  onClear: () => void;
  turnCount: number;
}

const KB_CHIPS = [
  "Teach me SAP FICO GL basics",
  "AWS SAA-C03 study path",
  "Explain CAP theorem",
  "How do I start CPA FAR?",
  "LeetCode: Two Sum — hint me",
  "What is SAP BTP?",
  "Azure AZ-104 overview",
  "Explain Raft consensus",
];

export function MainPanel({
  selected, history, loading, error,
  prompt, setPrompt, onGenerate, onClear, turnCount,
}: Props) {
  const meta = STYLE_META[selected];
  const [showPrompt, setShowPrompt]     = useState(false);
  const [copiedId, setCopiedId]         = useState<string | null>(null);
  const bottomRef  = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isKB = selected === "Knowledge Buddy";

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = `${Math.min(ta.scrollHeight, 160)}px`;
  }, [prompt]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onGenerate();
  };

  const copyResponse = useCallback(async (msg: Message) => {
    try {
      await navigator.clipboard.writeText(msg.content);
      setCopiedId(msg.id);
      setTimeout(() => setCopiedId(null), 1800);
    } catch {
      // clipboard not available — silent fail
    }
  }, []);

  const accentStyle = { "--accent": meta.color } as React.CSSProperties;

  return (
    <div className="main" style={accentStyle}>
      {/* Header */}
      <div className="main-header">
        <div className="header-left">
          <div className="selected-style-name">
            <span className="selected-glyph-large">{meta.glyph}</span>
            {selected}
          </div>
          <div className="style-desc-inline">{meta.desc}</div>
        </div>
        <div className="header-actions">
          {turnCount > 0 && (
            <span className="convo-badge">
              {turnCount} turn{turnCount !== 1 ? "s" : ""}
            </span>
          )}
          <button
            className={`btn-ghost${showPrompt ? " active-btn" : ""}`}
            onClick={() => setShowPrompt((v) => !v)}
          >
            {showPrompt ? "hide" : "system"} prompt
          </button>
          {(history.length > 0 || error) && (
            <button className="btn-ghost" onClick={onClear}>clear</button>
          )}
        </div>
      </div>

      {/* Scroll area */}
      <div className="scroll-area">

        {/* System prompt — scrollable */}
        {showPrompt && (
          <div className="prompt-preview">
            <div className="prompt-preview-label">System Prompt · {selected}</div>
            <div className="prompt-preview-text">{STYLE_PROMPTS[selected]}</div>
          </div>
        )}

        {/* Empty state */}
        {history.length === 0 && !loading && !error && (
          <div className="empty-state">
            <span className="empty-glyph">{meta.glyph}</span>
            <div className="empty-label">
              {isKB ? "SAP · Cloud · CS · Accounting · Ask anything" : `Invoke ${selected} mode`}
            </div>
            {isKB && (
              <div className="kb-chips">
                {KB_CHIPS.map((c) => (
                  <button key={c} className="kb-chip" onClick={() => { setPrompt(c); setTimeout(onGenerate, 0); }}>
                    {c}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Conversation */}
        {history.map((msg, i) => (
          <div key={msg.id} className="convo-entry">
            <div className="convo-role">
              <span className="role-dot" />
              {msg.role === "user" ? "you" : selected}
              {msg.role === "assistant" && (
                <button
                  className={`copy-btn${copiedId === msg.id ? " copied" : ""}`}
                  onClick={() => copyResponse(msg)}
                  title="Copy response"
                >
                  {copiedId === msg.id ? "copied" : "copy"}
                </button>
              )}
            </div>
            {msg.role === "user" ? (
              <div className="convo-user">{msg.content}</div>
            ) : (
              <div className="convo-assistant">
                <RenderedResponse text={msg.content} />
              </div>
            )}
            {i < history.length - 1 && <div className="divider" />}
          </div>
        ))}

        {loading && <ThinkingIndicator styleName={selected} />}
        {error && <div className="error-msg">⚠ {error}</div>}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="input-area">
        <div className="input-row">
          <textarea
            ref={textareaRef}
            className="prompt-input"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isKB ? "Ask about SAP, AWS/GCP/Azure, LeetCode, CPA…" : `Prompt for ${selected} mode…`}
            rows={1}
          />
          <button
            className="generate-btn"
            onClick={onGenerate}
            disabled={loading || !prompt.trim()}
          >
            {loading ? "…" : "invoke →"}
          </button>
        </div>
        <div className="input-hint">⌘↵ to submit · context preserved · switching style resets conversation</div>
      </div>
    </div>
  );
}
