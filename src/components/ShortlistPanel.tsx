import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Trash2, X } from "lucide-react";
import { useShortlistStore } from "@/store/useShortlistStore";
import { getPlatformLabel } from "@/utils/dataHelpers";
import { formatCompact } from "@/utils/formatters";
import { Avatar } from "./Avatar";

interface ShortlistPanelProps {
  open: boolean;
  onClose: () => void;
}

export function ShortlistPanel({ open, onClose }: ShortlistPanelProps) {
  const items = useShortlistStore((s) => s.items);
  const remove = useShortlistStore((s) => s.remove);
  const clear = useShortlistStore((s) => s.clear);
  const panelRef = useRef<HTMLElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // Move focus into the dialog on open, and back to whatever triggered it
  // (the header's "Shortlist" button) on close, per the modal dialog pattern.
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      triggerRef.current?.focus();
    }
  }, [open]);

  // Escape closes the dialog, matching standard modal keyboard behavior.
  useEffect(() => {
    if (!open) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            aria-hidden="true"
          />
          <motion.aside
            ref={panelRef}
            tabIndex={-1}
            className="fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Shortlisted profiles"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 34 }}
          >
            <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Shortlist{" "}
                <span className="text-slate-400">({items.length})</span>
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close shortlist"
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </header>

            <div className="flex-1 overflow-y-auto px-3 py-3">
              {items.length === 0 ? (
                <p className="mt-10 px-4 text-center text-sm text-slate-500">
                  No profiles shortlisted yet. Tap{" "}
                  <span className="font-medium text-indigo-600">Add to list</span>{" "}
                  on any creator to save them here.
                </p>
              ) : (
                <ul className="space-y-1">
                  <AnimatePresence initial={false}>
                    {items.map((item) => (
                      <motion.li
                        key={item.user_id}
                        layout
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: 24 }}
                        className="flex items-center gap-3 rounded-xl p-2 hover:bg-slate-50"
                      >
                        <Link
                          to={`/profile/${item.username}?platform=${item.platform}`}
                          state={{ summary: item }}
                          onClick={onClose}
                          className="flex min-w-0 flex-1 items-center gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                          <Avatar
                            src={item.picture}
                            alt=""
                            label={item.fullname}
                            className="h-10 w-10"
                          />
                          <div className="min-w-0 text-left">
                            <p className="truncate text-sm font-medium text-slate-900">
                              @{item.username}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {formatCompact(item.followers)} ·{" "}
                              {getPlatformLabel(item.platform)}
                            </p>
                          </div>
                        </Link>
                        <button
                          type="button"
                          onClick={() => remove(item.user_id)}
                          aria-label={`Remove @${item.username} from shortlist`}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </ul>
              )}
            </div>

            {items.length > 0 && (
              <footer className="border-t border-slate-100 px-5 py-3">
                <button
                  type="button"
                  onClick={clear}
                  className="w-full rounded-lg py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500"
                >
                  Clear all
                </button>
              </footer>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
