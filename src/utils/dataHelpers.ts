import instagramData from "@/assets/data/search/instagram.json";
import youtubeData from "@/assets/data/search/youtube.json";
import tiktokData from "@/assets/data/search/tiktok.json";
import type {
  Platform,
  SearchData,
  ShortlistItem,
  UserProfileSummary,
} from "@/types";

const platformData: Record<Platform, SearchData> = {
  instagram: instagramData as SearchData,
  youtube: youtubeData as SearchData,
  tiktok: tiktokData as SearchData,
};

export function getSearchData(platform: Platform): SearchData {
  return platformData[platform];
}

/**
 * Some YouTube entries in the sample data have no `username` field (channels
 * are identified by `handle` instead), which crashed search/navigation
 * downstream. Normalize once here so every UserProfileSummary is guaranteed
 * a non-empty `username`.
 */
export function extractProfiles(platform: Platform): UserProfileSummary[] {
  const data = getSearchData(platform);
  return data.accounts.map((item) => {
    const profile = item.account.user_profile;
    return {
      ...profile,
      username: profile.username || profile.handle || profile.user_id,
    };
  });
}

export function filterProfiles(
  profiles: UserProfileSummary[],
  query: string
): UserProfileSummary[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return profiles;
  return profiles.filter((p) => {
    const matchUsername = p.username.toLowerCase().includes(normalized);
    const matchFullname = p.fullname.toLowerCase().includes(normalized);
    return matchUsername || matchFullname;
  });
}

export const PLATFORMS: Platform[] = ["instagram", "youtube", "tiktok"];

export function getPlatformLabel(platform: Platform): string {
  if (platform === "instagram") return "Instagram";
  if (platform === "youtube") return "YouTube";
  return "TikTok";
}

/** Project a (summary or full) profile into the minimal shape we persist. */
export function toShortlistItem(
  profile: UserProfileSummary,
  platform: Platform
): ShortlistItem {
  return {
    user_id: profile.user_id,
    username: profile.username,
    fullname: profile.fullname,
    picture: profile.picture,
    followers: profile.followers,
    is_verified: profile.is_verified,
    platform,
  };
}
