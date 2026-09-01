"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Search } from "lucide-react";
import Link from "next/link";
import AgentGlobe from "@/components/AgentGlobe";

const EMBED = `<script src="https://cdn.agenttag.io/client.js" data-site-id="YOUR_SITE_ID"></script>`;

export default function HomePage() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success && data.site_id) {
        router.push(`/studio/${data.site_id}`);
      } else {
        setError(data.error || "Could not read that URL.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError(err.message || "Could not read that URL.");
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <section className="relative min-h-[100svh] flex flex-col items-center px-5 pt-10 pb-16 sm:pt-16">
        <div className="relative z-10 mx-auto flex w-full max-w-[720px] flex-col items-center text-center">
          <div className="mb-6 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[12px] font-medium text-[#9c9c9d]">
            For portfolios
          </div>

          <h1 className="hero-title text-balance">
            Give agents your work
            <br />
            and a way to <span className="hero-accent">book a call</span>
          </h1>

          <p className="mt-5 max-w-[560px] text-[18px] font-normal leading-relaxed tracking-[0.2px] text-[#c8c8c8]">
            Paste your portfolio. AgentTag reads the page and gives agents three tools: search your work, list projects, book a call.
          </p>
        </div>

        <form
          id="scanner"
          className="command-glass relative z-10 mt-10 w-full max-w-[720px] rounded-[14px] text-left"
          onSubmit={handleAnalyze}
        >
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
            <Search className="h-4 w-4 shrink-0 text-[#9c9c9d]" />
            <input
              type="url"
              inputMode="url"
              autoComplete="url"
              spellCheck={false}
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError("");
              }}
              disabled={isLoading}
              className="min-w-0 flex-1 bg-transparent text-[14px] text-white placeholder:text-[#9c9c9d] focus:outline-none"
              style={{ caretColor: "#ff6b4a" }}
              placeholder="https://your-portfolio.com"
              aria-label="Portfolio URL"
              aria-invalid={error ? true : undefined}
            />
            <button
              type="submit"
              disabled={isLoading || !url.trim()}
              className="btn-keycap h-8 px-3 text-xs disabled:opacity-50"
            >
              Add portfolio
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center gap-2 border-t border-white/10 px-4 py-2 text-[12px] text-[#9c9c9d]">
              <Cpu className="h-3.5 w-3.5 animate-spin-fast" />
              Reading the page...
            </div>
          ) : error ? (
            <div className="border-t border-white/10 px-4 py-2 text-[12px] text-[#ff6b4a]">{error}</div>
          ) : null}
        </form>

        <Link
          href="/#how-it-works"
          className="relative z-10 mt-8 inline-flex items-center gap-1 rounded-full border border-white/15 px-4 py-1.5 text-[13px] font-medium text-[#9c9c9d] hover:text-white"
        >
          How it works -{">"}
        </Link>
      </section>

      <section id="how-it-works" className="relative z-10 scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.14em] text-[#9c9c9d]">
            How it works
          </p>
          <h2 className="mt-3 text-center text-[32px] font-semibold tracking-tight text-white">
            Three tools. One tag.
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { step: "1", title: "Paste your portfolio", body: "We read the live page. Work, projects, and any scheduler on it." },
              { step: "2", title: "Get the tools", body: "search_work, get_projects, and book_call. Nothing extra." },
              { step: "3", title: "Agents book a call", body: "Drop the script tag on your site. An agent can find your work and use your scheduler." },
            ].map((item) => (
              <div key={item.step} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-6">
                <div className="font-mono text-[12px] text-[#9c9c9d]">{item.step}</div>
                <h3 className="mt-3 text-[18px] font-semibold">{item.title}</h3>
                <p className="mt-2 text-[14px] leading-relaxed text-[#9c9c9d]">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="developers" className="relative z-10 scroll-mt-24 px-6 py-24">
        <div className="mx-auto max-w-[1120px]">
          <p className="text-center text-[12px] font-medium uppercase tracking-[0.14em] text-[#9c9c9d]">
            Put it on your site
          </p>
          <h2 className="mt-3 text-center text-[32px] font-semibold tracking-tight">
            One script tag
          </h2>
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
    "my-portfolio": {
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
