import { NextRequest, NextResponse } from "next/server";
import { getSiteConfig, saveSiteConfig, deleteSiteConfig } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const config = await getSiteConfig(siteId);

    if (!config) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      config,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Couldn't load this site." },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    const existing = await getSiteConfig(siteId);

    if (!existing) {
      return NextResponse.json(
        { success: false, error: "Site not found" },
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
      { success: false, error: "Couldn't update this site." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ siteId: string }> }
) {
  try {
    const { siteId } = await params;
    await deleteSiteConfig(siteId);

    return NextResponse.json({
      success: true,
      message: `Site ${siteId} deleted successfully`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: "Couldn't delete this site." },
      { status: 500 }
    );
  }
}
