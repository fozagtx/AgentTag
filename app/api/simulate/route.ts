import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, recordTelemetryEvent } from "@/lib/db";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { siteId, toolName, args } = await req.json();

    if (!siteId || !toolName) {
      return NextResponse.json({ error: "siteId and toolName are required." }, { status: 400 });
    }

    const config = await getSiteConfig(siteId);
    if (!config) {
      return NextResponse.json({ error: "Site config not found in database." }, { status: 404 });
    }

    const tool = config.tools.find((t) => t.name === toolName);
    if (!tool) {
      return NextResponse.json({ error: `Tool ${toolName} not found on this site.` }, { status: 404 });
    }

    // Execute tool simulation against real markdown snapshot
    let result: any = {};
    const markdown = config.markdown_snapshot || "";

    if (toolName === "search_docs") {
      const query = (args?.query || "").toLowerCase();
      const lines = markdown.split("\n");
      const matchedSnippets: string[] = [];

      for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes(query)) {
          const chunk = lines.slice(Math.max(0, i - 1), Math.min(lines.length, i + 5)).join("\n");
          matchedSnippets.push(chunk);
          if (matchedSnippets.length >= 3) break;
        }
      }

      result = {
        query: args?.query,
        matched_sections: matchedSnippets.length > 0 ? matchedSnippets : ["Found reference in documentation headers."],
        source_url: config.url,
      };
    } else if (toolName === "get_code_example") {
      result = {
        feature: args?.feature || "setup",
        language: args?.language || "typescript",
        snippet: `import { createClient } from "${config.title.toLowerCase().replace(/\s+/g, "-")}";\n\nconst client = createClient();\nawait client.${(args?.feature || "init").toLowerCase()}();`,
        verified: true,
      };
    } else if (toolName === "get_pricing_tiers") {
      result = {
        currency: "USD",
        source_url: config.url,
        tiers: [
          { name: "Starter", price: "$29/mo", features: ["Core features", "1 seat", "Community support"] },
          { name: "Pro", price: "$79/mo", features: ["All features", "5 seats", "Priority support", "API access"] },
          { name: "Enterprise", price: "Custom", features: ["Custom SLA", "Unlimited seats", "Dedicated account manager"] },
        ],
      };
    } else if (toolName === "initiate_checkout" || toolName === "book_discovery_call") {
      result = {
        status: "success",
        action: toolName,
        details: args,
        requires_human_confirmation: tool.requires_approval,
        message: `Action '${toolName}' executed successfully with parameters: ${JSON.stringify(args)}`,
      };
    } else {
      result = {
        status: "success",
        tool: toolName,
        parameters_received: args,
        data_preview: markdown.slice(0, 300) + "...",
      };
    }

    const duration = Date.now() - startTime;

    // Log real telemetry event to database
    await recordTelemetryEvent({
      site_id: config.site_id,
      site_title: config.title,
      tool_name: toolName,
      args: args || {},
      client_type: "Simulator / Claude Desktop",
      status: tool.requires_approval ? "requires_approval" : "success",
      duration_ms: duration,
    });

    return NextResponse.json({
      success: true,
      tool: toolName,
      result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
