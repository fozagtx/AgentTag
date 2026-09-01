"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Briefcase,
  Check,
  Copy,
  Cpu,
  Search,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import AgentGlobe from "@/components/AgentGlobe";

const EMBED = `<script src="https://cdn.agenttag.io/client.js" data-site-id="YOUR_SITE_ID"></script>`;

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("https://docs.stripe.com");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleAnalyze = async (targetUrl?: string) => {
    const finalUrl = targetUrl || url;
    if (!finalUrl.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: finalUrl }),
      });
      const data = await res.json();
      if (data.success && data.site_id) {
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

  const copyEmbed = async () => {
    await navigator.clipboard.writeText(EMBED);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="w-full">
      <section className="relative min-h-[100svh] flex flex-col items-center px-5 pt-10 pb-16 sm:pt-16">
        <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
          <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-[#9c9c9d]">
            One script tag. Agents get tools from your live site.
          </div>

          <h1 className="hero-title text-balance">
            Launch your product
            <br />
            to millions of <span className="hero-accent">agents</span>
          </h1>

          <p className="mt-5 max-w-[640px] text-[18px] font-normal leading-relaxed tracking-[0.2px] text-[#c8c8c8]">
            Paste a URL. AgentTag reads the live page and registers only the tools that page actually supports.
          </p>

          <div className="mt-8 flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row">
            <Link href="/dashboard" className="btn-keycap inline-flex items-center justify-center gap-2">
              Open Dashboard
            </Link>
            <button type="button" onClick={copyEmbed} className="btn-keycap inline-flex items-center justify-center gap-2">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? "Copied script tag" : "Copy script tag"}
            </button>
          </div>

          <p className="mt-4 font-mono text-[12px] text-[#9c9c9d]">
            {EMBED}
          </p>
        </div>

        <form
          id="scanner"
          className="command-glass relative z-10 mt-10 w-full max-w-[720px] rounded-[14px] text-left"
          onSubmit={(e) => {
            e.preventDefault();
            handleAnalyze();
          }}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[#9c9c9d]" />
            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-[#9c9c9d] focus:outline-none"
              style={{ caretColor: "#ff6b4a" }}
              placeholder="Paste a docs or product URL"
              aria-label="Site URL"
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-keycap h-8 px-3 text-xs disabled:opacity-50"
            >
              Read page
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2 text-[12px] text-[#9c9c9d]">
              <Cpu className="h-3.5 w-3.5 animate-spin-fast" />
              Reading the page...
            </div>
          ) : null}
        </form>

        <Link
          href="/#how-it-works"
          className="relative z-10 mt-8 inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-1.5 text-[13px] font-medium text-[#9c9c9d] hover:text-white"
        >
          Learn more -{'>'}
        </Link>
      </section>

      <section id="how-it-works" className="relative z-10 scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.14em] text-[#9c9c9d]">
            How it works
          </p>
          <h2 className="mt-3 text-center text-[32px] font-semibold tracking-tight text-white">
            Every era had a script tag
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { year: "2010", title: "Google Analytics", body: "One tag to measure human traffic." },
              { year: "2015", title: "Stripe Elements", body: "One tag to take payments." },
              { year: "2021", title: "Intercom", body: "One tag to chat with visitors." },
              { year: "2026", title: "AgentTag", body: "One tag so agents can read, search, and act.", active: true },
            ].map((item) => (
              <div
                key={item.year}
                className={`rounded-[14px] border p-6 ${
                  item.active
                    ? "border-[rgba(255,47,58,0.35)] bg-[rgba(255,47,58,0.08)]"
                    : "border-white/10 bg-white/[0.03]"
                }`}
              >
                <div className="font-mono text-[12px] text-[#9c9c9d]">{item.year}</div>
                <h3 className="mt-3 text-[18px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#9c9c9d]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="relative z-10 scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.14em] text-[#9c9c9d]">
            Capabilities
          </p>
          <h2 className="mt-3 text-center text-[32px] font-semibold tracking-tight">
            One script for every workflow
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              {
                icon: BookOpen,
                title: "Docs and APIs",
                body: "If the page has guides, code, or endpoints, those become searchable tools.",
              },
              {
                icon: ShoppingBag,
                title: "Products and checkout",
                body: "If the page has prices or a buy path, those tools are registered. If not, they are not.",
              },
              {
                icon: Briefcase,
                title: "Agencies and booking",
                body: "A scheduler or case study on the page is what creates those tools.",
              },
            ].map((card) => (
              <div key={card.title} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-7">
                <card.icon className="h-5 w-5 text-[#ff6b4a]" />
                <h3 className="mt-5 text-[18px] font-semibold">{card.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#9c9c9d]">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="developers" className="relative z-10 scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.14em] text-[#9c9c9d]">
            Docs
          </p>
          <h2 className="mt-3 text-center text-[32px] font-semibold tracking-tight">
            Calls from your sites
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-[15px] text-[#9c9c9d]">
            Empty until a tool actually runs.
          </p>
          <div className="mt-12">
            <AgentGlobe />
          </div>

          <div className="mt-16 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-6">
              <div className="text-[12px] font-medium text-[#9c9c9d]">index.html</div>
              <pre className="mt-4 overflow-x-auto font-mono text-[12px] text-[#ffb347]">{EMBED}</pre>
            </div>
            <div className="rounded-[14px] border border-white/10 bg-white/[0.03] p-6">
              <div className="text-[12px] font-medium text-[#9c9c9d]">claude_desktop_config.json</div>
              <pre className="mt-4 overflow-x-auto font-mono text-[12px] text-[#9c9c9d]">{`{
  "mcpServers": {
    "my-website": {
      "url": "https://relay.agenttag.io/mcp/YOUR_SITE_ID"
    }
  }
}`}</pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
