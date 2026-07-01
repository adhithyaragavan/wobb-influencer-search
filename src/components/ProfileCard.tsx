import { memo } from "react";
import { Link } from "react-router-dom";
import type { Platform, UserProfileSummary } from "@/types";
import { formatCompact, formatEngagementRate } from "@/utils/formatters";
import { toShortlistItem } from "@/utils/dataHelpers";
import { VerifiedBadge } from "./VerifiedBadge";
import { ShortlistButton } from "./ShortlistButton";

interface ProfileCardProps {
  profile: UserProfileSummary;
  platform: Platform;
}

function ProfileCardComponent({ profile, platform }: ProfileCardProps) {
  return (
    <Link
      to={`/profile/${profile.username}?platform=${platform}`}
      className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
    >
      <img
        src={profile.picture}
        alt={`${profile.fullname} profile photo`}
        loading="lazy"
        className="h-14 w-14 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="truncate font-semibold text-slate-900 group-hover:text-indigo-700">
            @{profile.username}
          </span>
          <VerifiedBadge verified={profile.is_verified} />
        </div>
        <p className="truncate text-sm text-slate-500">{profile.fullname}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600">
          <span>
            <span className="font-semibold text-slate-900">
              {formatCompact(profile.followers)}
            </span>{" "}
            followers
          </span>
          {profile.engagement_rate !== undefined && (
            <span>
              <span className="font-semibold text-slate-900">
                {formatEngagementRate(profile.engagement_rate)}
              </span>{" "}
              engagement
            </span>
          )}
        </div>
      </div>

      <ShortlistButton item={toShortlistItem(profile, platform)} />
    </Link>
  );
}

export const ProfileCard = memo(ProfileCardComponent);
