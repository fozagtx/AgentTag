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

  if (toolName === "get_code_example") {
    const feature = String(args.feature || "").trim();
    const language = String(args.language || "").trim().toLowerCase();
    const fences = extractFences(markdown).filter((fence) => {
      const blob = `${fence.lang}\n${fence.code}`.toLowerCase();
      const langOk = !language || fence.lang.toLowerCase() === language;
      const featureOk = !feature || blob.includes(feature.toLowerCase());
      return langOk && featureOk;
    });
    const picked = (fences.length > 0 ? fences : extractFences(markdown)).slice(0, 3);
    return {
      feature: feature || null,
      language: language || null,
      snippets: picked,
      source_url: sourceUrl,
    };
  }

  if (toolName === "get_api_reference") {
    const needle = String(args.endpoint_or_method || "").trim();
    const hits = matchMarkdown(markdown, needle || "GET /", 5).filter((chunk) =>
      /\b(GET|POST|PUT|PATCH|DELETE)\b|\/v\d+\//i.test(chunk)
    );
    return {
      endpoint_or_method: needle || null,
      excerpts: hits.length > 0 ? hits : matchMarkdown(markdown, needle, 3),
      source_url: sourceUrl,
    };
  }

  if (toolName === "get_pricing_tiers") {
    const excerpts = markdown
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => /(\$\s?\d|\d+\s?\/\s?(mo|month|yr|year)|pricing|plan)/i.test(line))
      .slice(0, 20);
    return { excerpts, source_url: sourceUrl };
  }

  if (toolName === "get_case_studies") {
    const industry = String(args.industry || "").trim();
    return {
      industry: industry || null,
      excerpts: matchMarkdown(markdown, industry || "case", 4),
      source_url: sourceUrl,
    };
  }

  if (executionType === "dom_action") {
    return {
      status: "queued_on_page",
      tool: toolName,
      args,
      source_url: sourceUrl,
      note: "This action runs on the live site after confirmation.",
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

function extractFences(markdown: string): { lang: string; code: string }[] {
  const fences: { lang: string; code: string }[] = [];
  const re = /```([a-zA-Z0-9_+-]*)\n([\s\S]*?)```/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown))) {
    fences.push({ lang: match[1] || "", code: match[2].trim() });
  }
  return fences;
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
