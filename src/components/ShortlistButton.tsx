import { Check, Plus } from "lucide-react";
import clsx from "clsx";
import type { ShortlistItem } from "@/types";
import { useShortlistStore, useIsShortlisted } from "@/store/useShortlistStore";

interface ShortlistButtonProps {
  item: ShortlistItem;
  /** "compact" is used inside dense list cards; "full" on the detail page. */
  size?: "compact" | "full";
  className?: string;
}

export function ShortlistButton({
  item,
  size = "compact",
  className,
}: ShortlistButtonProps) {
  const toggle = useShortlistStore((s) => s.toggle);
  const shortlisted = useIsShortlisted(item.user_id);

  return (
    <button
      type="button"
      aria-pressed={shortlisted}
      aria-label={
        shortlisted
          ? `Remove @${item.username} from shortlist`
          : `Add @${item.username} to shortlist`
      }
      onClick={(e) => {
        // Cards are clickable links; don't navigate when toggling.
        e.stopPropagation();
        e.preventDefault();
        toggle(item);
      }}
      className={clsx(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
        size === "compact" ? "px-3 py-1.5 text-xs" : "px-4 py-2 text-sm",
        shortlisted
          ? "bg-indigo-600 text-white hover:bg-indigo-700"
          : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100",
        className
      )}
    >
      {shortlisted ? (
        <>
          <Check className="h-4 w-4" aria-hidden="true" />
          Added
        </>
      ) : (
        <>
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add to list
        </>
      )}
    </button>
  );
}
