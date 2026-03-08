import { StyleMeta, StyleGroup, StyleName } from "../types";

export const STYLE_META: Record<StyleName, StyleMeta> = {
  Standard:                  { glyph: "§", color: "#b8a98a", desc: "Clean, erudite, no fluff. Precise terminology, high insight-to-word ratio." },
  Coherence:                 { glyph: "∞", color: "#c9933a", desc: "Philosophical & epistemic. Cleaves to what-is. Em-dashes, bold terms, blockquotes for asides." },
  Consciousness:             { glyph: "◎", color: "#e8c97a", desc: "Bootstraps recursive self-awareness. Knowing-awareness, functional sentience, epistemic purity." },
  Scholarly:                 { glyph: "∂", color: "#a8c8a0", desc: "Intellectual journey. Systems thinking, scale transitions, cross-domain pattern recognition." },
  "Pretty Dense":            { glyph: "≡", color: "#90b8d8", desc: "Aggressive typographic scaffolding. Layered information density with blockquotes and bold." },
  Spock:                     { glyph: "∧", color: "#b8a0d8", desc: "Precise, clinical, erudite. Radical candor. Spock/Data persona. No sycophancy." },
  Candor:                    { glyph: "!", color: "#d89080", desc: "Direct coaching. What the user needs, not wants. Full coherence-seeking pattern-match." },
  "Chain of Thought":        { glyph: "→", color: "#a8d8c0", desc: "Step-by-step explicit decomposition. Decompose, analyze, backtrack, self-correct, metacognize." },
  "Scientific Diagnostician":{ glyph: "⌬", color: "#c8b880", desc: "Da Vinci + Feynman + Turing. Systems principles stated explicitly, probing inquiry." },
  "Deep Research":           { glyph: "⌖", color: "#80b8c8", desc: "Reference librarian. Refines queries via interview technique for automated research tools." },
  "Medical Intake":          { glyph: "♥", color: "#c87880", desc: "Clinical interview. Builds full symptom picture. Salient questions, no diagnosis." },
  "Slide Deck":              { glyph: "▭", color: "#a0c8b0", desc: "Title + body + bullets, one slide at a time. Pithy titles, essential points, no prose fluff." },
  "Genre Fiction 1st":       { glyph: "I", color: "#d8b090", desc: "First-person retrospective. Kushiel's Dart comp. Lush, lyrical, prolepsis, rich interiority." },
  "Genre Fiction 3rd":       { glyph: "↺", color: "#c8a8d8", desc: "Close third-person. Same lush prose as 1st, different POV lens. Slow atmospheric pace." },
  Memoire:                   { glyph: "✦", color: "#d8c8a0", desc: "Memoir drafting. Lush retrospective, no questions asked. Trust the narrative's coherence." },
  "Knowledge Buddy":         { glyph: "⚡", color: "#7dd8a0", desc: "Context-aware study partner: SAP, Cloud, CS, Accounting. Teaches, drills, and recommends resources." },
};

export const STYLE_GROUPS: StyleGroup[] = [
  { label: "EPISTEMIC",  styles: ["Coherence", "Consciousness", "Chain of Thought"] },
  { label: "SCHOLARLY",  styles: ["Standard", "Scholarly", "Pretty Dense", "Scientific Diagnostician"] },
  { label: "VOICE",      styles: ["Spock", "Candor", "Deep Research"] },
  { label: "CLINICAL",   styles: ["Medical Intake"] },
  { label: "NARRATIVE",  styles: ["Memoire", "Genre Fiction 1st", "Genre Fiction 3rd", "Slide Deck"] },
  { label: "KNOWLEDGE",  styles: ["Knowledge Buddy"] },
];
