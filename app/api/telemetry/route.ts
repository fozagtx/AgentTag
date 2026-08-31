import { NextRequest, NextResponse } from "next/server";
import { getTelemetryEvents, recordTelemetryEvent } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const limit = Number(req.nextUrl.searchParams.get("limit") || "25");
    const events = await getTelemetryEvents(limit);
    return NextResponse.json({
      success: true,
      events,
      count: events.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch telemetry events" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const event = await recordTelemetryEvent({
      site_id: body.site_id || "unknown",
      site_title: body.site_title || "Web Resource",
      tool_name: body.tool_name || "ping",
      args: body.args || {},
      client_type: body.client_type || "Claude Desktop",
      status: body.status || "success",
      duration_ms: body.duration_ms || Math.floor(Math.random() * 60) + 15,
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record telemetry" },
      { status: 500 }
    );
  }
}
