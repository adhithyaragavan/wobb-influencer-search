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

export interface SearchAccount {
  account: {
    user_profile: UserProfileSummary;
    audience_source: string;
  };
}

export interface SearchData {
  total: number;
  accounts: SearchAccount[];
}

export interface FullUserProfile extends UserProfileSummary {
  type?: string;
  description?: string;
  is_business?: boolean;
  posts_count?: number;
  avg_likes?: number;
  avg_comments?: number;
  avg_reels_plays?: number;
  gender?: string;
  age_group?: string;
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
