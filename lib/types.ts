export type SiteType = "portfolio";

export interface ToolParameterProperty {
  type: string;
  description: string;
  enum?: string[];
}

export interface ToolParameters {
  type: "object";
  properties: Record<string, ToolParameterProperty>;
  required?: string[];
}

export interface WebMCPTool {
  id: string;
  name: string;
  description: string;
  parameters: ToolParameters;
  execution_type: "dom_search" | "cached_extract" | "dom_action" | "api_trigger";
  action_target?: string; // CSS selector or API endpoint
  is_enabled: boolean;
  requires_approval: boolean; // For HITL consent toast
}

export interface SiteConfig {
  site_id: string;
  url: string;
  title: string;
  description?: string;
  site_type: SiteType;
  framework?: string; // e.g. "Mintlify", "Docusaurus", "Webflow", "Nextra"
  tools: WebMCPTool[];
  markdown_snapshot?: string;
  created_at: string;
  updated_at: string;
}

export interface TelemetryEvent {
  id: string;
  site_id: string;
  site_title: string;
  tool_name: string;
  args: Record<string, any>;
  client_type: string;
  status: "success" | "requires_approval" | "error";
  duration_ms: number;
  created_at: string;
}

export interface CrawlResult {
  url: string;
  title: string;
  description?: string;
  markdown: string;
  framework?: string;
  detected_features: string[];
  booking_url?: string;
}
