import { useEffect, useState } from "react";

/**
 * Returns a debounced copy of `value` that only updates after `delay` ms of
 * no changes. Used to keep the search input responsive while filtering runs
 * at most once per pause in typing.
 */
export function useDebouncedValue<T>(value: T, delay = 200): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    // Clearing (e.g. resetting search on a platform switch) should apply
    // instantly rather than lag behind — only non-empty typing is debounced.
    const id = setTimeout(() => setDebounced(value), value === "" ? 0 : delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
