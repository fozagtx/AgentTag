"use client";

import Link from "next/link";

export function BrandMark({
  href = "/",
  onClick,
  light = false,
  compact = false,
}: {
  href?: string;
  onClick?: () => void;
  light?: boolean;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center shrink-0 ${compact ? "justify-center" : "gap-2.5"}`}
      aria-label="AgentTag"
    >
      <img
        src="/logo.png"
        alt=""
        width={32}
        height={32}
        className="h-8 w-8 rounded-[8px] shrink-0"
      />
      {compact ? null : (
        <span className={`text-sm font-semibold tracking-tight ${light ? "text-[#161616]" : "text-white"}`}>
          AgentTag
        </span>
      )}
    </Link>
  );
}
