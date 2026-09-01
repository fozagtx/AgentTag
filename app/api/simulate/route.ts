import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, recordTelemetryEvent } from "@/lib/db";
import { runToolAgainstSnapshot } from "@/lib/run-tool";

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const { siteId, toolName, args } = await req.json();

    if (!siteId || !toolName) {
      return NextResponse.json({ error: "siteId and toolName are required." }, { status: 400 });
    }

    const config = await getSiteConfig(siteId);
    if (!config) {
      return NextResponse.json({ error: "Site not found." }, { status: 404 });
    }

    const tool = config.tools.find((t) => t.name === toolName);
    if (!tool) {
      return NextResponse.json({ error: `Tool ${toolName} not found on this site.` }, { status: 404 });
    }

    const markdown = config.markdown_snapshot || "";
    const result = runToolAgainstSnapshot(tool.name, tool.execution_type, args || {}, markdown, config.url);

    const duration = Date.now() - startTime;

    await recordTelemetryEvent({
      site_id: config.site_id,
      site_title: config.title,
      tool_name: toolName,
      args: args || {},
      client_type: "Studio",
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
    return NextResponse.json({ error: "Couldn't run this tool." }, { status: 500 });
  }
}
