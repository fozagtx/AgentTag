import { extractBookingUrl } from "./firecrawl";
import { CrawlResult, SiteType, WebMCPTool } from "./types";

export function synthesizeTools(crawl: CrawlResult, _siteType?: SiteType | string): WebMCPTool[] {
  const brandName = crawl.title.replace(/\s*[|\-–].*$/, "").trim() || "this portfolio";
  const bookingUrl = crawl.booking_url || extractBookingUrl(`${crawl.markdown || ""} ${crawl.description || ""}`);
  const tools: WebMCPTool[] = [];

  tools.push({
    id: "tool_search_work",
    name: "search_work",
    description: `Search the work, projects, and writing on ${brandName}.`,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "What to find on the portfolio",
        },
      },
      required: ["query"],
    },
    execution_type: "dom_search",
    is_enabled: true,
    requires_approval: false,
  });

  tools.push({
    id: "tool_get_projects",
    name: "get_projects",
    description: `Return projects and work listed on ${brandName}.`,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Optional keyword to match a project",
        },
      },
    },
    execution_type: "cached_extract",
    is_enabled: true,
    requires_approval: false,
  });

  tools.push({
    id: "tool_book_call",
    name: "book_call",
    description: bookingUrl
      ? `Book a call using the scheduler on ${brandName}.`
      : `Book a call if ${brandName} has a scheduler on the page.`,
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Full name" },
        email: { type: "string", description: "Email" },
        preferred_time: { type: "string", description: "Preferred time" },
      },
      required: ["name", "email"],
    },
    execution_type: "dom_action",
    action_target: bookingUrl || undefined,
    is_enabled: true,
    requires_approval: true,
  });

  return tools;
}
