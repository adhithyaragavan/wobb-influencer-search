import { useState } from "react";
import clsx from "clsx";

interface AvatarProps {
  src: string | undefined;
  alt: string;
  /** Used to derive the fallback initial and a stable background color. */
  label: string;
  className?: string;
}

const PALETTE = [
  "bg-indigo-500",
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-fuchsia-500",
  "bg-cyan-500",
];

function colorFor(label: string): string {
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = (hash * 31 + label.charCodeAt(i)) >>> 0;
  }
  return PALETTE[hash % PALETTE.length];
}

/**
 * Profile picture with a graceful fallback. Some sample data (YouTube
 * channel avatars in particular) links to expired/404ing CDN URLs, so a
 * plain <img> would show a broken-image icon. On error — or if there's no
 * src at all — this renders an initial on a stable color instead.
 */
export function Avatar({ src, alt, label, className }: AvatarProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={clsx(
          "flex shrink-0 items-center justify-center rounded-full font-semibold text-white",
          colorFor(label),
          className
        )}
      >
        {label.charAt(0).toUpperCase() || "?"}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={clsx("shrink-0 rounded-full object-cover", className)}
    />
  );
}
