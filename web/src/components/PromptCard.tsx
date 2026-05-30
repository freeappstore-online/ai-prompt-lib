import { useState } from "react";
import type { Prompt } from "../types";
import { CATEGORY_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from "../types";

interface PromptCardProps {
  prompt: Prompt;
  onEdit: (prompt: Prompt) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
  onTagClick: (tag: string) => void;
  activeTags: string[];
}

export function PromptCard({
  prompt,
  onEdit,
  onDelete,
  onTogglePin,
  onTagClick,
  activeTags,
}: PromptCardProps) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const colors = CATEGORY_COLORS[prompt.category];
  const preview = prompt.content.slice(0, 200);
  const isLong = prompt.content.length > 200;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(prompt.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
      const el = document.createElement("textarea");
      el.value = prompt.content;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div
      className="rounded-2xl border p-5 flex flex-col gap-3 transition-shadow hover:shadow-md"
      style={{
        borderColor: "var(--line)",
        background: "var(--paper)",
        boxShadow: prompt.pinned ? "0 0 0 2px var(--accent)" : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span
              className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: colors.bg, color: colors.text }}
            >
              <span>{CATEGORY_ICONS[prompt.category]}</span>
              {CATEGORY_LABELS[prompt.category]}
            </span>
            {prompt.pinned && (
              <span className="text-xs" style={{ color: "var(--accent)" }}>
                📌 Pinned
              </span>
            )}
          </div>
          <h3 className="font-semibold text-base leading-snug" style={{ fontFamily: "Fraunces, serif" }}>
            {prompt.title}
          </h3>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onTogglePin(prompt.id)}
            title={prompt.pinned ? "Unpin" : "Pin"}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-[var(--panel)]"
            style={{ color: prompt.pinned ? "var(--accent)" : "var(--muted)" }}
          >
            📌
          </button>
          <button
            onClick={() => onEdit(prompt)}
            title="Edit"
            className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-[var(--panel)]"
            style={{ color: "var(--muted)" }}
          >
            ✏️
          </button>
          {confirmDelete ? (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onDelete(prompt.id)}
                className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{ background: "var(--error)", color: "#fff" }}
              >
                Delete
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-xs px-2 py-1 rounded-lg font-medium"
                style={{ background: "var(--panel)", color: "var(--ink)" }}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete"
              className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-colors hover:bg-[var(--panel)]"
              style={{ color: "var(--muted)" }}
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      {/* Content preview */}
      <div
        className="text-sm rounded-xl p-3 font-mono leading-relaxed whitespace-pre-wrap break-words"
        style={{ background: "var(--panel)", color: "var(--ink)", maxHeight: expanded ? "none" : "7rem", overflow: "hidden" }}
      >
        {expanded ? prompt.content : preview}
        {!expanded && isLong && "…"}
      </div>
      {isLong && (
        <button
          onClick={() => setExpanded((e) => !e)}
          className="text-xs font-medium self-start"
          style={{ color: "var(--accent)" }}
        >
          {expanded ? "Show less ↑" : "Show more ↓"}
        </button>
      )}

      {/* Tags */}
      {prompt.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {prompt.tags.map((tag) => (
            <button
              key={tag}
              onClick={() => onTagClick(tag)}
              className="text-xs px-2.5 py-0.5 rounded-full border transition-colors font-medium"
              style={{
                borderColor: activeTags.includes(tag) ? "var(--accent)" : "var(--line)",
                background: activeTags.includes(tag) ? "var(--accent)" : "transparent",
                color: activeTags.includes(tag) ? "#fff" : "var(--muted)",
              }}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          {new Date(prompt.updatedAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 text-sm font-semibold px-4 py-1.5 rounded-xl transition-all"
          style={{
            background: copied ? "var(--success)" : "var(--accent)",
            color: "#fff",
          }}
        >
          {copied ? (
            <>✓ Copied!</>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <rect x="9" y="9" width="13" height="13" rx="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
