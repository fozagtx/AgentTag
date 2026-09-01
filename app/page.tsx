"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Cpu, Search } from "lucide-react";

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
          <h1 className="hero-title text-balance">
            Add <span className="hero-accent">book a call</span>
            <br />
            to your portfolio
            <br />
            in seconds
          </h1>

          <p className="mt-5 max-w-[480px] text-[18px] font-normal leading-relaxed tracking-[0.2px] text-[#c8c8c8]">
            Paste your site. Agents can book a call from it.
          </p>
        </div>

        <form
          id="scanner"
          className="command-glass relative z-10 mt-10 w-full max-w-[720px] rounded-[14px] text-left"
          onSubmit={handleAnalyze}
        >
          <div className="flex items-center gap-3 px-4 py-3">
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
              Add
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
      </section>

      <section id="how-it-works" className="relative z-10 scroll-mt-24 px-6 pb-24">
        <div className="mx-auto grid max-w-[720px] grid-cols-1 gap-3 sm:grid-cols-3">
          {[
            { step: "1", title: "Paste your portfolio" },
            { step: "2", title: "We add book a call" },
            { step: "3", title: "Put the tag on your site" },
          ].map((item) => (
            <div key={item.step} className="rounded-[14px] border border-white/10 bg-white/[0.03] px-5 py-4">
              <div className="font-mono text-[12px] text-[#9c9c9d]">{item.step}</div>
              <h2 className="mt-2 text-[16px] font-medium text-white">{item.title}</h2>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
