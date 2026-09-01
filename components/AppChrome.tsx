"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Aurora from "@/components/Aurora";
import { BrandMark } from "@/components/BrandMark";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp = pathname.startsWith("/dashboard") || pathname.startsWith("/studio");

  if (isApp) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-[#07080a] text-white">
      <div className="pointer-events-none fixed inset-0 z-0">
        <Aurora />
      </div>

      <div className="relative z-50 w-full px-4 pt-5 sm:px-6">
        <header className="pill-nav mx-auto flex h-12 max-w-[920px] items-center justify-between gap-3 rounded-full px-3 sm:px-5">
          <BrandMark />
          <Link
            href="/dashboard"
            className="inline-flex h-8 items-center rounded-full px-3 text-[13px] font-medium text-[#9c9c9d] hover:text-white"
          >
            Your portfolios
          </Link>
        </header>
      </div>

      <main className="relative z-10 flex-1 w-full">{children}</main>

      <footer className="relative z-10 w-full border-t border-white/10 bg-[#07080a] pt-10 pb-10">
        <div className="max-w-[920px] mx-auto px-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-[#9c9c9d]">Add book a call to your portfolio in seconds.</p>
          <div className="text-xs text-[#9c9c9d]">© 2026 AgentTag</div>
        </div>
      </footer>
    </div>
  );
}
