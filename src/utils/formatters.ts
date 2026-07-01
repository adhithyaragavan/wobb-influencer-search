/**
 * Format a large number into a compact, human-readable string.
 * e.g. 678546942 -> "678.5M", 12500 -> "12.5K", 950 -> "950".
 * This is the single source of truth for follower / like / view counts,
 * replacing the three near-duplicate implementations the starter shipped with.
 */
export function formatCompact(count: number): string {
  if (!Number.isFinite(count)) return "0";

  const abs = Math.abs(count);
  const trim = (value: number) => value.toFixed(1).replace(/\.0$/, "");

  if (abs >= 1_000_000_000) return trim(count / 1_000_000_000) + "B";
  if (abs >= 1_000_000) return trim(count / 1_000_000) + "M";
  if (abs >= 1_000) return trim(count / 1_000) + "K";
  return String(count);
}

/**
 * Format an engagement rate fraction (e.g. 0.012551) as a percentage ("1.26%").
 */
export function formatEngagementRate(rate: number | undefined): string {
  if (rate === undefined) return "N/A";
  return (rate * 100).toFixed(2) + "%";
}
