import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, saveSiteConfig, deleteSiteConfig } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const siteId = params.siteId;
    const config = await getSiteConfig(siteId);

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Site config not found in database" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to retrieve site config" },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const siteId = params.siteId;
    const existing = await getSiteConfig(siteId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Site config not found in database" },
        { status: 404 }
      );
    }

    const body = await req.json();
    const updated = {
      ...existing,
      ...body,
      updated_at: new Date().toISOString(),
    };

    await saveSiteConfig(updated);

    return NextResponse.json({
      success: true,
      config: updated,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update site config" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { siteId: string } }
) {
  try {
    const siteId = params.siteId;
    await deleteSiteConfig(siteId);

    return NextResponse.json({
      success: true,
      message: `Site ${siteId} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete site" },
      { status: 500 }
    );
  }
}
