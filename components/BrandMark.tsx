"use client";

import Link from "next/link";
import { useId } from "react";

export function DiamondMark({ className = "h-4 w-4" }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 16 16" className={className} aria-hidden>
      <path d="M8 1.2L14.6 8 8 14.8 1.4 8 8 1.2Z" fill={`url(#${id})`} />
      <defs>
        <linearGradient id={id} x1="2" y1="2" x2="14" y2="14">
          <stop stopColor="#ffb347" />
          <stop offset="0.5" stopColor="#ff6b4a" />
          <stop offset="1" stopColor="#ff2f3a" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function BrandMark({
  href = "/",
  onClick,
}: {
  href?: string;
  onClick?: () => void;
}) {
  return (
    <Link href={href} onClick={onClick} className="flex items-center gap-2 shrink-0">
      <DiamondMark />
      <span className="text-sm font-semibold text-white">AgentTag</span>
    </Link>
  );
}
