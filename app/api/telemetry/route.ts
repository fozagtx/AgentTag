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
      { success: false, error: "Couldn't load activity." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.site_id || !body.tool_name) {
      return NextResponse.json(
        { success: false, error: "site_id and tool_name are required" },
        { status: 400 }
      );
    }

    const status =
      body.status === "requires_approval" || body.status === "error" || body.status === "success"
        ? body.status
        : "success";

    const event = await recordTelemetryEvent({
      site_id: String(body.site_id),
      site_title: body.site_title ? String(body.site_title) : String(body.site_id),
      tool_name: String(body.tool_name),
      args: body.args && typeof body.args === "object" ? body.args : {},
      client_type: body.client_type ? String(body.client_type) : "unknown",
      status,
      duration_ms: typeof body.duration_ms === "number" ? body.duration_ms : 0,
    });

    return NextResponse.json({
      success: true,
      event,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Couldn't record this call." },
      { status: 500 }
    );
  }
}
