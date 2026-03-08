import { Sidebar } from "./components/Sidebar";
import { MainPanel } from "./components/MainPanel";
import { useStyleStudio } from "./hooks/useStyleStudio";
import "./styles/global.css";

export default function App() {
  const studio = useStyleStudio();

  return (
    <div className="studio-shell">
      <Sidebar selected={studio.selectedStyle} onSelect={studio.switchStyle} />
      <MainPanel
        selected={studio.selectedStyle}
        history={studio.history}
        loading={studio.loading}
        error={studio.error}
        prompt={studio.prompt}
        setPrompt={studio.setPrompt}
        onGenerate={studio.generate}
        onClear={studio.clear}
        turnCount={studio.turnCount}
      />
    </div>
  );
}
