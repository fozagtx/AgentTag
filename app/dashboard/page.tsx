"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Plus,
  ArrowRight,
  ExternalLink,
  Trash2,
  Search,
  PanelLeft,
  Cpu,
} from "lucide-react";
import { SiteConfig, TelemetryEvent } from "@/lib/types";
import AgentGlobe from "@/components/AgentGlobe";
import { AppSidebar, type DashboardTab } from "@/components/AppSidebar";
import { decodeHtml } from "@/lib/text";

export default function DashboardPage() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteConfig[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [motionReady, setMotionReady] = useState(false);

  const loadDashboardData = async () => {
    try {
      const [sitesRes, telemRes] = await Promise.all([
        fetch("/api/sites"),
        fetch("/api/telemetry?limit=20"),
      ]);

      const sitesData = await sitesRes.json();
      if (sitesRes.ok && sitesData.success && Array.isArray(sitesData.sites)) {
        setSites(sitesData.sites);
      }

      const telemData = await telemRes.json();
      if (telemRes.ok && telemData.success && Array.isArray(telemData.events)) {
        setTelemetry(telemData.events);
      }
    } catch (err) {
      console.error("Error loading dashboard:", err);
    } finally {
      setIsLoadingSites(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const desktop = window.matchMedia("(min-width: 768px)").matches;
    setSidebarOpen(desktop);
    const frame = requestAnimationFrame(() => setMotionReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (showAddModal) {
        setShowAddModal(false);
        return;
      }
      setSidebarOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showAddModal]);

  useEffect(() => {
    if (!showAddModal) return;
    document.getElementById("add-site-url")?.focus();
  }, [showAddModal]);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsScanning(true);
    setStatusMessage("Reading the page...");

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: newUrl }),
      });

      const data = await res.json();
      if (data.success && data.config) {
        setShowAddModal(false);
        setNewUrl("");
        router.push(`/studio/${data.site_id}`);
      } else {
        alert(data.error || "Failed to analyze URL.");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsScanning(false);
    }
  };

  const handleDelete = async (siteId: string) => {
    if (!confirm("Remove this site?")) return;
    try {
      const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      if (res.ok) {
        setSites((prev) => prev.filter((s) => s.site_id !== siteId));
      }
    } catch (err) {
      console.error("Error deleting site:", err);
    }
  };

  const filteredSites = sites.filter(
    (s) =>
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const titles: Record<DashboardTab, string> = {
    overview: "Overview",
    sites: "Sites",
    activity: "Activity",
    tools: "Tools",
  };

  return (
    <div className="flex h-dvh flex-col bg-[#f7f7f5] text-[#161616]">
      <AppSidebar
        sites={sites}
        telemetryCount={telemetry.length}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onLaunch={() => setShowAddModal(true)}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        motionReady={motionReady}
      />

      <div
        className={`app-main ${sidebarOpen ? "is-rail-open" : ""} ${motionReady ? "is-ready" : ""}`}
      >
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-[#e8e8e4] bg-[#f7f7f5] px-4">
          <button
            type="button"
            className="inline-flex size-7 items-center justify-center rounded-md text-[#161616] hover:bg-black/[0.04] transition-colors duration-150"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-label="Toggle sidebar"
            aria-expanded={sidebarOpen}
          >
            <PanelLeft className="size-4" />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-xl truncate">{titles[activeTab]}</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-keycap h-9 min-h-9 px-4 flex items-center gap-2 text-xs"
            type="button"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add site</span>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 max-w-[1400px] w-full mx-auto">
          {(activeTab === "overview" || activeTab === "activity") && (
            <div>
              <AgentGlobe events={telemetry} />
            </div>
          )}

          {(activeTab === "overview" || activeTab === "sites") && (
            <>
              <div className={`${activeTab === "overview" ? "mt-8" : ""} relative max-w-md`}>
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8a8a8a]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search sites"
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white border border-[#e8e8e4] text-sm text-[#161616] placeholder:text-[#8a8a8a] focus:outline-none"
                />
              </div>

              {isLoadingSites ? (
                <div className="p-12 text-center mt-6 rounded-[14px] border border-[#e8e8e4] bg-white">
                  <p className="text-sm text-[#6f6f6f]">Loading sites...</p>
                </div>
              ) : filteredSites.length === 0 ? (
                <div className="p-10 text-center mt-6 rounded-[14px] border border-[#e8e8e4] bg-white">
                  <Globe className="h-6 w-6 text-[#8a8a8a] mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">No sites yet</h3>
                  <p className="text-sm text-[#6f6f6f] max-w-md mx-auto mt-2">
                    Paste a URL to generate tools and a script tag for that site.
                  </p>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="btn-keycap mt-6 h-9 px-4 inline-flex items-center gap-2 text-xs"
                    type="button"
                  >
                    <Plus className="h-4 w-4" />
                    Add site
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {filteredSites.map((site) => (
                    <div
                      key={site.site_id}
                      className="p-5 rounded-[14px] bg-white border border-[#e8e8e4] flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="text-base font-semibold truncate">{decodeHtml(site.title)}</h3>
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs font-mono text-[#6f6f6f] hover:text-[#161616] flex items-center gap-1 mt-1 truncate"
                            >
                              <span className="truncate">{site.url}</span>
                              <ExternalLink className="h-3 w-3 shrink-0" />
                            </a>
                          </div>
                          <button
                            onClick={() => handleDelete(site.site_id)}
                            className="p-1.5 min-h-9 min-w-9 rounded-lg text-[#8a8a8a] hover:text-[#161616] hover:bg-black/[0.04] flex items-center justify-center"
                            title="Remove site"
                            type="button"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        {(site.tools?.length || 0) > 0 ? (
                          <div className="mt-4 flex flex-wrap gap-1.5">
                            {site.tools.map((tool) => (
                              <span
                                key={tool.id}
                                className="px-2 py-0.5 rounded-md bg-[#f7f7f5] border border-[#e8e8e4] font-mono text-[11px] text-[#6f6f6f]"
                              >
                                {tool.name}
                              </span>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <div className="mt-5 pt-3 border-t border-[#e8e8e4] flex justify-end">
                        <Link
                          href={`/studio/${site.site_id}`}
                          className="h-9 px-4 rounded-lg bg-[#f7f7f5] border border-[#e8e8e4] text-xs font-medium hover:bg-[#efefed] flex items-center gap-1.5"
                        >
                          Open
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === "tools" && (
            <div className="space-y-3">
              {sites.length === 0 ? (
                <div className="p-10 text-center rounded-[14px] border border-[#e8e8e4] bg-white">
                  <h3 className="text-lg font-semibold">No tools yet</h3>
                  <p className="text-sm text-[#6f6f6f] mt-2">Add a site first.</p>
                </div>
              ) : (
                sites.flatMap((site) =>
                  (site.tools || []).map((tool) => (
                    <div
                      key={`${site.site_id}-${tool.id}`}
                      className="p-4 rounded-[12px] bg-white border border-[#e8e8e4] flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="font-mono text-sm truncate">{tool.name}</div>
                        <div className="text-xs text-[#6f6f6f] truncate">{tool.description}</div>
                      </div>
                      <Link
                        href={`/studio/${site.site_id}`}
                        className="shrink-0 h-9 px-3 rounded-lg bg-[#f7f7f5] border border-[#e8e8e4] text-xs hover:bg-[#efefed] flex items-center"
                      >
                        {decodeHtml(site.title)}
                      </Link>
                    </div>
                  ))
                )
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={`t-modal-scrim ${showAddModal ? "is-open" : ""}`}
        onClick={() => setShowAddModal(false)}
        inert={showAddModal ? undefined : true}
      >
        <div
          className={`t-modal bg-white border border-[#e8e8e4] rounded-[14px] max-w-lg w-full p-6 sm:p-8 relative text-[#161616] ${showAddModal ? "is-open" : ""}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="add-site-title"
          onClick={(e) => e.stopPropagation()}
        >
            <div className="flex items-center justify-between pb-3 border-b border-[#e8e8e4]">
              <h3 id="add-site-title" className="text-lg font-semibold">Add a site</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-sm text-[#6f6f6f] hover:text-[#161616]"
                type="button"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#6f6f6f] mb-1.5">Website URL</label>
                <input
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://docs.yourcompany.com"
                  id="add-site-url"
                  className="w-full px-3.5 py-2.5 rounded-lg bg-[#f7f7f5] border border-[#e8e8e4] text-sm text-[#161616] focus:outline-none min-h-[44px]"
                  disabled={isScanning}
                />
              </div>

              {isScanning && (
                <p className="text-xs text-[#6f6f6f]">{statusMessage}</p>
              )}

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 min-h-[44px] rounded-lg text-sm text-[#6f6f6f] border border-[#e8e8e4]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScanning || !newUrl.trim()}
                  className="btn-keycap min-h-[44px] px-5 flex items-center gap-2 disabled:opacity-50"
                >
                  {isScanning ? <Cpu className="h-4 w-4 animate-spin-fast" /> : <ArrowRight className="h-4 w-4" />}
                  <span>{isScanning ? "Working" : "Add site"}</span>
                </button>
              </div>
            </form>
        </div>
      </div>
    </div>
  );
}
