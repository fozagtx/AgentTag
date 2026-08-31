import { CrawlResult, SiteType, WebMCPTool } from "./types";

export function synthesizeTools(crawl: CrawlResult, siteType?: string): WebMCPTool[] {
  const brandName = crawl.title.replace(/Docs|Documentation|Home|Official/gi, "").trim() || "Website";
  const content = (crawl.markdown + " " + crawl.title + " " + (crawl.description || "")).toLowerCase();

  const isDocSite = siteType === "documentation" || crawl.detected_features.includes("Code Snippets") || content.includes("quickstart") || content.includes("api");
  const hasCommerce = siteType === "commerce_landing" || crawl.detected_features.includes("Pricing & Plans") || crawl.detected_features.includes("Checkout / E-Commerce") || content.includes("pricing") || content.includes("plan");
  const hasBooking = crawl.detected_features.includes("Booking Calendar") || content.includes("book a call") || content.includes("schedule") || content.includes("calendly") || content.includes("cal.com");

  const tools: WebMCPTool[] = [];

  // 1. Universal Knowledge & Search Tool
  tools.push({
    id: "tool_search_content",
    name: "search_content",
    description: `Searches ${brandName} for guides, features, documentation, pricing details, and answers.`,
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Search keyword, question, or topic to lookup",
        },
      },
      required: ["query"],
    },
    execution_type: "dom_search",
    is_enabled: true,
    requires_approval: false,
  });

  // 2. Code & Developer Tools (if doc / code elements detected)
  if (isDocSite || true) {
    tools.push({
      id: "tool_get_code_example",
      name: "get_code_example",
      description: `Fetches verified, copy-pasteable code snippets and setup boilerplate for ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          feature: {
            type: "string",
            description: "Feature or method to retrieve code for (e.g. 'auth', 'webhooks', 'client setup')",
          },
          language: {
            type: "string",
            enum: ["typescript", "javascript", "python", "go", "bash", "curl"],
            description: "Programming language for the code snippet",
          },
        },
        required: ["feature"],
      },
      execution_type: "cached_extract",
      is_enabled: true,
      requires_approval: false,
    });

    tools.push({
      id: "tool_get_api_reference",
      name: "get_api_reference",
      description: `Returns complete API parameters, return types, endpoints, and method signatures for ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          endpoint_or_method: {
            type: "string",
            description: "Endpoint or function name (e.g. 'POST /v1/checkout' or 'client.init')",
          },
        },
        required: ["endpoint_or_method"],
      },
      execution_type: "cached_extract",
      is_enabled: true,
      requires_approval: false,
    });
  }

  // 3. Pricing & Commerce Tools
  if (hasCommerce || true) {
    tools.push({
      id: "tool_get_pricing_tiers",
      name: "get_pricing_tiers",
      description: `Retrieves all available pricing tiers, subscription options, feature matrices, and license terms for ${brandName}.`,
      parameters: {
        type: "object",
        properties: {},
      },
      execution_type: "cached_extract",
      is_enabled: true,
      requires_approval: false,
    });

    tools.push({
      id: "tool_initiate_checkout",
      name: "initiate_checkout",
      description: `Initiates a purchase or triggers the checkout modal for a selected product or plan tier on ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          tier_name: {
            type: "string",
            description: "The name of the tier or product to buy (e.g. 'Pro', 'Lifetime License', 'Starter')",
          },
          buyer_email: {
            type: "string",
            description: "The email address of the buyer",
          },
          promo_code: {
            type: "string",
            description: "Optional coupon or discount code to apply",
          },
        },
        required: ["tier_name"],
      },
      execution_type: "dom_action",
      is_enabled: true,
      requires_approval: true, // HITL approval required
    });
  }

  // 4. Agency / Lead / Booking Tools
  if (hasBooking || true) {
    tools.push({
      id: "tool_book_discovery_call",
      name: "book_discovery_call",
      description: `Books a discovery call or meeting with the ${brandName} team via their embedded scheduling calendar.`,
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Full name of the contact" },
          email: { type: "string", description: "Email address of the contact" },
          preferred_time: { type: "string", description: "Preferred date and time (ISO format or descriptive string)" },
          notes: { type: "string", description: "Agenda, project scope, or questions for the call" },
        },
        required: ["name", "email", "preferred_time"],
      },
      execution_type: "dom_action",
      is_enabled: true,
      requires_approval: true, // HITL approval required
    });

    tools.push({
      id: "tool_get_case_studies",
      name: "get_case_studies",
      description: `Returns client case studies, verified results, testimonials, and portfolio metrics from ${brandName}.`,
      parameters: {
        type: "object",
        properties: {
          industry: {
            type: "string",
            description: "Target industry (e.g. 'fintech', 'saas', 'e-commerce', 'design')",
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
