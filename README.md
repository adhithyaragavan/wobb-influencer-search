# Wobb — Influencer Search

A polished influencer-search app built on the Wobb starter (React 19 + TypeScript + Vite + Tailwind CSS v4).
Browse creators across Instagram, YouTube, and TikTok, open a detailed profile, and build a persistent shortlist.

> Built for the Wobb "vibe-coder" take-home. This repository is an original repo (not a fork of the starter).

## Getting started

```bash
npm install      # clean install (no flags needed)
npm run dev      # http://localhost:5173
npm run build    # tsc -b && vite build
npm run lint     # eslint
npm run preview  # preview the production build
```

## Highlights

- **Case-insensitive search** by username or full name.
- **Platform filter** (Instagram / YouTube / TikTok) with an accessible tab UI.
- **Profile detail** page with a clean stat grid and graceful loading / not-found states.
- **Add to List (shortlist)** — add/remove from both the list card and the profile page, deduped by `user_id`, viewable in a slide-over drawer, and **persisted across refresh** via `localStorage`.
- **Responsive** mobile-first layout, **accessible** (keyboard-navigable, ARIA, focus rings), with subtle **animations**.

## What changed

### Bugs fixed
1. **Case-sensitive username search** — `filterProfiles` compared the raw `username` against the query while lowercasing the full-name branch, so username matches were case-sensitive. Both sides are now normalized. (`src/utils/dataHelpers.ts`)
2. **Engagement rate off by 100×** — the profile page computed `engagement_rate * 10000` inline (e.g. Cristiano showed `125.51%`). It now uses the existing, correct `formatEngagementRate` (`* 100` → `1.26%`). (`src/pages/ProfileDetailPage.tsx`)
3. **Mislabeled "Engagements" stat** — the card labeled *Engagements* (a count) was rendering the engagement **rate**. It now shows the actual `engagements` count.
4. **Triplicated follower formatters** — three near-duplicate implementations with different rounding (`formatFollowers`, `formatFollowersDetail`, `formatFollowersLocal`) were consolidated into a single `formatCompact` (`src/utils/formatters.ts`).
5. **Dead code removed** — the unused `SearchBar` component, the console-log-only `clickCount` state (which also had a stale-closure bug), and a leftover `data-search` attribute.
6. **Broken install** — the starter listed `react-beautiful-dnd`, which is unused and incompatible with React 19, so a plain `npm install` failed with a peer-dependency error. Removed it; `npm install` now succeeds with no flags.
7. **Stale-response race** — the detail page could overwrite fresh data with a slow response for a previous username. The new `useProfile` hook tags results by username and ignores stale ones.
8. **YouTube search crash** — 3 sample YouTube channels have no `username` field (only `handle`), so typing a search called `.toLowerCase()` on `undefined` and crashed to a white screen; the same entries linked to `/profile/undefined`. Fixed by normalizing `username` (falling back to `handle`, then `user_id`) once in `extractProfiles`, and the raw JSON shape is now typed honestly (`RawSearchProfile`, optional `username`) instead of lying via an unchecked cast.
9. **Shortlist platform mislabel** — opening a profile via a direct/bookmarked URL with no `?platform=` param showed "Unknown" on screen but silently saved the shortlisted item as `instagram`. The Add-to-list button is now disabled (with an explanatory tooltip) instead of guessing in that case.
10. **Invalid HTML / accessibility**: the profile card nested a `<button>` inside a `<Link>` (`<a>`), which the HTML spec disallows and which assistive tech handles inconsistently — restructured to the "stretched link" pattern. The shortlist drawer (`role="dialog"`) had no `Escape`-to-close, no focus management, and let keyboard focus leak into the page behind it — now focuses itself on open, restores focus to the trigger on close, closes on `Escape`, and marks the background `inert` while open. The platform filter declared ARIA `tablist`/`tab` roles without the arrow-key behavior that implies — simplified to plain toggle buttons (`aria-pressed`) that match how they actually behave.
11. **Platform tab reset on back-navigation** — `SearchPage` kept platform/search in local `useState`, so clicking a profile then going back always landed back on the Instagram tab. State now lives in the URL (`?platform=&q=`) via `useSearchParams`, so both the "Back to search" link and the browser back button restore exactly where the user was.
12. **Broken avatar images (mainly YouTube)** — several `yt3.googleusercontent.com` URLs in the sample data were stale and 404ing (verified directly with `curl`). Added an `Avatar` component that falls back to an initial on a stable color via the `<img>`'s `onError`, used everywhere a profile picture renders — a safety net independent of fix #14 below, since any hotlinked social CDN URL can go stale again later.
13. **Dead-end "could not load" for most profiles** — most search results have no matching detail JSON (by design of the sample data), which previously always showed a hard error. The profile card and shortlist panel now pass the summary they already have via router `state`, so a missing detail file renders a clearly-labeled partial profile (picture, name, followers, engagement rate, working Add-to-list) instead of a dead end; a truly data-less direct URL still shows the original error as the last resort.
14. **Wrong/missing YouTube usernames + stale avatar URLs, corrected against the real accounts** — cross-checked each YouTube entry's channel ID against the real channel (via `og:image`/`externalId`, not guessed) and found actual data errors: `checkgate` → `CoComelon`, `MrBeast6000` → `MrBeast`, `WWEFanNation` → `WWE`, `setindia` → `SETIndia`, and three entries (`VladandNiki`, `KidsDianaShow`, `LikeNastyaofficial`) had no `username` at all. All 10 YouTube avatar URLs were replaced with fresh, `curl`-verified working ones sourced from each channel's current page. Fixing `MrBeast6000` → `MrBeast` surfaced a real structural bug: the detail-JSON lookup is keyed by username (`${username}.json`), and TikTok already has an unrelated `mrbeast.json` (Jimmy Donaldson's TikTok handle happens to collide with his corrected YouTube one) — same-cased or not, `MrBeast.json` vs `mrbeast.json` collide outright on case-insensitive filesystems (macOS/Windows), a landmine that would behave differently in Linux CI/deploy. Fixed by making `profileLoader`/`useProfile` platform-aware: they try `${username}-${platform}.json` first, falling back to the plain `${username}.json`; the YouTube MrBeast file was renamed to `MrBeast-youtube.json` accordingly.

### Features & UX
- Introduced **Zustand** with the `persist` middleware for the shortlist store (`src/store/useShortlistStore.ts`). *Note: the starter did not actually use React Context or any state management — so "replace Context with Zustand" is realized here as introducing Zustand as the single source of truth for the shortlist.*
- Full **UI/UX redesign** (clean light SaaS): sticky header with live shortlist count, card grid, pill platform tabs, redesigned profile page, empty/loading/error states.
- **Accessibility:** cards are real `<Link>`s (keyboard-focusable), all images have `alt` text, the external link uses `rel="noopener noreferrer"`, icon-only buttons have `aria-label`s, the verified badge is labeled, the result count is an `aria-live` region, and everything has visible focus rings.
- **Performance:** `useMemo` for the derived profile lists and detail-page stats, `React.memo` on `ProfileCard`, and a **debounced** search input (`useDebouncedValue`) that flushes instantly on clear (so switching platforms mid-search doesn't briefly show stale-filtered results) but debounces normal typing.
- **Type safety:** raw search JSON and normalized profile data now have distinct types (`RawSearchProfile` vs. `UserProfileSummary`), so a future data-shape drift is a type error at the extraction boundary instead of a silent `undefined`. `FullUserProfile` was trimmed of fields the JSON has but the UI never renders (`gender`, `age_group`, `is_business`, `type`, `avg_reels_plays`). The profile-detail loader validates the loaded JSON's shape at runtime instead of blindly casting it, falling back to the existing "could not load" state if it's malformed.

### Structure
```
src/
  components/    UI: Layout, PlatformFilter, ProfileList, ProfileCard,
                 Avatar, VerifiedBadge, ShortlistButton, ShortlistPanel
  hooks/         useProfile, useDebouncedValue, useDocumentTitle
  pages/         SearchPage, ProfileDetailPage
  store/         useShortlistStore (Zustand + persist)
  utils/         dataHelpers, formatters, profileLoader
  types/         shared TypeScript interfaces
```

## Libraries added
| Library | Why |
| --- | --- |
| **zustand** | Small, ergonomic state management for the shortlist; `persist` middleware gives free `localStorage` persistence. |
| **lucide-react** | Consistent, tree-shakeable icon set. |
| **framer-motion** | Drawer slide-in and list add/remove micro-interactions. |
| **clsx** | Readable conditional class composition. |

`react-beautiful-dnd` was **removed** (unused and React-19-incompatible).

## Assumptions
- The starter's task "replace React Context with Zustand" is interpreted as "introduce Zustand for shared state," since the starter shipped with no Context/state layer.
- Some search results have no matching profile JSON (e.g. `@leomessi`); this is treated as a valid "profile not available" state, rendering a partial profile from the search summary rather than a crash or a dead end.
- The provided static JSON is the data source; `loadProfileByUsername` keeps the starter's simulated-async dynamic import. Usernames and avatar URLs were corrected against the real accounts (see fix #14), but the data otherwise remains a static, point-in-time snapshot — not a live API.

## Trade-offs
- **URL-synced search state, Zustand-only for the shortlist:** platform/search live in `SearchPage`'s URL query params (so back-navigation restores them) rather than a global store — they aren't needed outside this one page. Only genuinely cross-page, persisted state (the shortlist) lives in Zustand.
- **Hand-built components vs. a UI kit:** chose Tailwind + a few small helpers over a component library to keep the bundle lean and the styling fully controlled, at the cost of writing primitives by hand.
- **Compact number formatting:** one rounding rule (`formatCompact`) is used everywhere for consistency, even though a couple of call sites previously rounded differently.
- **Hotlinked avatar URLs can go stale again:** fix #14 points at real, currently-working photo URLs, but any social platform's CDN link can expire later the same way the original sample data's did — that's inherent to hotlinking rather than hosting the assets ourselves. The `Avatar` fallback (fix #12) is the durable answer to that risk, not a one-time re-link.

## Remaining improvements
- Automated tests (unit tests for the store/formatters, a Playwright happy-path).
- `useIsShortlisted` does an O(n) scan per card on every store update — fine at this data size, would want an indexed lookup (`Set`/`Record`) if the shortlist or result list grew much larger.
- List virtualization if the dataset grows large.
- Deployment (Vercel/Netlify) — not set up for this submission.
- Richer profile analytics (the JSON includes `stat_history`, not currently surfaced).

## Verification
`npm run build` and `npm run lint` pass. The app was verified end-to-end with a headless-Chrome regression pass covering: case-insensitive search on all three platforms (including the YouTube crash fix), a real profile detail page rendering correct stats, the graceful "could not load" fallback for profiles with no detail JSON, the platform-mislabel fix (disabled Add-to-list + "Unknown" label on param-less URLs), the full add/dedupe/persist-after-reload/remove shortlist flow, per-route document titles, zero invalid `<button>`-in-`<a>` nesting, the shortlist dialog's focus management (focus-in-on-open, `Escape`-to-close, focus-restore-on-close, background `inert` while open), back-navigation restoring the platform tab, all 10 YouTube avatars loading real images, and MrBeast's YouTube detail page loading full stats from the renamed/disambiguated file (with the separate TikTok `mrbeast` profile unaffected) — all with zero console/page errors. Every corrected username and avatar URL was independently checked against the real account (`curl`-verified HTTP 200, channel ID cross-referenced via `externalId`), not guessed.
