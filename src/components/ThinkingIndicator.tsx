interface Props {
  styleName: string;
}

export function ThinkingIndicator({ styleName }: Props) {
  return (
    <div className="thinking">
      <div className="thinking-dots">
        <span /><span /><span />
      </div>
      <span className="thinking-label">invoking {styleName}…</span>
    </div>
  );
}
