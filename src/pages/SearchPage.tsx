import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import type { Platform } from "@/types";
import { Layout } from "@/components/Layout";
import { PlatformFilter } from "@/components/PlatformFilter";
import { ProfileList } from "@/components/ProfileList";
import { extractProfiles, filterProfiles, PLATFORMS } from "@/utils/dataHelpers";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

export function SearchPage() {
  useDocumentTitle("Find Influencers · Wobb");

  // Platform + search live in the URL (not local state) so that navigating
  // to a profile and back — via the "Back to search" link or the browser's
  // back button — restores exactly the tab and query the user had, instead
  // of always resetting to the Instagram tab.
  const [searchParams, setSearchParams] = useSearchParams();
  const platformParam = searchParams.get("platform");
  const platform: Platform = PLATFORMS.includes(platformParam as Platform)
    ? (platformParam as Platform)
    : "instagram";
  const searchQuery = searchParams.get("q") ?? "";
  const debouncedQuery = useDebouncedValue(searchQuery, 200);

  const allProfiles = useMemo(() => extractProfiles(platform), [platform]);
  const filtered = useMemo(
    () => filterProfiles(allProfiles, debouncedQuery),
    [allProfiles, debouncedQuery]
  );

  function handlePlatformChange(next: Platform) {
    // Clearing the query on platform switch matches the prior UX: an active
    // filter on one platform shouldn't silently carry over and hide results
    // on another.
    setSearchParams({ platform: next }, { replace: true });
  }

  function handleSearchChange(value: string) {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (value) params.set("q", value);
        else params.delete("q");
        return params;
      },
      { replace: true }
    );
  }

  return (
    <Layout
      title="Find Influencers"
      subtitle="Browse top creators across Instagram, YouTube, and TikTok."
    >
      <PlatformFilter
        selected={platform}
        onChange={handlePlatformChange}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
      />

      <p className="mb-3 mt-5 text-xs text-slate-400" aria-live="polite">
        Showing {filtered.length} of {allProfiles.length} profiles
      </p>

      <ProfileList profiles={filtered} platform={platform} />
    </Layout>
  );
}
