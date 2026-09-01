import { CanvasElement, ElementKind, KIND_HINTS } from "./elements";

const HEADING_KIND: Record<string, ElementKind> = {
  sponsor: "sponsor",
  sponsors: "sponsor",
  partner: "sponsor",
  partners: "sponsor",
  prize: "sponsor",
  prizes: "sponsor",
  tech: "sponsor",
  technology: "sponsor",
  stack: "sponsor",
  industry: "industry",
  industries: "industry",
  domain: "industry",
};

export function ingestText(raw: string): Omit<CanvasElement, "id">[] {
  const text = raw.replace(/\u0000/g, " ").slice(0, 200_000);
  const found = new Map<string, ElementKind>();

  for (const hint of KIND_HINTS) {
    const re = new RegExp(`\\b${escapeRe(hint.name)}\\b`, "i");
    if (re.test(text)) found.set(hint.name, hint.kind);
  }

  const lines = text.split(/\r?\n/);
  let current: ElementKind = "sponsor";
  for (const line of lines) {
    const heading = line.trim().toLowerCase().replace(/[:#*-]/g, "").trim();
    if (HEADING_KIND[heading]) {
      current = HEADING_KIND[heading];
      continue;
    }
    const listed = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)$/);
    if (listed) {
      const name = cleanName(listed[1]);
      if (name) found.set(name, current);
    }
  }

  const sponsorLine = text.match(/(?:sponsors?|powered by|presented by|in partnership with)[:\s]+([^\n.]{3,120})/i);
  if (sponsorLine) {
    for (const part of sponsorLine[1].split(/,|&| and /i)) {
      const name = cleanName(part);
      if (name) found.set(name, found.get(name) || "sponsor");
    }
  }

  return Array.from(found.entries())
    .slice(0, 24)
    .map(([name, kind]) => ({ name, kind }));
}

function cleanName(value: string): string | null {
  const name = value
    .replace(/\(.*?\)/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/^[-*•]+\s*/, "")
    .replace(/\s+/g, " ")
    .trim();
  if (name.length < 2 || name.length > 40) return null;
  if (/^(the|and|or|for|with|from)$/i.test(name)) return null;
  return name;
}

function escapeRe(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
