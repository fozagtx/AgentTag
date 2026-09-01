import { NextRequest, NextResponse } from "next/server";
import { crawlUrl, CrawlError } from "@/lib/firecrawl";
import { synthesizeTools } from "@/lib/synthesizer";
import { saveSiteConfig } from "@/lib/db";
import { SiteConfig, SiteType } from "@/lib/types";

function generateSiteId(): string {
  return `folio_${Math.random().toString(36).substring(2, 8)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url } = body;
    const site_type: SiteType = "portfolio";

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid website URL is required." }, { status: 400 });
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    const crawlResult = await crawlUrl(formattedUrl);
    const tools = synthesizeTools(crawlResult, site_type);
    const siteId = generateSiteId();
    const siteConfig: SiteConfig = {
      site_id: siteId,
      url: formattedUrl,
      title: crawlResult.title,
      description: crawlResult.description,
      site_type: site_type as SiteType,
      framework: crawlResult.framework,
      tools: tools,
      markdown_snapshot: crawlResult.markdown,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    await saveSiteConfig(siteConfig);

    return NextResponse.json({
      success: true,
      site_id: siteId,
      config: siteConfig,
      features: crawlResult.detected_features,
    });
  } catch (error: any) {
    console.error("[WebMCP API] Analysis failed:", error);
    const message =
      error instanceof CrawlError ? error.message : "Couldn't read this URL.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
