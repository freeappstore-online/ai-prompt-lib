import { useState, useMemo } from "react";
import { Shell } from "./components/Shell";
import { PromptCard } from "./components/PromptCard";
import { PromptModal } from "./components/PromptModal";
import { usePrompts } from "./hooks/usePrompts";
import type { Prompt, PromptCategory } from "./types";
import { CATEGORY_LABELS, CATEGORY_ICONS } from "./types";

type View = "all" | PromptCategory;

const VIEWS: { id: View; label: string; icon: string }[] = [
  { id: "all", label: "All Prompts", icon: "✦" },
  { id: "prompt", label: "Prompts", icon: CATEGORY_ICONS.prompt },
  { id: "agent", label: "Agent Instructions", icon: CATEGORY_ICONS.agent },
  { id: "template", label: "Templates", icon: CATEGORY_ICONS.template },
  { id: "brief", label: "Project Briefs", icon: CATEGORY_ICONS.brief },
];

export default function App() {
  const { prompts, allTags, addPrompt, updatePrompt, deletePrompt, togglePin, filterPrompts } =
    usePrompts();

  const [view, setView] = useState<View>("all");
  const [search, setSearch] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Prompt | null>(null);

  const filtered = useMemo(
    () =>
      filterPrompts({
        search,
        tags: activeTags,
        category: view === "all" ? "all" : view,
      }),
    [filterPrompts, search, activeTags, view]
  );

  function handleTagClick(tag: string) {
    setActiveTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleEdit(prompt: Prompt) {
    setEditTarget(prompt);
    setModalOpen(true);
  }

  function handleNew() {
    setEditTarget(null);
    setModalOpen(true);
  }

  function handleSave(data: Omit<Prompt, "id" | "createdAt" | "updatedAt">) {
    if (editTarget) {
      updatePrompt(editTarget.id, data);
    } else {
      addPrompt(data);
    }
  }

  const navItems = VIEWS.map((v) => ({
    label: v.label,
    icon: <span>{v.icon}</span>,
    active: view === v.id,
    onClick: () => {
      setView(v.id);
      setActiveTags([]);
      setSearch("");
    },
  }));

  // Counts per category
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: prompts.length };
    for (const p of prompts) {
      c[p.category] = (c[p.category] ?? 0) + 1;
    }
    return c;
  }, [prompts]);

  return (
    <Shell navItems={navItems}>
      <div className="flex flex-col h-full">
        {/* Top bar */}
        <div
          className="sticky top-0 z-10 px-6 py-4 border-b flex flex-col gap-3"
          style={{ borderColor: "var(--line)", background: "var(--paper)" }}
        >
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{ color: "var(--muted)" }}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prompts, tags, content…"
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border text-sm outline-none transition-colors"
                style={{
                  borderColor: "var(--line)",
                  background: "var(--panel)",
                  color: "var(--ink)",
                }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--line)")}
              />
            </div>
            <button
              onClick={handleNew}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold shrink-0 transition-colors"
              style={{ background: "var(--accent)", color: "#fff" }}
            >
              <span className="text-lg leading-none">+</span>
              <span className="hidden sm:inline">New Prompt</span>
            </button>
          </div>

          {/* Tag filter bar */}
          {allTags.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {activeTags.length > 0 && (
                <button
                  onClick={() => setActiveTags([])}
                  className="text-xs px-2.5 py-1 rounded-full font-medium border transition-colors"
                  style={{ borderColor: "var(--error)", color: "var(--error)", background: "transparent" }}
                >
                  ✕ Clear filters
                </button>
              )}
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className="text-xs px-2.5 py-1 rounded-full border font-medium transition-all"
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
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          {/* View heading */}
          <div className="flex items-center justify-between mb-5">
            <div>
              <h1 className="text-2xl font-bold" style={{ fontFamily: "Fraunces, serif" }}>
                {view === "all" ? "All Prompts" : CATEGORY_LABELS[view as PromptCategory]}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: "var(--muted)" }}>
                {filtered.length} {filtered.length === 1 ? "item" : "items"}
                {activeTags.length > 0 && ` · filtered by ${activeTags.map((t) => `#${t}`).join(", ")}`}
              </p>
            </div>

            {/* Category quick stats */}
            <div className="hidden md:flex gap-3">
              {VIEWS.filter((v) => v.id !== "all").map((v) => (
                <button
                  key={v.id}
                  onClick={() => {
                    setView(v.id);
                    setActiveTags([]);
                    setSearch("");
                  }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-xl border transition-all font-medium"
                  style={{
                    borderColor: view === v.id ? "var(--accent)" : "var(--line)",
                    background: view === v.id ? "var(--accent)" : "var(--panel)",
                    color: view === v.id ? "#fff" : "var(--muted)",
                  }}
                >
                  {v.icon} {counts[v.id] ?? 0}
                </button>
              ))}
            </div>
          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="text-5xl">✦</div>
              <div className="text-center">
                <p className="font-semibold text-lg" style={{ fontFamily: "Fraunces, serif" }}>
                  {search || activeTags.length > 0 ? "No prompts match your filters" : "No prompts yet"}
                </p>
                <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                  {search || activeTags.length > 0
                    ? "Try a different search or clear your tag filters."
                    : "Click "New Prompt" to add your first one."}
                </p>
              </div>
              {(search || activeTags.length > 0) && (
                <button
                  onClick={() => {
                    setSearch("");
                    setActiveTags([]);
                  }}
                  className="text-sm px-4 py-2 rounded-xl font-semibold"
                  style={{ background: "var(--panel)", color: "var(--ink)" }}
                >
                  Clear filters
                </button>
              )}
              {!search && activeTags.length === 0 && (
                <button
                  onClick={handleNew}
                  className="text-sm px-5 py-2.5 rounded-xl font-semibold"
                  style={{ background: "var(--accent)", color: "#fff" }}
                >
                  + New Prompt
                </button>
              )}
            </div>
          )}

          {/* Grid */}
          {filtered.length > 0 && (
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
              {filtered.map((prompt) => (
                <PromptCard
                  key={prompt.id}
                  prompt={prompt}
                  onEdit={handleEdit}
                  onDelete={deletePrompt}
                  onTogglePin={togglePin}
                  onTagClick={handleTagClick}
                  activeTags={activeTags}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <PromptModal
        open={modalOpen}
        initial={editTarget}
        onSave={handleSave}
        onClose={() => {
          setModalOpen(false);
          setEditTarget(null);
        }}
      />
    </Shell>
  );
}
