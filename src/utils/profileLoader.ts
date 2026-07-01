import type { Platform, ProfileDetailResponse } from "@/types";

const profileModules = import.meta.glob<unknown>("../assets/data/profiles/*.json");

/**
 * Minimal runtime check for the shape the app actually reads
 * (`data.user_profile`). Replaces a blind `as ProfileDetailResponse` cast so
 * a malformed/truncated profile JSON fails gracefully into the existing
 * "could not load" UI instead of crashing later when a field is accessed.
 */
function isProfileDetailResponse(value: unknown): value is ProfileDetailResponse {
  if (typeof value !== "object" || value === null) return false;
  const data = (value as Record<string, unknown>).data;
  if (typeof data !== "object" || data === null) return false;
  const userProfile = (data as Record<string, unknown>).user_profile;
  return typeof userProfile === "object" && userProfile !== null;
}

async function loadFromPath(path: string): Promise<ProfileDetailResponse | null> {
  const loader = profileModules[path];
  if (!loader) return null;
  const result = await loader();
  const data = (result as { default?: unknown }).default ?? result;
  return isProfileDetailResponse(data) ? data : null;
}

/**
 * Detail files are keyed by username, e.g. `cristiano.json`. That convention
 * breaks when the same (or very similar) handle is used by different people
 * on different platforms — e.g. YouTube's "MrBeast" and TikTok's "mrbeast" —
 * which also collide outright on case-insensitive filesystems (macOS/Windows)
 * even though the repo is on a case-sensitive one (Linux CI/deploy). When the
 * platform is known, a `${username}-${platform}.json` file is tried first to
 * disambiguate; the plain `${username}.json` remains the fallback for the
 * (more common) case where no collision exists.
 */
export async function loadProfileByUsername(
  username: string,
  platform?: Platform
): Promise<ProfileDetailResponse | null> {
  if (platform) {
    const disambiguated = await loadFromPath(
      `../assets/data/profiles/${username}-${platform}.json`
    );
    if (disambiguated) return disambiguated;
  }
  return loadFromPath(`../assets/data/profiles/${username}.json`);
}
