export type Platform = "instagram" | "youtube" | "tiktok";

export interface UserProfileSummary {
  user_id: string;
  username: string;
  url: string;
  picture: string;
  fullname: string;
  is_verified: boolean;
  followers: number;
  engagements?: number;
  engagement_rate?: number;
  handle?: string;
  avg_views?: number;
}

/**
 * The actual shape of a profile inside the raw search JSON. Some entries
 * (a few YouTube channels) have no `username` at all — only `handle` — so
 * unlike `UserProfileSummary`, `username` here is honestly optional.
 * `extractProfiles` (dataHelpers.ts) is the only place that should read this
 * type; everywhere else should consume the normalized `UserProfileSummary`.
 */
export type RawSearchProfile = Omit<UserProfileSummary, "username"> & {
  username?: string;
};

export interface SearchAccount {
  account: {
    user_profile: RawSearchProfile;
    audience_source: string;
  };
}

export interface SearchData {
  total: number;
  accounts: SearchAccount[];
}

export interface FullUserProfile extends UserProfileSummary {
  description?: string;
  posts_count?: number;
  avg_likes?: number;
  avg_comments?: number;
}

/**
 * A profile saved to the user's shortlist. Stores just enough to render the
 * shortlist panel without re-fetching, plus the platform it was found on.
 */
export interface ShortlistItem {
  user_id: string;
  username: string;
  fullname: string;
  picture: string;
  followers: number;
  is_verified: boolean;
  platform: Platform;
}

export interface ProfileDetailResponse {
  cached?: boolean;
  data: {
    success: boolean;
    user_profile: FullUserProfile;
  };
}
