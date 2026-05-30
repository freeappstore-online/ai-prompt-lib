import type { ReactNode } from "react";

interface NavItem {
  label: string;
  icon: ReactNode;
  onClick: () => void;
  active?: boolean;
}

interface ShellProps {
  children: ReactNode;
  navItems?: NavItem[];
  activeView?: string;
}

export function Shell({ children, navItems = [] }: ShellProps) {
  return (
    <>
      {/* Desktop */}
      <div className="hidden md:flex h-screen">
        <aside
          className="flex flex-col border-r h-full shrink-0"
          style={{ width: "17rem", borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <div className="p-6 pb-2">
            <div className="font-bold text-xl" style={{ fontFamily: "Fraunces, serif" }}>
              PromptVault
            </div>
            <div className="text-xs mt-1" style={{ color: "var(--muted)" }}>
              Your local AI prompt library
            </div>
          </div>
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium w-full text-left transition-colors"
                style={{
                  background: item.active ? "var(--accent)" : "transparent",
                  color: item.active ? "#fff" : "var(--ink)",
                }}
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
          <div className="p-4 text-xs" style={{ color: "var(--muted)" }}>
            <a
              href="https://freeappstore.online"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline"
              style={{ color: "var(--muted)" }}
            >
              Part of FreeAppStore — free forever
            </a>
          </div>
        </aside>
        <main className="flex-1 overflow-auto" style={{ background: "var(--paper)" }}>
          {children}
        </main>
      </div>

      {/* Mobile */}
      <div className="flex flex-col h-screen md:hidden">
        <header
          className="flex items-center px-4 h-14 border-b shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--panel)" }}
        >
          <span className="font-bold text-lg" style={{ fontFamily: "Fraunces, serif" }}>
            PromptVault
          </span>
        </header>
        <main className="flex-1 overflow-auto" style={{ background: "var(--paper)" }}>
          {children}
        </main>
        <nav
          className="flex items-center justify-around h-16 border-t shrink-0"
          style={{ borderColor: "var(--line)", background: "var(--dock)" }}
        >
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={item.onClick}
              className="flex flex-col items-center gap-1 px-3 py-1 text-xs font-medium transition-colors"
              style={{ color: item.active ? "var(--accent)" : "var(--muted)" }}
            >
              <span className="text-xl">{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}
