import { useState, useEffect, useCallback } from "react";
import type { Prompt, PromptCategory } from "../types";

const STORAGE_KEY = "promptvault_prompts";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setPrompts(JSON.parse(raw));
      } else {
        // Seed with examples
        const examples: Prompt[] = [
          {
            id: generateId(),
            title: "Explain Like I'm 5",
            content:
              "Explain the following concept in simple terms that a 5-year-old could understand. Use analogies and avoid jargon.\n\nConcept: {{concept}}",
            category: "prompt",
            tags: ["explain", "simplify", "education"],
            createdAt: Date.now() - 86400000 * 3,
            updatedAt: Date.now() - 86400000 * 3,
            pinned: true,
          },
          {
            id: generateId(),
            title: "Code Review Agent",
            content:
              "You are an expert senior software engineer conducting a thorough code review. Your job is to:\n- Identify bugs, security vulnerabilities, and performance issues\n- Suggest improvements for readability and maintainability\n- Point out missing edge cases\n- Praise what's done well\n\nBe constructive, specific, and provide code examples for your suggestions.",
            category: "agent",
            tags: ["code", "review", "engineering"],
            createdAt: Date.now() - 86400000 * 2,
            updatedAt: Date.now() - 86400000 * 2,
            pinned: true,
          },
          {
            id: generateId(),
            title: "Blog Post Template",
            content:
              "# {{Title}}\n\n**Target audience:** {{audience}}\n**Goal:** {{goal}}\n\n## Introduction\n[Hook the reader with a compelling opening. State the problem.]\n\n## Main Points\n1. [Point 1 with supporting evidence]\n2. [Point 2 with supporting evidence]\n3. [Point 3 with supporting evidence]\n\n## Conclusion\n[Summarize key takeaways and include a call to action.]\n\n**SEO keywords:** {{keywords}}",
            category: "template",
            tags: ["writing", "blog", "content"],
            createdAt: Date.now() - 86400000,
            updatedAt: Date.now() - 86400000,
          },
          {
            id: generateId(),
            title: "SaaS Landing Page Brief",
            content:
              "## Project Brief: Landing Page\n\n**Product:** {{product_name}}\n**Tagline:** {{tagline}}\n\n### Target Audience\n{{describe target users}}\n\n### Core Value Proposition\n{{what problem does this solve and how}}\n\n### Key Features to Highlight\n1. \n2. \n3. \n\n### Tone & Style\n- Voice: {{e.g. professional, playful, bold}}\n- Competitors to differentiate from: {{list}}\n\n### Deliverables\n- Hero section copy\n- Features section (3 cards)\n- Social proof / testimonials\n- CTA copy\n- FAQ (5 questions)",
            category: "brief",
            tags: ["saas", "marketing", "copywriting"],
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ];
        setPrompts(examples);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(examples));
      }
    } catch {
      setPrompts([]);
    }
  }, []);

  const save = useCallback((updated: Prompt[]) => {
    setPrompts(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  }, []);

  const addPrompt = useCallback(
    (data: Omit<Prompt, "id" | "createdAt" | "updatedAt">) => {
      const now = Date.now();
      const newPrompt: Prompt = { ...data, id: generateId(), createdAt: now, updatedAt: now };
      save([newPrompt, ...prompts]);
      return newPrompt;
    },
    [prompts, save]
  );

  const updatePrompt = useCallback(
    (id: string, data: Partial<Omit<Prompt, "id" | "createdAt">>) => {
      const updated = prompts.map((p) =>
        p.id === id ? { ...p, ...data, updatedAt: Date.now() } : p
      );
      save(updated);
    },
    [prompts, save]
  );

  const deletePrompt = useCallback(
    (id: string) => {
      save(prompts.filter((p) => p.id !== id));
    },
    [prompts, save]
  );

  const togglePin = useCallback(
    (id: string) => {
      const updated = prompts.map((p) => (p.id === id ? { ...p, pinned: !p.pinned } : p));
      save(updated);
    },
    [prompts, save]
  );

  const allTags = Array.from(new Set(prompts.flatMap((p) => p.tags))).sort();

  const filterPrompts = useCallback(
    (opts: { search?: string; tags?: string[]; category?: PromptCategory | "all" }) => {
      let result = [...prompts];
      if (opts.category && opts.category !== "all") {
        result = result.filter((p) => p.category === opts.category);
      }
      if (opts.tags && opts.tags.length > 0) {
        result = result.filter((p) => opts.tags!.every((t) => p.tags.includes(t)));
      }
      if (opts.search && opts.search.trim()) {
        const q = opts.search.toLowerCase();
        result = result.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.content.toLowerCase().includes(q) ||
            p.tags.some((t) => t.toLowerCase().includes(q))
        );
      }
      // Pinned first, then by updatedAt desc
      result.sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return b.updatedAt - a.updatedAt;
      });
      return result;
    },
    [prompts]
  );

  return { prompts, allTags, addPrompt, updatePrompt, deletePrompt, togglePin, filterPrompts };
}
