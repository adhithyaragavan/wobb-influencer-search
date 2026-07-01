import { SearchX } from "lucide-react";
import type { Platform, UserProfileSummary } from "@/types";
import { ProfileCard } from "./ProfileCard";

interface ProfileListProps {
  profiles: UserProfileSummary[];
  platform: Platform;
}

export function ProfileList({ profiles, platform }: ProfileListProps) {
  if (profiles.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-white/50 py-16 text-center">
        <SearchX className="h-8 w-8 text-slate-400" aria-hidden="true" />
        <p className="text-sm font-medium text-slate-600">No profiles found</p>
        <p className="text-xs text-slate-400">
          Try a different name or switch platforms.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.user_id}
          profile={profile}
          platform={platform}
        />
      ))}
    </div>
  );
}
