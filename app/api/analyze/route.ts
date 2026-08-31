import { NextRequest, NextResponse } from "next/server";
import { crawlUrl } from "@/lib/firecrawl";
import { synthesizeTools } from "@/lib/synthesizer";
import { saveSiteConfig } from "@/lib/db";
import { SiteConfig, SiteType } from "@/lib/types";

function generateSiteId(siteType: string, url: string): string {
  const prefix = siteType === "documentation" ? "doc" : "site";
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${randomSuffix}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { url, site_type = "documentation" } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Valid website URL is required." }, { status: 400 });
    }

    // Format URL
    let formattedUrl = url.trim();
    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = "https://" + formattedUrl;
    }

    console.log(`[WebMCP API] Analyzing URL: ${formattedUrl} (Type: ${site_type})`);

    // 1. Crawl & extract page content
    const crawlResult = await crawlUrl(formattedUrl);

    // 2. Synthesize MCP tools
    const tools = synthesizeTools(crawlResult, site_type as SiteType);

    // 3. Create persistent site config
    const siteId = generateSiteId(site_type, formattedUrl);
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

    // 4. Save to Neon DB / Memory Store
    await saveSiteConfig(siteConfig);

    return NextResponse.json({
      success: true,
      site_id: siteId,
      config: siteConfig,
      features: crawlResult.detected_features,
    });
  } catch (error: any) {
    console.error("[WebMCP API] Analysis failed:", error);
    return NextResponse.json(
      { error: error.message || "Failed to analyze website." },
      { status: 500 }
    );
  }
}
