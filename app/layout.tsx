import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { Sparkles, ArrowUpRight, Terminal, BookOpen, Layers, LayoutDashboard } from "lucide-react";

export const metadata: Metadata = {
  title: "AgentTag | Launch Your Product to Millions of Agents",
  description: "The 1-Script Tag Agent Engine for Every Website. Make your documentation, digital product, or SaaS natively interactive for AI agents in seconds.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-[#B09CFB] text-[#151617] font-sans antialiased selection:bg-[#FFBE98] selection:text-[#151617]">
        {/* Centered Inset Bounded Rectangle Navbar (1280px, 64px height, 2px black border) */}
        <div className="w-full pt-4 px-4 sm:px-6 sticky top-0 z-50 pointer-events-none">
          <header className="max-w-[1280px] mx-auto h-[64px] bg-[#B09CFB]/95 backdrop-blur-md border-2 border-[#151617] px-6 flex items-center justify-between pointer-events-auto shadow-comic-sm">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-[8px] bg-[#FFBE98] border-2 border-[#151617] flex items-center justify-center font-display text-base text-[#151617] shadow-comic-sm">
                A
              </div>
              <span className="font-display text-2xl tracking-tight text-[#151617]">
                AgentTag
              </span>
            </Link>

            {/* Navigation links */}
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#151617]">
              <Link href="/dashboard" className="flex items-center gap-1.5 hover:underline underline-offset-4 decoration-2 font-bold text-[#151617]">
                <LayoutDashboard className="h-4 w-4 text-[#151617]" />
                Dashboard
              </Link>
              <Link href="/#how-it-works" className="hover:underline underline-offset-4 decoration-2">
                How It Works
              </Link>
              <Link href="/#features" className="hover:underline underline-offset-4 decoration-2">
                Capabilities
              </Link>
              <Link href="/#developers" className="hover:underline underline-offset-4 decoration-2">
                Developer SDK
              </Link>
            </nav>

            {/* Nav Action (Coral CTA button: 12px radius, 40px height, 2px black border) */}
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="h-[40px] px-5 rounded-[12px] bg-[#FFBE98] hover:bg-[#ffa978] text-[#151617] font-bold text-xs uppercase tracking-wide border-2 border-[#151617] shadow-comic-sm flex items-center gap-1.5 transition-all active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
              >
                <span>Open Dashboard</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </header>
        </div>

        {/* Page Content */}
        <main className="flex-1 w-full">{children}</main>

        {/* Comic Ledger Dark Developer Footer (#151617) */}
        <footer className="w-full bg-[#151617] text-[#FAFAF9] border-t-2 border-[#151617] pt-16 pb-12">
          <div className="max-w-[1280px] mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/10">
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-[6px] bg-[#B09CFB] border-2 border-white flex items-center justify-center font-display text-sm text-[#151617]">
                    A
                  </div>
                  <span className="font-display text-xl text-white">AgentTag</span>
                </div>
                <p className="text-sm text-[#FAFAF9]/80 max-w-sm font-sans leading-relaxed">
                  The neobrutalist universal script tag connecting live web apps, documentation, and digital products directly to AI agents.
                </p>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[9999px] bg-[#4ECB71] text-[#151617] font-mono text-xs font-bold border-2 border-white">
                  <span className="w-2 h-2 rounded-full bg-[#151617]" />
                  <span>ALL SYSTEMS OPERATIONAL</span>
                </div>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="font-mono text-xs uppercase tracking-wider text-[#FFBE98] font-bold">Platform</div>
                <ul className="space-y-2 text-xs font-sans text-white/80 font-medium">
                  <li><Link href="/dashboard" className="hover:text-white">Dashboard</Link></li>
                  <li><Link href="/#scanner" className="hover:text-white">Script Tag</Link></li>
                  <li><Link href="/#features" className="hover:text-white">Docs Engine</Link></li>
                  <li><Link href="/#developers" className="hover:text-white">Cloud Relay</Link></li>
                </ul>
              </div>

              <div className="md:col-span-2 space-y-3">
                <div className="font-mono text-xs uppercase tracking-wider text-[#B09CFB] font-bold">Frameworks</div>
                <ul className="space-y-2 text-xs font-sans text-white/80 font-medium">
                  <li><span>Mintlify &amp; Nextra</span></li>
                  <li><span>Docusaurus &amp; GitBook</span></li>
                  <li><span>Webflow &amp; Framer</span></li>
                  <li><span>Shopify &amp; Gumroad</span></li>
                </ul>
              </div>

              <div className="md:col-span-3 space-y-3">
                <div className="font-mono text-xs uppercase tracking-wider text-[#4ECB71] font-bold">Compatibility</div>
                <ul className="space-y-2 text-xs font-sans text-white/80 font-medium">
                  <li><span>Claude Desktop (SSE)</span></li>
                  <li><span>Cursor Composer</span></li>
                  <li><span>Neon Serverless Postgres</span></li>
                  <li><span>Render Web Services</span></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/60">
              <div>© 2026 AgentTag Platform. All rights reserved.</div>
              <div className="flex items-center gap-4">
                <span>Model Context Protocol</span>
                <span>•</span>
                <span>Persistent Database</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
