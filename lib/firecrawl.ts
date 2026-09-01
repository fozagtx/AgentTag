import { decodeHtml } from "./text";
import { CrawlResult } from "./types";

export class CrawlError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CrawlError";
  }
}

const FIRECRAWL_RETRYABLE = new Set([408, 429, 500, 502, 503, 504]);

export async function crawlUrl(targetUrl: string): Promise<CrawlResult> {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();

  if (apiKey) {
    const scraped = await scrapeWithFirecrawl(targetUrl, apiKey);
    if (scraped) return scraped;
  }

  const fetched = await scrapeWithFetch(targetUrl);
  if (fetched) return fetched;

  throw new CrawlError("Could not read this URL.");
}

async function scrapeWithFirecrawl(targetUrl: string, apiKey: string): Promise<CrawlResult | null> {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await fetch("https://api.firecrawl.dev/v2/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ["markdown", "html"],
          timeout: 30000,
        }),
        signal: AbortSignal.timeout(45000),
      });

      const payload = await response.json().catch(() => null);
      if (response.ok && payload && payload.success !== false) {
        const parsed = parseFirecrawlPayload(targetUrl, payload);
        if (parsed) return parsed;
        return null;
      }

      const detail =
        payload?.error ||
        payload?.message ||
        `status ${response.status}`;
      console.error(`[crawl] Firecrawl attempt ${attempt + 1} failed:`, detail);

      if (!FIRECRAWL_RETRYABLE.has(response.status)) return null;
    } catch (err) {
      console.error(
        `[crawl] Firecrawl attempt ${attempt + 1} failed:`,
        err instanceof Error ? err.message : err
      );
    }

    if (attempt < 2) {
      await new Promise((resolve) => setTimeout(resolve, 400 * 2 ** attempt));
    }
  }

  return null;
}

function parseFirecrawlPayload(targetUrl: string, payload: any): CrawlResult | null {
  const data = payload?.data || payload || {};
  const markdown = cleanMarkdownContent(data.markdown || "");
  if (!markdown) return null;

  const title =
    data.metadata?.title ||
    data.metadata?.ogTitle ||
    extractTitleFromMarkdown(markdown) ||
    extractTitleFromUrl(targetUrl);
  const description = data.metadata?.description || data.metadata?.ogDescription || "";
  const html = typeof data.html === "string" ? data.html : "";
  const haystack = `${markdown} ${html}`;

  return {
    url: targetUrl,
    title,
    description,
    markdown,
    framework: detectFramework(`${haystack} ${targetUrl}`, targetUrl),
    detected_features: detectFeatures(haystack),
    booking_url: extractBookingUrl(haystack) || undefined,
  };
}

async function scrapeWithFetch(targetUrl: string): Promise<CrawlResult | null> {
  const res = await fetch(targetUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; AgentTagBot/1.0; +https://agenttag.io)",
      Accept: "text/html,application/xhtml+xml",
    },
    redirect: "follow",
  });

  if (!res.ok) return null;

  const html = await res.text();
  if (!html.trim()) return null;

  const markdown = htmlToCleanMarkdown(html);
  if (!markdown) return null;
  const haystack = `${markdown} ${html}`;

  return {
    url: targetUrl,
    title: extractTitleFromHtml(html) || extractTitleFromMarkdown(markdown) || extractTitleFromUrl(targetUrl),
    description: extractMetaDescription(html),
    markdown,
    framework: detectFramework(`${haystack} ${targetUrl}`, targetUrl),
    detected_features: detectFeatures(haystack),
    booking_url: extractBookingUrl(haystack) || undefined,
  };
}

function extractTitleFromUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const hostParts = parsed.hostname.replace(/^www\./, "").split(".");
    const name = hostParts[0] === "docs" ? hostParts[1] || "Documentation" : hostParts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return "Untitled site";
  }
}

function extractTitleFromMarkdown(markdown: string): string {
  const heading = markdown.match(/^#\s+(.+)$/m);
  return heading ? heading[1].trim() : "";
}

function extractTitleFromHtml(html: string): string {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (match) {
    return decodeEntities(match[1]).trim();
  }
  return "";
}

function extractMetaDescription(html: string): string {
  const match = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
  if (match) {
    return decodeEntities(match[1]).trim();
  }
  return "";
}

function detectFramework(content: string, url: string): string {
  const lower = `${content} ${url}`.toLowerCase();
  if (lower.includes("mintlify")) return "Mintlify";
  if (lower.includes("docusaurus")) return "Docusaurus";
  if (lower.includes("nextra")) return "Nextra";
  if (lower.includes("gitbook")) return "GitBook";
  if (lower.includes("vitepress")) return "VitePress";
  if (lower.includes("starlight")) return "Starlight";
  if (lower.includes("webflow")) return "Webflow";
  if (lower.includes("shopify")) return "Shopify";
  return "";
}

function detectFeatures(content: string): string[] {
  const features: string[] = [];
  const lower = content.toLowerCase();
  if (hasCode(content)) features.push("code");
  if (hasApi(content)) features.push("api");
  if (hasPricing(lower)) features.push("pricing");
  if (hasCheckout(lower)) features.push("checkout");
  if (hasBooking(lower)) features.push("booking");
  if (/case stud|testimonial|our work|portfolio/.test(lower)) features.push("case_studies");
  return features;
}

export function hasCode(content: string): boolean {
  return /```[\s\S]*?```/.test(content) || /<pre[\s>]/i.test(content);
}

export function hasApi(content: string): boolean {
  return /\b(GET|POST|PUT|PATCH|DELETE)\s+\/[a-z0-9_\-/{}.]+/i.test(content) ||
    /\/v\d+\/[a-z0-9_\-/{}.]+/i.test(content);
}

export function hasPricing(lower: string): boolean {
  return /(\$\s?\d|\d+\s?\/\s?(mo|month|yr|year)|pricing|plans?\b)/.test(lower);
}

export function hasCheckout(lower: string): boolean {
  return /\b(checkout|add to cart|buy now|purchase|stripe|lemon.?squeezy|gumroad)\b/.test(lower);
}

export function hasBooking(lower: string): boolean {
  return /\b(calendly|cal\.com|book a (call|demo|meeting)|schedule a (call|demo))\b/.test(lower);
}

export function extractBookingUrl(content: string): string | null {
  const match = content.match(
    /https?:\/\/(?:www\.)?(?:calendly\.com|cal\.com|savvycal\.com|tidycal\.com|(?:meetings\.)?hubspot\.com\/meetings)[^\s)"'<>\\]*/i
  );
  if (!match) return null;
  return match[0].replace(/[.,;]+$/, "");
}

function decodeEntities(text: string): string {
  return decodeHtml(text);
}

function htmlToCleanMarkdown(rawHtml: string): string {
  let text = rawHtml
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, "")
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, "")
    .replace(/<head\b[\s\S]*?<\/head>/gi, "");

  text = text.replace(/<h1[^>]*>([\s\S]*?)<\/h1>/gi, "\n\n# $1\n\n");
  text = text.replace(/<h2[^>]*>([\s\S]*?)<\/h2>/gi, "\n\n## $1\n\n");
  text = text.replace(/<h3[^>]*>([\s\S]*?)<\/h3>/gi, "\n\n### $1\n\n");
  text = text.replace(/<h[4-6][^>]*>([\s\S]*?)<\/h[4-6]>/gi, "\n\n#### $1\n\n");
  text = text.replace(/<pre[^>]*><code[^>]*>([\s\S]*?)<\/code><\/pre>/gi, "\n\n```\n$1\n```\n\n");
  text = text.replace(/<code[^>]*>([\s\S]*?)<\/code>/gi, "`$1`");
  text = text.replace(/<li[^>]*>([\s\S]*?)<\/li>/gi, "\n* $1");
  text = text.replace(/<p[^>]*>([\s\S]*?)<\/p>/gi, "\n\n$1\n\n");
  text = text.replace(/<br\s*\/?>/gi, "\n");
  text = text.replace(/<[^>]+>/g, " ");
  text = decodeEntities(text);

  return text
    .split("\n")
    .map((line) => line.trim().replace(/\s+/g, " "))
    .filter((line) => line.length > 0)
    .join("\n\n")
    .slice(0, 20000);
}

function cleanMarkdownContent(markdown: string): string {
  return markdown
    .replace(/<script\b[\s\S]*?<\/script>/gi, "")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
    .slice(0, 20000);
}
