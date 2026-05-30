export type PromptCategory = "prompt" | "agent" | "template" | "brief";

export interface Prompt {
  id: string;
  title: string;
  content: string;
  category: PromptCategory;
  tags: string[];
  createdAt: number;
  updatedAt: number;
  pinned?: boolean;
}

export const CATEGORY_LABELS: Record<PromptCategory, string> = {
  prompt: "Prompt",
  agent: "Agent Instruction",
  template: "Template",
  brief: "Project Brief",
};

export const CATEGORY_ICONS: Record<PromptCategory, string> = {
  prompt: "✦",
  agent: "🤖",
  template: "📄",
  brief: "📋",
};

export const CATEGORY_COLORS: Record<PromptCategory, { bg: string; text: string }> = {
  prompt: { bg: "#dbeafe", text: "#1d4ed8" },
  agent: { bg: "#fce7f3", text: "#be185d" },
  template: { bg: "#dcfce7", text: "#15803d" },
  brief: { bg: "#fef3c7", text: "#b45309" },
};
