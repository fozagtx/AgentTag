"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Aurora from "@/components/Aurora";
import { BrandMark } from "@/components/BrandMark";

export default function AppChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isApp = pathname.startsWith("/dashboard") || pathname.startsWith("/studio");
  const [open, setOpen] = useState(false);

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

          <nav className="hidden md:flex items-center gap-5 text-[14px] font-medium text-[#9c9c9d]">
            <Link href="/#features" className="hover:text-white transition-colors duration-150">Product</Link>
            <Link href="/#how-it-works" className="hover:text-white transition-colors duration-150">How it works</Link>
            <Link href="/#developers" className="hover:text-white transition-colors duration-150">Docs</Link>
            <Link href="/dashboard" className="hover:text-white transition-colors duration-150">Dashboard</Link>
          </nav>

          <div className="hidden md:flex items-center gap-3 shrink-0">
            <Link
              href="/dashboard"
              className="inline-flex h-8 items-center rounded-full bg-[#e6e6e6] px-3 text-[13px] font-medium text-[#2f3031]"
            >
              Open dashboard
            </Link>
          </div>

          <button
            type="button"
            className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full text-white"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </header>

        {open ? (
          <div className="pill-nav mx-auto mt-2 max-w-[920px] rounded-2xl p-4 md:hidden">
            <div className="flex flex-col gap-3 text-[14px] font-medium text-[#9c9c9d]">
              <Link href="/#features" onClick={() => setOpen(false)}>Product</Link>
              <Link href="/#how-it-works" onClick={() => setOpen(false)}>How it works</Link>
              <Link href="/#developers" onClick={() => setOpen(false)}>Docs</Link>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-white">
                Open dashboard
              </Link>
            </div>
          </div>
        ) : null}
      </div>

      <main className="relative z-10 flex-1 w-full">{children}</main>

      <footer className="relative z-10 w-full border-t border-white/10 bg-[#07080a] pt-16 pb-12">
        <div className="max-w-[1120px] mx-auto px-6">
          <div className="flex flex-col gap-8 pb-12 md:flex-row md:items-start md:justify-between">
            <div className="space-y-4 max-w-sm">
              <BrandMark />
              <p className="text-sm text-[#9c9c9d] leading-relaxed">
                One script tag so agents can read, search, and act on your live site.
              </p>
            </div>
            <ul className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#9c9c9d]">
              <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
              <li><Link href="/#scanner" className="hover:text-white">Script tag</Link></li>
              <li><Link href="/#features" className="hover:text-white">Capabilities</Link></li>
              <li><Link href="/#developers" className="hover:text-white">Docs</Link></li>
            </ul>
          </div>
          <div className="text-xs text-[#9c9c9d]">© 2026 AgentTag</div>
        </div>
      </footer>
    </div>
  );
}
