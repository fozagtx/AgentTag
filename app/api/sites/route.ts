import { NextResponse } from "next/server";
import { getAllSiteConfigs } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const sites = await getAllSiteConfigs();
    return NextResponse.json({
      success: true,
      sites,
      count: sites.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch sites" },
      { status: 500 }
    );
  }
}
