import { extractBookingUrl } from "./firecrawl";

export function runToolAgainstSnapshot(
  toolName: string,
  executionType: string,
  args: Record<string, any>,
  markdown: string,
  sourceUrl: string
) {
  if (executionType === "dom_search" || toolName.startsWith("search_")) {
    const query = String(args.query || "").trim();
    if (!query) {
      return { query, matches: [], source_url: sourceUrl };
    }
    return {
      query,
      matches: matchMarkdown(markdown, query, 3),
      source_url: sourceUrl,
    };
  }

  if (toolName === "get_projects") {
    const query = String(args.query || "").trim();
    const excerpts = matchMarkdown(markdown, query || "project", 5);
    return {
      query: query || null,
      excerpts: excerpts.length > 0 ? excerpts : matchMarkdown(markdown, "work", 4),
      source_url: sourceUrl,
    };
  }

  if (toolName === "book_call" || executionType === "dom_action") {
    const bookingUrl = extractBookingUrl(markdown);
    return {
      booking_url: bookingUrl,
      name: String(args.name || "").trim() || null,
      email: String(args.email || "").trim() || null,
      preferred_time: String(args.preferred_time || "").trim() || null,
      source_url: sourceUrl,
      note: bookingUrl
        ? "Scheduler found on the page. Not booked yet."
        : "No scheduler link on this page.",
    };
  }

  const query = Object.values(args)
    .filter((v) => typeof v === "string" && v.trim())
    .join(" ");
  return {
    excerpts: query ? matchMarkdown(markdown, query, 3) : markdown.split("\n").filter(Boolean).slice(0, 8),
    source_url: sourceUrl,
  };
}

function matchMarkdown(markdown: string, query: string, limit: number): string[] {
  if (!markdown) return [];
  const q = query.toLowerCase();
  const lines = markdown.split("\n");
  const chunks: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (!lines[i].toLowerCase().includes(q)) continue;
    const chunk = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 6)).join("\n").trim();
    if (chunk && !chunks.includes(chunk)) chunks.push(chunk);
    if (chunks.length >= limit) break;
  }

  return chunks;
}
