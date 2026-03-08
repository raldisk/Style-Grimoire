// Strict union of all valid style names — adding a style requires updating this type.
export type StyleName =
  | "Standard"
  | "Coherence"
  | "Consciousness"
  | "Scholarly"
  | "Pretty Dense"
  | "Spock"
  | "Candor"
  | "Chain of Thought"
  | "Scientific Diagnostician"
  | "Deep Research"
  | "Medical Intake"
  | "Slide Deck"
  | "Genre Fiction 1st"
  | "Genre Fiction 3rd"
  | "Memoire"
  | "Knowledge Buddy";

export interface StyleMeta {
  glyph: string;
  color: string;
  desc: string;
}

export interface StyleGroup {
  label: string;
  styles: StyleName[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface AnthropicMessage {
  role: "user" | "assistant";
  content: string;
}

// Structured API response type — no implicit any
export interface ClaudeResponse {
  content: Array<{
    type: "text" | string;
    text?: string;
  }>;
  error?: { message: string; status?: number };
}
