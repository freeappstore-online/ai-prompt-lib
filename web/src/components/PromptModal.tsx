import { useState, useEffect, useRef } from "react";
import type { Prompt, PromptCategory } from "../types";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "../types";

interface PromptModalProps {
  open: boolean;
  initial?: Prompt | null;
  onSave: (data: Omit<Prompt, "id" | "createdAt" | "updatedAt">) => void;
  onClose: () => void;
}

const CATEGORIES: PromptCategory[] = ["prompt", "agent", "template", "brief"];

export function PromptModal({ open, initial, onSave, onClose }: PromptModalProps) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PromptCategory>("prompt");
  const [tagsInput, setTagsInput] = useState("");
  const [pinned, setPinned] = useState(false);
  const [error, setError] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setContent(initial?.content ?? "");
      setCategory(initial?.category ?? "prompt");
      setTagsInput(initial?.tags.join(", ") ?? "");
      setPinned(initial?.pinned ?? false);
      setError("");
      setTimeout(() => titleRef.current?.focus(), 50);
    }
  }, [open, initial]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!content.trim()) {
      setError("Content is required.");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim().toLowerCase().replace(/\s+/g, "-"))
      .filter(Boolean);

    onSave({ title: title.trim(), content: content.trim(), category, tags, pinned });
    onClose();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-2xl rounded-2xl border flex flex-col max-h-[92vh]"
        style={{ background: "var(--paper)", borderColor: "var(--line)" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: "var(--line)" }}>
          <h2 className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>
            {initial ? "Edit Prompt" : "New Prompt"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors hover:bg-[var(--panel)]"
            style={{ color: "var(--muted)" }}
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 overflow-y-auto flex-1">
          {error && (
            <div className="text-sm px-3 py-2 rounded-xl" style={{ background: "#fee2e2", color: "var(--error)" }}>
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: "var(--ink)" }}>
              Type
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-xl border font-medium transition-all"
                  style={{
                    borderColor: category === cat ? "var(--accent)" : "var(--line)",
                    background: category === cat ? "var(--accent)" : "transparent",
                    color: category === cat ? "#fff" : "var(--ink)",
                  }}
                >
                  <span>{CATEGORY_ICONS[cat]}</span>
                  {CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
              Title
            </label>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Code Review Agent"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors"
              style={{
                borderColor: "var(--line)",
                background: "var(--panel)",
                color: "var(--ink)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
              Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your prompt, agent instructions, or template here…"
              rows={10}
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors font-mono resize-y leading-relaxed"
              style={{
                borderColor: "var(--line)",
                background: "var(--panel)",
                color: "var(--ink)",
                minHeight: "12rem",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
            />
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Use {"{{variable}}"} placeholders for reusable templates.
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-1.5" style={{ color: "var(--ink)" }}>
              Tags{" "}
              <span className="font-normal" style={{ color: "var(--muted)" }}>
                (comma-separated)
              </span>
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. code, review, engineering"
              className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors"
              style={{
                borderColor: "var(--line)",
                background: "var(--panel)",
                color: "var(--ink)",
              }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
            />
          </div>

          {/* Pin */}
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => setPinned((p) => !p)}
              className="w-10 h-6 rounded-full relative transition-colors shrink-0"
              style={{ background: pinned ? "var(--accent)" : "var(--line)" }}
            >
              <div
                className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform"
                style={{ transform: pinned ? "translateX(1.25rem)" : "translateX(0.125rem)" }}
              />
            </div>
            <span className="text-sm font-medium">Pin to top</span>
          </label>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t" style={{ borderColor: "var(--line)" }}>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-semibold border transition-colors"
            style={{ borderColor: "var(--line)", color: "var(--ink)", background: "transparent" }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-5 py-2 rounded-xl text-sm font-semibold transition-colors"
            style={{ background: "var(--accent)", color: "#fff" }}
          >
            {initial ? "Save Changes" : "Add Prompt"}
          </button>
        </div>
      </div>
    </div>
  );
}
