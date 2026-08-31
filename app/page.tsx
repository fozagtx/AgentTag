"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Globe,
  Cpu,
  Terminal,
  Layers,
  Sparkles,
  CheckCircle2,
  Code2,
  BookOpen,
  ShoppingBag,
  Briefcase,
  Copy,
  Check,
  Zap,
} from "lucide-react";
import Link from "next/link";
import AgentGlobe from "@/components/AgentGlobe";

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const sampleUrls = [
    { label: "Prisma Docs", url: "https://docs.prisma.io" },
    { label: "Stripe Docs", url: "https://docs.stripe.com" },
    { label: "Cal.com", url: "https://cal.com" },
    { label: "Mintlify", url: "https://mintlify.com/docs" },
  ];

  const handleAnalyze = async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) return;

    setIsLoading(true);
    setStatusMessage("Crawling page structure with Firecrawl...");

    try {
      setTimeout(() => setStatusMessage("Extracting code snippets, forms & CTAs..."), 1000);
      setTimeout(() => setStatusMessage("Synthesizing Web MCP tool schemas..."), 2000);

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl }),
      });

      const data = await res.json();
      if (data.success && data.site_id) {
        setStatusMessage("Redirecting to WebMCP Studio...");
        router.push(`/studio/${data.site_id}`);
      } else {
        alert(data.error || "Failed to analyze URL.");
        setIsLoading(false);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col font-sans">
      {/* ─────────────────────────────────────────────────────────────
          BAND 1: SOLID LAVENDER HERO (#B09CFB)
          ───────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#B09CFB] border-b-2 border-[#151617] pt-12 pb-24 px-6 sm:px-8 comic-grid-pattern">
        <div className="max-w-[1280px] mx-auto text-center flex flex-col items-center">
          {/* Eyebrow Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-[9999px] bg-[#FFBE98] border-2 border-[#151617] shadow-comic-sm text-xs font-bold uppercase tracking-wider text-[#151617] mb-8">
            <span className="w-2 h-2 rounded-full bg-[#151617] animate-ping" />
            <span>THE 1-SCRIPT TAG AI AGENT REVOLUTION</span>
          </div>

          {/* Refined Display Headline (text-balance for optical symmetry) */}
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl tracking-[-1.5px] leading-[1.05] text-[#151617] max-w-4xl uppercase text-balance">
            LAUNCH YOUR PRODUCT <br />
            <span className="text-[#FAFAF9] drop-shadow-[3px_3px_0px_#151617]">TO MILLIONS OF AGENTS</span>
          </h1>

          {/* Lede Body Paragraph (text-pretty to eliminate dangling widows) */}
          <p className="mt-5 text-base sm:text-lg font-medium text-[#151617] max-w-2xl leading-[1.5] mx-auto text-pretty">
            Stop letting AI coding and buyer agents struggle with messy HTML scrapers, stale docs, and broken checkouts. Paste your URL, vibe with auto-generated Web MCP tools, and embed 1 script tag.
          </p>

          {/* Neobrutalist URL Scanner Card */}
          <div id="scanner" className="mt-12 w-full max-w-3xl">
            <div className="p-3 sm:p-4 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg ring-1 ring-black/5">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAnalyze();
                }}
                className="flex flex-col sm:flex-row items-stretch gap-2.5"
              >
                <div className="flex items-center flex-1 px-4 py-3 rounded-[12px] bg-[#F5F2F0] border-2 border-[#151617] min-h-[48px]">
                  <Globe className="h-5 w-5 text-[#151617] mr-3 flex-shrink-0" />
                  <input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Paste any docs, SaaS landing page, agency, or store URL..."
                    disabled={isLoading}
                    className="w-full bg-transparent border-none text-[#151617] text-sm sm:text-base font-semibold placeholder:text-[#151617]/50 focus:outline-none"
                  />
                </div>

                {/* Primary Coral CTA Button (48px height, 44px min touch target, tactile active scale) */}
                <button
                  type="submit"
                  disabled={isLoading || !url.trim()}
                  className="h-[48px] min-h-[48px] px-8 rounded-[12px] bg-[#FFBE98] hover:bg-[#ffa978] text-[#151617] font-bold text-sm uppercase tracking-wide border-2 border-[#151617] shadow-comic btn-press flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  {isLoading ? (
                    <>
                      <Cpu className="h-4 w-4 animate-spin-fast text-[#151617]" />
                      <span>Synthesizing...</span>
                    </>
                  ) : (
                    <>
                      <span>Generate Web MCP</span>
                      <ArrowRight className="h-4 w-4 text-[#151617] translate-x-0.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Progress Toast */}
              {isLoading && (
                <div className="mt-3 p-3 rounded-[10px] bg-[#B09CFB] border-2 border-[#151617] text-xs font-bold text-[#151617] flex items-center justify-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{statusMessage}</span>
                </div>
              )}

              {/* Action Buttons: Generate or Go to Dashboard */}
              <div className="mt-4 pt-3 border-t-2 border-[#151617]/10 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-[#151617]">
                  <span className="uppercase text-[11px] font-mono">⚡ Quick Test:</span>
                  {sampleUrls.map((sample) => (
                    <button
                      key={sample.url}
                      type="button"
                      onClick={() => {
                        setUrl(sample.url);
                        handleAnalyze(sample.url);
                      }}
                      disabled={isLoading}
                      className="px-3 py-1.5 min-h-[36px] rounded-[8px] bg-[#F5F2F0] hover:bg-[#FFBE98] border-2 border-[#151617] shadow-comic-sm text-[#151617] transition-all btn-press font-mono text-xs"
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>

                <Link
                  href="/dashboard"
                  className="px-4 py-2 min-h-[36px] rounded-[8px] bg-[#B09CFB] hover:bg-[#9078F0] border-2 border-[#151617] shadow-comic-sm text-xs font-bold text-[#151617] flex items-center gap-1.5 transition-all btn-press"
                >
                  <span>Open Agent Dashboard</span>
                  <ArrowRight className="h-3.5 w-3.5 translate-x-0.5" />
                </Link>
              </div>
            </div>

            {/* Zero-Auth Subtext */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-[#151617]">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-[#151617]" /> Zero Login Required
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-[#151617]" /> Neon Serverless DB
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="h-4 w-4 text-[#151617]" /> Claude &amp; Cursor Compatible
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BAND 2: OFF-WHITE BODY (#F5F2F0) - LEDGER & EVOLUTION
          ───────────────────────────────────────────────────────────── */}
      <section id="timeline" className="w-full bg-[#F5F2F0] border-b-2 border-[#151617] py-20 px-6 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex px-3 py-1 rounded-[9999px] bg-[#B09CFB] border-2 border-[#151617] shadow-comic-sm font-mono text-xs font-bold uppercase text-[#151617] mb-3">
              THE HISTORICAL SCRIPT LEDGER
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#151617] uppercase tracking-tight text-balance">
              EVERY ERA HAD ITS DEFINING SCRIPT TAG
            </h2>
          </div>

          {/* 4 Comic Ledger Panels with concentric radii and tabular dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 2010 */}
            <div className="p-6 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between ring-1 ring-black/5">
              <div>
                <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#F5F2F0] border-2 border-[#151617] font-mono text-xs font-bold text-[#151617] tabular-nums">
                  2010
                </span>
                <h3 className="font-display text-2xl text-[#151617] mt-4">GOOGLE ANALYTICS</h3>
                <p className="text-sm font-medium text-[#151617]/80 mt-2 text-pretty">
                  Pasted 1 script tag into HTML to monitor, track, and profile human web traffic.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#151617]/10 text-xs font-bold text-[#151617]/60 font-mono">
                [ Web for Browsers ]
              </div>
            </div>

            {/* 2015 */}
            <div className="p-6 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between ring-1 ring-black/5">
              <div>
                <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#F5F2F0] border-2 border-[#151617] font-mono text-xs font-bold text-[#151617] tabular-nums">
                  2015
                </span>
                <h3 className="font-display text-2xl text-[#151617] mt-4">STRIPE ELEMENTS</h3>
                <p className="text-sm font-medium text-[#151617]/80 mt-2 text-pretty">
                  Pasted 1 script tag into HTML to accept global credit cards and checkout payments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#151617]/10 text-xs font-bold text-[#151617]/60 font-mono">
                [ Web for Payments ]
              </div>
            </div>

            {/* 2021 */}
            <div className="p-6 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between ring-1 ring-black/5">
              <div>
                <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#F5F2F0] border-2 border-[#151617] font-mono text-xs font-bold text-[#151617] tabular-nums">
                  2021
                </span>
                <h3 className="font-display text-2xl text-[#151617] mt-4">INTERCOM LIVE</h3>
                <p className="text-sm font-medium text-[#151617]/80 mt-2 text-pretty">
                  Pasted 1 script tag into HTML to offer real-time customer chat with human visitors.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#151617]/10 text-xs font-bold text-[#151617]/60 font-mono">
                [ Web for Chat ]
              </div>
            </div>

            {/* 2026 AgentTag */}
            <div className="p-6 rounded-[16px] bg-[#FFBE98] border-2 border-[#151617] shadow-comic-lg flex flex-col justify-between relative overflow-hidden ring-1 ring-black/5">
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-[9999px] bg-[#4ECB71] border-2 border-[#151617] font-mono text-[10px] font-bold">
                ACTIVE
              </div>
              <div>
                <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#FAFAF9] border-2 border-[#151617] font-mono text-xs font-bold text-[#151617] tabular-nums">
                  2026
                </span>
                <h3 className="font-display text-2xl text-[#151617] mt-4">AGENTTAG ENGINE</h3>
                <p className="text-sm font-bold text-[#151617] mt-2 leading-relaxed text-pretty">
                  Paste 1 script tag so <b>AI Agents can read, search, code, book, and buy.</b>
                </p>
              </div>
              <div className="mt-6 pt-4 border-t-2 border-[#151617] text-xs font-bold text-[#151617] font-mono">
                [ Web for AI Agents ]
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BAND 3: LAVENDER AI ASSISTANT SIMULATOR BAND (#B09CFB)
          ───────────────────────────────────────────────────────────── */}
      <section id="features" className="w-full bg-[#B09CFB] border-b-2 border-[#151617] py-20 px-6 sm:px-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Section Header */}
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex px-3 py-1 rounded-[9999px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-sm font-mono text-xs font-bold uppercase text-[#151617] mb-3">
              UNIFIED CAPABILITY ENGINE
            </div>
            <h2 className="font-display text-2xl sm:text-3xl lg:text-4xl text-[#151617] uppercase tracking-tight text-balance">
              ONE SCRIPT FOR EVERY WORKFLOW
            </h2>
          </div>

          {/* 3 Comic Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Docs & API */}
            <div className="p-8 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg flex flex-col justify-between ring-1 ring-black/5">
              <div>
                <div className="w-12 h-12 rounded-[10px] bg-[#B09CFB] border-2 border-[#151617] shadow-comic-sm flex items-center justify-center text-[#151617] mb-6">
                  <BookOpen className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl text-[#151617]">DOCS &amp; CODING APIS</h3>
                <p className="text-sm font-medium text-[#151617]/80 mt-3 leading-relaxed text-pretty">
                  Cursor &amp; Claude Desktop write verified code without hallucinating APIs using live semantic search and exact AST code snippets.
                </p>
                <div className="mt-6 space-y-2 text-xs font-bold font-mono text-[#151617]">
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    search_docs(query)
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    get_code_example(lang)
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    get_api_reference(endpoint)
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t-2 border-[#151617]/10 text-xs font-bold text-[#151617]">
                Mintlify • Docusaurus • Nextra • GitBook
              </div>
            </div>

            {/* Card 2: Commerce & SaaS */}
            <div className="p-8 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg flex flex-col justify-between ring-1 ring-black/5">
              <div>
                <div className="w-12 h-12 rounded-[10px] bg-[#FFBE98] border-2 border-[#151617] shadow-comic-sm flex items-center justify-center text-[#151617] mb-6">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl text-[#151617]">PRODUCTS &amp; COMMERCE</h3>
                <p className="text-sm font-medium text-[#151617]/80 mt-3 leading-relaxed text-pretty">
                  Autonomous buyer agents evaluate pricing tiers, check license terms, and initiate checkouts with built-in on-screen consent toasts.
                </p>
                <div className="mt-6 space-y-2 text-xs font-bold font-mono text-[#151617]">
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    get_pricing_tiers()
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    initiate_checkout(tier)
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    get_product_features()
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t-2 border-[#151617]/10 text-xs font-bold text-[#151617]">
                Stripe • Lemon Squeezy • Gumroad • Shopify
              </div>
            </div>

            {/* Card 3: Agency & Leads */}
            <div className="p-8 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg flex flex-col justify-between ring-1 ring-black/5">
              <div>
                <div className="w-12 h-12 rounded-[10px] bg-[#4ECB71] border-2 border-[#151617] shadow-comic-sm flex items-center justify-center text-[#151617] mb-6">
                  <Briefcase className="h-6 w-6" />
                </div>
                <h3 className="font-display text-2xl text-[#151617]">AGENCIES &amp; BOOKING</h3>
                <p className="text-sm font-medium text-[#151617]/80 mt-3 leading-relaxed text-pretty">
                  Prospecting agents review your case studies, evaluate team skills, and book discovery calls directly into your Calendly or Cal.com schedule.
                </p>
                <div className="mt-6 space-y-2 text-xs font-bold font-mono text-[#151617]">
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    book_discovery_call(time)
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    get_case_studies(industry)
                  </div>
                  <div className="p-2 rounded-[8px] bg-[#F5F2F0] border-2 border-[#151617]">
                    get_service_offerings()
                  </div>
                </div>
              </div>
              <div className="mt-8 pt-4 border-t-2 border-[#151617]/10 text-xs font-bold text-[#151617]">
                Webflow • Framer • Calendly • Cal.com
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          BAND 4: DARK DEVELOPER ZONE (#181818 / #0D0E0F)
          ───────────────────────────────────────────────────────────── */}
      <section id="developers" className="w-full bg-[#181818] text-[#FAFAF9] border-b-2 border-[#151617] py-24 px-6 sm:px-8 comic-grid-dark">
        <div className="max-w-[1280px] mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex px-3 py-1 rounded-[9999px] bg-[#4ECB71] text-[#151617] border-2 border-white shadow-comic-sm font-mono text-xs font-bold uppercase mb-3">
              ZERO-INFRASTRUCTURE ARCHITECTURE
            </div>
            <h2 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight text-balance">
              LIVE GLOBAL AGENT NETWORK
            </h2>
            <p className="text-sm font-medium text-white/70 mt-3 text-pretty max-w-xl mx-auto">
              Watch Claude, Cursor, and autonomous buyer agents worldwide connect directly to WebMCP-enabled websites over ultra-low latency edge relays.
            </p>
          </div>

          {/* 3D Dot-Matrix Interactive Globe */}
          <div className="mb-16">
            <AgentGlobe variant="hero" />
          </div>

          {/* Integration Terminals Header */}
          <div className="text-center max-w-xl mx-auto mb-10">
            <h3 className="font-display text-2xl sm:text-3xl text-white uppercase tracking-tight">
              CONNECT CLAUDE &amp; CURSOR IN SECONDS
            </h3>
            <p className="text-xs font-mono text-white/60 mt-1">
              One embed script. One JSON block. Instant agent capabilities.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Terminal Card 1: Script Tag Embed */}
            <div className="p-6 rounded-[16px] bg-[#0D0E0F] border-2 border-[#B09CFB] shadow-comic-lg ring-1 ring-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                  <span className="ml-2 font-mono text-xs text-white/70">index.html (Client Runtime)</span>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#B09CFB] text-[#151617] font-mono text-[10px] font-bold tabular-nums">
                  &lt;15KB GZIPPED
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-white/60 font-mono mb-2">// 1. Drop this into your website:</p>
                <pre className="p-4 rounded-[10px] bg-[#151617] border-2 border-white/10 text-[#FFBE98] font-mono text-xs overflow-x-auto">
{`<script 
  src="https://cdn.agenttag.io/client.js" 
  data-site-id="YOUR_SITE_ID">
</script>`}
                </pre>
              </div>
            </div>

            {/* Terminal Card 2: Claude Desktop Config */}
            <div className="p-6 rounded-[16px] bg-[#0D0E0F] border-2 border-[#FFBE98] shadow-comic-lg ring-1 ring-white/10">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#FF5F56] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#FFBD2E] inline-block" />
                  <span className="w-3 h-3 rounded-full bg-[#27C93F] inline-block" />
                  <span className="ml-2 font-mono text-xs text-white/70">claude_desktop_config.json</span>
                </div>
                <span className="px-2 py-0.5 rounded-[4px] bg-[#FFBE98] text-[#151617] font-mono text-[10px] font-bold">
                  MCP SSE PROTOCOL
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs text-white/60 font-mono mb-2">// 2. Connect Claude Desktop or Cursor:</p>
                <pre className="p-4 rounded-[10px] bg-[#151617] border-2 border-white/10 text-[#4ECB71] font-mono text-xs overflow-x-auto">
{`{
  "mcpServers": {
    "my-website": {
      "url": "https://relay.agenttag.io/mcp/YOUR_SITE_ID"
    }
  }
}`}
                </pre>
              </div>
            </div>
          </div>

          {/* Quick CTA Bottom */}
          <div className="mt-16 text-center">
            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="h-[52px] min-h-[48px] px-10 rounded-[12px] bg-[#4ECB71] hover:bg-[#43b764] text-[#151617] font-display text-xl uppercase tracking-wide border-2 border-[#151617] shadow-comic-lg btn-press cursor-pointer"
            >
              SCAN YOUR WEBSITE NOW
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
