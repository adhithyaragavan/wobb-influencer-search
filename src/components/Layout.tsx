import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Bookmark } from "lucide-react";
import { useShortlistStore } from "@/store/useShortlistStore";
import { ShortlistPanel } from "./ShortlistPanel";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: ReactNode;
}

export function Layout({ children, title, subtitle }: LayoutProps) {
  const [panelOpen, setPanelOpen] = useState(false);
  const count = useShortlistStore((s) => s.items.length);

  return (
    <div className="min-h-svh">
      {/* Keep background content out of the tab order and hidden from
          assistive tech while the shortlist dialog is open, since it isn't
          a full focus trap. */}
      <header
        inert={panelOpen}
        className="sticky top-0 z-30 border-b border-slate-200 bg-white/80 backdrop-blur"
      >
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg text-lg font-bold tracking-tight text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <span
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-500 text-sm font-black text-white"
              aria-hidden="true"
            >
              W
            </span>
            Wobb <span className="hidden text-slate-400 sm:inline">Creators</span>
          </Link>

          <button
            type="button"
            onClick={() => setPanelOpen(true)}
            className="relative inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            aria-label={`Open shortlist, ${count} ${
              count === 1 ? "profile" : "profiles"
            }`}
          >
            <Bookmark className="h-4 w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Shortlist</span>
            {count > 0 && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      <main inert={panelOpen} className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
        {(title || subtitle) && (
          <div className="mb-6">
            {title && (
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {title}
              </h1>
            )}
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
          </div>
        )}
        {children}
      </main>

      <ShortlistPanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </div>
  );
}
