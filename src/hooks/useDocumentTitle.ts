import { useEffect } from "react";

/**
 * Sets the browser tab title for the lifetime of the calling component,
 * restoring the previous title on unmount. Kept separate from the visible
 * on-page <h1> (Layout's `title` prop), since the two don't always match
 * (e.g. the profile detail page renders its own <h1>, so Layout gets "").
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
