import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ShortlistItem } from "@/types";

interface ShortlistState {
  items: ShortlistItem[];
  /** Add a profile if it isn't already shortlisted (deduped by user_id). */
  add: (item: ShortlistItem) => void;
  /** Remove a profile from the shortlist. */
  remove: (userId: string) => void;
  /** Add if absent, remove if present. */
  toggle: (item: ShortlistItem) => void;
  /** Empty the shortlist. */
  clear: () => void;
}

export const useShortlistStore = create<ShortlistState>()(
  persist(
    (set, get) => ({
      items: [],
      add: (item) =>
        set((state) =>
          state.items.some((i) => i.user_id === item.user_id)
            ? state
            : { items: [...state.items, item] }
        ),
      remove: (userId) =>
        set((state) => ({
          items: state.items.filter((i) => i.user_id !== userId),
        })),
      toggle: (item) =>
        get().items.some((i) => i.user_id === item.user_id)
          ? get().remove(item.user_id)
          : get().add(item),
      clear: () => set({ items: [] }),
    }),
    {
      name: "wobb:shortlist",
      version: 1,
      // Defends against corrupted/hand-edited localStorage (e.g. `items`
      // missing or not an array), which would otherwise crash the first
      // `.some()`/`.filter()` call on the store. Also the hook point for a
      // real migration the next time the persisted shape changes.
      merge: (persisted, current) => ({
        ...current,
        items: Array.isArray((persisted as Partial<ShortlistState> | undefined)?.items)
          ? (persisted as ShortlistState).items
          : current.items,
      }),
    }
  )
);

/**
 * Stable selector for "is this profile shortlisted?".
 * Kept as a hook so components subscribe to just this slice and
 * only re-render when their own membership changes.
 */
export const useIsShortlisted = (userId: string): boolean =>
  useShortlistStore((state) => state.items.some((i) => i.user_id === userId));
