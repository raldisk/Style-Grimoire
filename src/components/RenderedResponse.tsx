// Note: nested blockquotes (>> syntax) flatten to single level — by design.
// Rendering is pure JSX via InlineText — no dangerouslySetInnerHTML, no DOMPurify needed.

interface Props {
  text: string;
  accent?: string;
}

// Handles **bold**, *italic*, and `code` inline spans — pure JSX, XSS-safe by construction.
function InlineText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /`([^`]+)`|\*\*(.+?)\*\*|\*(.+?)\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;

  while ((m = regex.exec(text)) !== null) {
    if (m.index > last) parts.push(<span key={i++}>{text.slice(last, m.index)}</span>);

    if (m[1] !== undefined) {
      parts.push(
        <code key={i++} className="response-code">{m[1]}</code>
      );
    } else if (m[2] !== undefined) {
      parts.push(<strong key={i++} className="response-bold">{m[2]}</strong>);
    } else {
      parts.push(<em key={i++} className="response-em">{m[3]}</em>);
    }
    last = m.index + m[0].length;
  }

  if (last < text.length) parts.push(<span key={i++}>{text.slice(last)}</span>);
  return <>{parts}</>;
}

export function RenderedResponse({ text, accent }: Props) {
  const paragraphs = text.split(/\n\n+/);

  return (
    <div className="rendered-response">
      {paragraphs.map((para, i) => {
        // Blockquote
        if (para.startsWith("> ")) {
          return (
            <blockquote key={i} className="response-blockquote" style={accent ? { borderLeftColor: accent } : undefined}>
              <InlineText text={para.replace(/^> /gm, "")} />
            </blockquote>
          );
        }

        // H3 / H2
        if (para.startsWith("### ")) {
          return (
            <div key={i} className="response-h3" style={accent ? { color: accent } : undefined}>
              {para.replace(/^### /, "")}
            </div>
          );
        }
        if (para.startsWith("## ")) {
          return (
            <div key={i} className="response-h2" style={accent ? { color: accent } : undefined}>
              {para.replace(/^## /, "")}
            </div>
          );
        }

        // Unordered list
        if (para.split("\n").every((l) => l.match(/^[-*] /) || l.trim() === "")) {
          const items = para.split("\n").filter((l) => l.match(/^[-*] /));
          return (
            <ul key={i} className="response-list">
              {items.map((item, j) => (
                <li key={j}><InlineText text={item.replace(/^[-*] /, "")} /></li>
              ))}
            </ul>
          );
        }

        // Normal paragraph
        return (
          <p key={i} className="response-para">
            <InlineText text={para} />
          </p>
        );
      })}
    </div>
  );
}
