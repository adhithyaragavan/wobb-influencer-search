import type { ProfileDetailResponse } from "@/types";

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

export async function loadProfileByUsername(
  username: string
): Promise<ProfileDetailResponse | null> {
  const path = `../assets/data/profiles/${username}.json`;
  const loader = profileModules[path];

  if (!loader) {
    return null;
  }

  const result = await loader();
  const data = (result as { default?: unknown }).default ?? result;
  return isProfileDetailResponse(data) ? data : null;
}
