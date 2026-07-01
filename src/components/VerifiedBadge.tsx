import { BadgeCheck } from "lucide-react";
import clsx from "clsx";

interface VerifiedBadgeProps {
  verified: boolean;
  className?: string;
}

export function VerifiedBadge({ verified, className }: VerifiedBadgeProps) {
  if (!verified) return null;
  return (
    <BadgeCheck
      role="img"
      aria-label="Verified account"
      className={clsx("inline-block h-4 w-4 shrink-0 text-sky-500", className)}
    />
  );
}
