import { useMemo } from "react";
import { Link, useLocation, useParams, useSearchParams } from "react-router-dom";
import { AlertTriangle, ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Layout } from "@/components/Layout";
import { Avatar } from "@/components/Avatar";
import { VerifiedBadge } from "@/components/VerifiedBadge";
import { ShortlistButton } from "@/components/ShortlistButton";
import type { FullUserProfile, Platform, ShortlistItem, UserProfileSummary } from "@/types";
import { formatCompact, formatEngagementRate } from "@/utils/formatters";
import { PLATFORMS, getPlatformLabel, toShortlistItem } from "@/utils/dataHelpers";
import { useProfile } from "@/hooks/useProfile";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

type Stat = { label: string; value: string | number };

/** Whatever we might already have for a profile before its full detail JSON loads. */
type ProfileSummaryLike = Pick<
  UserProfileSummary,
  "user_id" | "username" | "fullname" | "picture" | "is_verified" | "followers"
> &
  Partial<Pick<UserProfileSummary, "engagement_rate" | "url">>;

function buildStats(user: FullUserProfile): Stat[] {
  const stats: Stat[] = [
    { label: "Followers", value: formatCompact(user.followers) },
    { label: "Engagement Rate", value: formatEngagementRate(user.engagement_rate) },
  ];
  if (user.engagements !== undefined)
    stats.push({ label: "Engagements", value: user.engagements.toLocaleString() });
  if (user.posts_count !== undefined)
    stats.push({ label: "Posts", value: user.posts_count.toLocaleString() });
  if (user.avg_likes !== undefined)
    stats.push({ label: "Avg Likes", value: formatCompact(user.avg_likes) });
  if (user.avg_comments !== undefined)
    stats.push({ label: "Avg Comments", value: formatCompact(user.avg_comments) });
  if (user.avg_views !== undefined && user.avg_views > 0)
    stats.push({ label: "Avg Views", value: formatCompact(user.avg_views) });
  return stats;
}

function buildSummaryStats(summary: ProfileSummaryLike): Stat[] {
  const stats: Stat[] = [{ label: "Followers", value: formatCompact(summary.followers) }];
  if (summary.engagement_rate !== undefined)
    stats.push({ label: "Engagement Rate", value: formatEngagementRate(summary.engagement_rate) });
  return stats;
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-lg font-bold text-slate-900">{value}</dd>
    </div>
  );
}

const BackLink = () => (
  <Link
    to="/"
    className="mb-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-slate-500 hover:text-indigo-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
  >
    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
    Back to search
  </Link>
);

export function ProfileDetailPage() {
  const { username } = useParams<{ username: string }>();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const platformParam = searchParams.get("platform") ?? "";
  const isValidPlatform = PLATFORMS.includes(platformParam as Platform);
  const platform = isValidPlatform ? (platformParam as Platform) : null;
  const platformLabel = platform ? getPlatformLabel(platform) : "Unknown";
  const { profile: user, status } = useProfile(username, platform);
  const stats = useMemo(() => (user ? buildStats(user) : []), [user]);

  // Passed via router `state` from the search/shortlist card the user came
  // from. Lets a profile with no full-detail JSON still render something
  // useful instead of a hard error, using data we already had in hand.
  const summary = (location.state as { summary?: ProfileSummaryLike } | null)?.summary;
  const summaryStats = useMemo(
    () => (summary ? buildSummaryStats(summary) : []),
    [summary]
  );

  useDocumentTitle(
    !username
      ? "Profile · Wobb"
      : status === "loaded" && user
        ? `@${user.username} · Wobb`
        : status === "error"
          ? `@${username} not found · Wobb`
          : `Loading @${username}… · Wobb`
  );

  if (!username) {
    return (
      <Layout title="Profile">
        <BackLink />
        <p className="text-slate-600">Invalid profile.</p>
      </Layout>
    );
  }

  if (status === "loading") {
    return (
      <Layout title={`@${username}`}>
        <BackLink />
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
          <span>Loading profile…</span>
        </div>
      </Layout>
    );
  }

  // Full detail JSON is missing but we have a summary from the card the user
  // clicked — render a lighter profile view instead of a dead end.
  if ((status === "error" || !user) && summary) {
    const shortlistItem: ShortlistItem = {
      user_id: summary.user_id,
      username: summary.username,
      fullname: summary.fullname,
      picture: summary.picture,
      followers: summary.followers,
      is_verified: summary.is_verified,
      platform: platform ?? "instagram",
    };

    return (
      <Layout title="">
        <BackLink />

        <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-500" />
          <div className="px-5 pb-6 sm:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4">
                <Avatar
                  src={summary.picture}
                  alt={`${summary.fullname} profile photo`}
                  label={summary.fullname}
                  className="-mt-12 h-24 w-24 border-4 border-white bg-white shadow-md"
                />
                <div className="pb-1">
                  <div className="flex items-center gap-1.5">
                    <h1 className="text-xl font-bold text-slate-900">
                      @{summary.username}
                    </h1>
                    <VerifiedBadge verified={summary.is_verified} className="h-5 w-5" />
                  </div>
                  <p className="text-slate-500">{summary.fullname}</p>
                  <p className="mt-0.5 text-xs text-slate-400">{platformLabel}</p>
                </div>
              </div>

              {platform ? (
                <ShortlistButton item={shortlistItem} size="full" />
              ) : (
                <button
                  type="button"
                  disabled
                  title="Open this profile from search to add it to your shortlist"
                  className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
                >
                  Add to list
                </button>
              )}
            </div>

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                Extended stats aren't available for this creator — showing what we
                found in search results.
              </span>
            </div>

            <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {summaryStats.map((s) => (
                <StatTile key={s.label} label={s.label} value={s.value} />
              ))}
            </dl>
          </div>
        </article>
      </Layout>
    );
  }

  if (status === "error" || !user) {
    return (
      <Layout title={`@${username}`}>
        <BackLink />
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-center">
          <p className="font-medium text-rose-700">
            Could not load profile details for @{username}.
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="">
      <BackLink />

      <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-violet-500" />
        <div className="px-5 pb-6 sm:px-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <Avatar
                src={user.picture}
                alt={`${user.fullname} profile photo`}
                label={user.fullname}
                className="-mt-12 h-24 w-24 border-4 border-white bg-white shadow-md"
              />
              <div className="pb-1">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-xl font-bold text-slate-900">
                    @{user.username}
                  </h1>
                  <VerifiedBadge verified={user.is_verified} className="h-5 w-5" />
                </div>
                <p className="text-slate-500">{user.fullname}</p>
                <p className="mt-0.5 text-xs text-slate-400">{platformLabel}</p>
              </div>
            </div>

            {platform ? (
              <ShortlistButton item={toShortlistItem(user, platform)} size="full" />
            ) : (
              <button
                type="button"
                disabled
                title="Open this profile from search to add it to your shortlist"
                className="inline-flex cursor-not-allowed items-center justify-center rounded-lg bg-slate-100 px-4 py-2 text-sm font-medium text-slate-400"
              >
                Add to list
              </button>
            )}
          </div>

          {user.description && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-slate-600">
              {user.description}
            </p>
          )}

          <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {stats.map((s) => (
              <StatTile key={s.label} label={s.label} value={s.value} />
            ))}
          </dl>

          {user.url && (
            <a
              href={user.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg text-sm font-medium text-indigo-600 hover:text-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              View on platform
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
          )}
        </div>
      </article>
    </Layout>
  );
}
