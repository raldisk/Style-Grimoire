import { STYLE_GROUPS, STYLE_META } from "../data/styles";
import { StyleName } from "../types";

interface Props {
  selected: StyleName;
  onSelect: (style: StyleName) => void;
}

export function Sidebar({ selected, onSelect }: Props) {
  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">Style Grimoire</div>
        <div className="sidebar-sub">Claude · Style Selector</div>
      </div>

      {STYLE_GROUPS.map((group) => (
        <div
          className={`style-group${group.label === "KNOWLEDGE" ? " knowledge" : ""}`}
          key={group.label}
        >
          <div className="group-label">{group.label}</div>
          {group.styles.map((name) => {
            const meta = STYLE_META[name];
            const isKB = name === "Knowledge Buddy";
            return (
              <button
                key={name}
                className={`style-btn${selected === name ? " active" : ""}`}
                style={{ "--accent": meta.color } as React.CSSProperties}
                onClick={() => onSelect(name)}
                title={meta.desc}
              >
                <span className="style-glyph">{meta.glyph}</span>
                <span className="style-name">{name}</span>
                {isKB && <span className="style-new-badge">NEW</span>}
              </button>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
