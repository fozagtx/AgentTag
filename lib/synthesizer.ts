import { hasApi, hasBooking, hasCheckout, hasCode, hasPricing } from "./firecrawl";
import { CrawlResult, SiteType, WebMCPTool } from "./types";

export function synthesizeTools(crawl: CrawlResult, _siteType?: SiteType | string): WebMCPTool[] {
  const brandName = crawl.title.replace(/\s*[|\-–].*$/, "").trim() || "this site";
  const markdown = crawl.markdown || "";
  const haystack = `${markdown}\n${crawl.title}\n${crawl.description || ""}`;
  const lower = haystack.toLowerCase();
  const features = new Set(crawl.detected_features);
  const languages = languagesFromMarkdown(markdown);
  const endpoints = endpointsFromMarkdown(markdown);
  const tools: WebMCPTool[] = [];

  tools.push({
    id: "tool_search_docs",
    name: "search_docs",
    description: `Search the live page content from ${brandName}.`,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Word, phrase, or question to find on the page",
        },
      },
      required: ["query"],
    },
    execution_type: "dom_search",
    is_enabled: true,
    requires_approval: false,
  });

  if (features.has("code") || hasCode(haystack)) {
    const langEnum = languages.length > 0 ? languages : undefined;
    tools.push({
      id: "tool_get_code_example",
      name: "get_code_example",
      description: `Return a code sample that appears on ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          feature: {
            type: "string",
            description: "Feature or heading to match against samples on the page",
          },
          ...(langEnum
            ? {
                language: {
                  type: "string",
                  enum: langEnum,
                  description: "Language of the sample",
                },
              }
            : {}),
        },
        required: ["feature"],
      },
      execution_type: "cached_extract",
      is_enabled: true,
      requires_approval: false,
    });
  }

  if (features.has("api") || hasApi(haystack) || endpoints.length > 0) {
    tools.push({
      id: "tool_get_api_reference",
      name: "get_api_reference",
      description: `Return API paths and methods documented on ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          endpoint_or_method: {
            type: "string",
            description: endpoints[0]
              ? `Endpoint or method as written on the page (e.g. '${endpoints[0]}')`
              : "Endpoint or method as written on the page",
          },
        },
        required: ["endpoint_or_method"],
      },
      execution_type: "cached_extract",
      is_enabled: true,
      requires_approval: false,
    });
  }

  if (features.has("pricing") || hasPricing(lower)) {
    tools.push({
      id: "tool_get_pricing_tiers",
      name: "get_pricing_tiers",
      description: `Return pricing text found on ${brandName}.`,
      parameters: {
        type: "object",
        properties: {},
      },
      execution_type: "cached_extract",
      is_enabled: true,
      requires_approval: false,
    });
  }

  if (features.has("checkout") || hasCheckout(lower)) {
    tools.push({
      id: "tool_initiate_checkout",
      name: "initiate_checkout",
      description: `Start checkout using a product or plan named on ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          tier_name: {
            type: "string",
            description: "Product or plan name as it appears on the page",
          },
        },
        required: ["tier_name"],
      },
      execution_type: "dom_action",
      is_enabled: true,
      requires_approval: true,
    });
  }

  if (features.has("booking") || hasBooking(lower)) {
    tools.push({
      id: "tool_book_discovery_call",
      name: "book_discovery_call",
      description: `Book a call using the scheduler linked from ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name" },
          email: { type: "string", description: "Email" },
          preferred_time: { type: "string", description: "Preferred time as written by the user" },
        },
        required: ["name", "email"],
      },
      execution_type: "dom_action",
      is_enabled: true,
      requires_approval: true,
    });
  }

  if (features.has("case_studies") || /case stud|testimonial/.test(lower)) {
    tools.push({
      id: "tool_get_case_studies",
      name: "get_case_studies",
      description: `Return case studies or testimonials written on ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          industry: {
            type: "string",
            description: "Optional keyword to match",
          },
        },
      },
      execution_type: "cached_extract",
      is_enabled: true,
      requires_approval: false,
    });
  }

  return tools;
}

function languagesFromMarkdown(markdown: string): string[] {
  const found = new Set<string>();
  const re = /```([a-zA-Z0-9_+-]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown))) {
    const lang = match[1].toLowerCase();
    if (lang && lang !== "text" && lang !== "plain") found.add(lang);
  }
  return Array.from(found).slice(0, 8);
}

function endpointsFromMarkdown(markdown: string): string[] {
  const found = new Set<string>();
  const re = /\b(GET|POST|PUT|PATCH|DELETE)\s+(\/[a-zA-Z0-9_\-/{}.]+)/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(markdown))) {
    found.add(`${match[1]} ${match[2]}`);
  }
  return Array.from(found).slice(0, 12);
}
