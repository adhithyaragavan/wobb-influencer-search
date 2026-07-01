import { useEffect, useState } from "react";
import type { FullUserProfile, Platform } from "@/types";
import { loadProfileByUsername } from "@/utils/profileLoader";

type Status = "loading" | "loaded" | "error";

interface UseProfileResult {
  profile: FullUserProfile | null;
  status: Status;
}

interface ResolvedEntry {
  username: string;
  profile: FullUserProfile | null;
  status: "loaded" | "error";
}

/**
 * Loads a full profile by username (disambiguated by platform when known —
 * see profileLoader.ts). Guards against out-of-order responses: results are
 * tagged with the username they belong to, and the loading state is derived
 * (not set synchronously in the effect), so a slow response for a previous
 * username can never overwrite the current one.
 */
export function useProfile(
  username: string | undefined,
  platform?: Platform | null
): UseProfileResult {
  const [entry, setEntry] = useState<ResolvedEntry | null>(null);

  useEffect(() => {
    if (!username) return;

    let active = true;
    loadProfileByUsername(username, platform ?? undefined)
      .then((data) => {
        if (!active) return;
        setEntry({
          username,
          profile: data ? data.data.user_profile : null,
          status: data ? "loaded" : "error",
        });
      })
      .catch(() => {
        if (active) setEntry({ username, profile: null, status: "error" });
      });

    return () => {
      active = false;
    };
  }, [username, platform]);

  const isCurrent = entry !== null && entry.username === username;
  return {
    profile: isCurrent ? entry.profile : null,
    status: isCurrent ? entry.status : "loading",
  };
}
