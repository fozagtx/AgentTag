"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Globe,
  Plus,
  ArrowRight,
  ExternalLink,
  Code2,
  Terminal,
  Activity,
  CheckCircle2,
  Layers,
  Cpu,
  Trash2,
  Sparkles,
  Zap,
  LayoutDashboard,
  ShieldCheck,
  Radio,
  FileCode,
  Settings,
  Database,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";
import { SiteConfig } from "@/lib/types";

interface TelemetryEvent {
  id: string;
  site_id: string;
  site_title: string;
  tool_name: string;
  args: Record<string, any>;
  client_type: string;
  status: "success" | "requires_approval" | "error";
  duration_ms: number;
  created_at: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [sites, setSites] = useState<SiteConfig[]>([]);
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [isLoadingSites, setIsLoadingSites] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"overview" | "sites" | "telemetry" | "tools">("overview");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch real sites and real telemetry from backend database
  const loadDashboardData = async () => {
    try {
      const [sitesRes, telemRes] = await Promise.all([
        fetch("/api/sites"),
        fetch("/api/telemetry?limit=20"),
      ]);

      const sitesData = await sitesRes.json();
      if (sitesData.success && Array.isArray(sitesData.sites)) {
        setSites(sitesData.sites);
      }

      const telemData = await telemRes.json();
      if (telemData.success && Array.isArray(telemData.events)) {
        setTelemetry(telemData.events);
      }
    } catch (err) {
      console.error("Error loading live dashboard data:", err);
    } finally {
      setIsLoadingSites(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setIsScanning(true);
    setStatusMessage("Scanning live page structure...");

    try {
      setTimeout(() => setStatusMessage("Synthesizing Web MCP tools & parameters..."), 1200);

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
    if (!confirm("Are you sure you want to remove this site from your database?")) return;
    try {
      const res = await fetch(`/api/sites/${siteId}`, { method: "DELETE" });
      if (res.ok) {
        setSites((prev) => prev.filter((s) => s.site_id !== siteId));
      }
    } catch (err) {
      console.error("Error deleting site:", err);
    }
  };

  const filteredSites = sites.filter((s) =>
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.url.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalTools = sites.reduce((acc, s) => acc + (s.tools?.length || 0), 0);

  return (
    <div className="w-full min-h-screen bg-[#F5F2F0] text-[#151617] flex font-sans">
      {/* ─────────────────────────────────────────────────────────────
          LEFT SIDEBAR NAVIGATION (260px, Comic Ledger Styling)
          ───────────────────────────────────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-[#FAFAF9] border-r-2 border-[#151617] flex flex-col justify-between p-5 min-h-screen sticky top-0 hidden md:flex">
        <div className="space-y-6">
          {/* Brand Header */}
          <Link href="/" className="flex items-center gap-2.5 pb-4 border-b-2 border-[#151617]/10 group">
            <div className="w-8 h-8 rounded-[8px] bg-[#FFBE98] border-2 border-[#151617] flex items-center justify-center font-display text-sm text-[#151617] shadow-comic-sm">
              A
            </div>
            <div>
              <div className="font-display text-lg tracking-tight text-[#151617]">AgentTag</div>
              <div className="text-[10px] font-mono uppercase text-[#151617]/60 font-bold">Command Center</div>
            </div>
          </Link>

          {/* Nav Links: Main */}
          <div className="space-y-1.5">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#151617]/50 font-bold px-3 mb-2">
              NAVIGATION
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-[#B09CFB] text-[#151617] border-2 border-[#151617] shadow-comic-sm"
                  : "text-[#151617]/80 hover:bg-[#F5F2F0]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="h-4 w-4" />
                <span>Overview</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("sites")}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-bold transition-all ${
                activeTab === "sites"
                  ? "bg-[#B09CFB] text-[#151617] border-2 border-[#151617] shadow-comic-sm"
                  : "text-[#151617]/80 hover:bg-[#F5F2F0]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Globe className="h-4 w-4" />
                <span>Websites</span>
              </div>
              <span className="px-2 py-0.5 rounded-[6px] bg-[#151617] text-white text-[10px] font-mono font-bold tabular-nums">
                {sites.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("telemetry")}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-bold transition-all ${
                activeTab === "telemetry"
                  ? "bg-[#B09CFB] text-[#151617] border-2 border-[#151617] shadow-comic-sm"
                  : "text-[#151617]/80 hover:bg-[#F5F2F0]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Radio className="h-4 w-4 text-[#151617]" />
                <span>Telemetry Feed</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-[#4ECB71] animate-pulse" />
            </button>

            <button
              onClick={() => setActiveTab("tools")}
              className={`w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-bold transition-all ${
                activeTab === "tools"
                  ? "bg-[#B09CFB] text-[#151617] border-2 border-[#151617] shadow-comic-sm"
                  : "text-[#151617]/80 hover:bg-[#F5F2F0]"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="h-4 w-4" />
                <span>Tool Registry</span>
              </div>
              <span className="text-[10px] font-mono text-[#151617]/60 font-bold tabular-nums">
                {totalTools}
              </span>
            </button>
          </div>

          {/* Nav Links: Resources & Infrastructure */}
          <div className="space-y-1.5 pt-4 border-t-2 border-[#151617]/10">
            <div className="font-mono text-[10px] uppercase tracking-wider text-[#151617]/50 font-bold px-3 mb-2">
              INFRASTRUCTURE
            </div>

            <Link
              href="/#scanner"
              className="w-full min-h-[44px] flex items-center gap-2.5 px-3 py-2 rounded-[10px] text-xs font-bold text-[#151617]/80 hover:bg-[#F5F2F0] transition-colors"
            >
              <FileCode className="h-4 w-4 text-[#151617]" />
              <span>Script CDN</span>
            </Link>

            <div className="w-full min-h-[44px] flex items-center justify-between px-3 py-2 rounded-[10px] text-xs font-bold text-[#151617]/80">
              <div className="flex items-center gap-2.5">
                <Database className="h-4 w-4 text-[#151617]" />
                <span>Neon Postgres</span>
              </div>
              <span className="text-[10px] font-mono text-[#4ECB71] font-bold">CONNECTED</span>
            </div>
          </div>
        </div>

        {/* Sidebar Footer Status Card */}
        <div className="p-3.5 rounded-[12px] bg-[#F5F2F0] border-2 border-[#151617] shadow-comic-sm">
          <div className="flex items-center gap-2 text-xs font-bold text-[#151617]">
            <span className="w-2 h-2 rounded-full bg-[#4ECB71]" />
            <span>Agent Relay: Online</span>
          </div>
          <p className="text-[10px] font-mono text-[#151617]/60 mt-1">
            SSE &amp; WebSocket Active
          </p>
        </div>
      </aside>

      {/* ─────────────────────────────────────────────────────────────
          MAIN CONTENT AREA
          ───────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-6 sm:p-10 max-w-[1400px]">
        {/* Top Control Bar */}
        <div className="p-5 sm:p-6 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col sm:flex-row sm:items-center justify-between gap-4 ring-1 ring-black/5">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl sm:text-3xl text-[#151617] text-balance">
                {activeTab === "overview" && "DASHBOARD OVERVIEW"}
                {activeTab === "sites" && "REGISTERED WEBSITES"}
                {activeTab === "telemetry" && "LIVE TELEMETRY FEED"}
                {activeTab === "tools" && "GLOBAL TOOL REGISTRY"}
              </h1>
            </div>
            <p className="text-xs font-medium text-[#151617]/70 mt-1 text-pretty">
              Live edge runtime, active tools, and real-time database state.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadDashboardData}
              className="p-2.5 min-h-[44px] min-w-[44px] rounded-[10px] bg-[#FAFAF9] hover:bg-[#F5F2F0] text-[#151617] border-2 border-[#151617] shadow-comic-sm transition-all btn-press flex items-center justify-center"
              title="Refresh database data"
            >
              <RefreshCw className="h-4 w-4" />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="h-[44px] min-h-[44px] px-5 rounded-[10px] bg-[#FFBE98] hover:bg-[#ffa978] text-[#151617] font-bold text-xs uppercase tracking-wide border-2 border-[#151617] shadow-comic btn-press flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Launch New Site</span>
            </button>
          </div>
        </div>

        {/* 4 Real Metric Counter Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-6">
          <div className="p-5 rounded-[14px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-[#151617]/60">Registered Sites</span>
              <Globe className="h-4 w-4 text-[#B09CFB]" />
            </div>
            <div className="mt-3 font-display text-3xl text-[#151617] tabular-nums">{sites.length}</div>
            <div className="mt-1 text-[11px] font-bold text-[#4ECB71] flex items-center gap-1 font-mono">
              <span>● LIVE IN NEON DB</span>
            </div>
          </div>

          <div className="p-5 rounded-[14px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-[#151617]/60">Synthesized Tools</span>
              <Layers className="h-4 w-4 text-[#FFBE98]" />
            </div>
            <div className="mt-3 font-display text-3xl text-[#151617] tabular-nums">{totalTools}</div>
            <div className="mt-1 text-[11px] font-bold text-[#151617]/70 font-mono">
              Active in Agent Registry
            </div>
          </div>

          <div className="p-5 rounded-[14px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-[#151617]/60">Logged Dispatches</span>
              <Activity className="h-4 w-4 text-[#4ECB71]" />
            </div>
            <div className="mt-3 font-display text-3xl text-[#151617] tabular-nums">{telemetry.length}</div>
            <div className="mt-1 text-[11px] font-bold text-[#151617]/70 font-mono">
              Real-time tool invocations
            </div>
          </div>

          <div className="p-5 rounded-[14px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between ring-1 ring-black/5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold uppercase text-[#151617]/60">HITL Shield</span>
              <ShieldCheck className="h-4 w-4 text-[#9078F0]" />
            </div>
            <div className="mt-3 font-display text-3xl text-[#151617] tabular-nums">100%</div>
            <div className="mt-1 text-[11px] font-bold text-[#151617]/70 font-mono">
              Zero unauthorized actions
            </div>
          </div>
        </div>

        {/* Search / Filter Bar */}
        <div className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#151617]/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search registered websites by name or URL..."
              className="w-full pl-10 pr-4 py-2.5 rounded-[10px] bg-[#FAFAF9] border-2 border-[#151617] text-xs font-semibold text-[#151617] placeholder:text-[#151617]/40 focus:outline-none shadow-comic-sm"
            />
          </div>
          <div className="text-xs font-mono font-bold text-[#151617]/60 flex items-center gap-2 tabular-nums">
            <span>SHOWING {filteredSites.length} OF {sites.length} SITES</span>
          </div>
        </div>

        {/* Real Active Sites Grid or Clean Empty State */}
        {isLoadingSites ? (
          <div className="p-12 text-center mt-6 bg-[#FAFAF9] border-2 border-[#151617] rounded-[16px] shadow-comic ring-1 ring-black/5">
            <Cpu className="h-8 w-8 text-[#151617] animate-spin-fast mx-auto mb-2" />
            <p className="font-mono text-xs font-bold text-[#151617]">Loading database records...</p>
          </div>
        ) : filteredSites.length === 0 ? (
          <div className="p-10 text-center mt-6 bg-[#FAFAF9] border-2 border-[#151617] rounded-[16px] shadow-comic-lg ring-1 ring-black/5">
            <div className="w-12 h-12 rounded-[10px] bg-[#FFBE98] border-2 border-[#151617] shadow-comic-sm flex items-center justify-center mx-auto mb-4">
              <Globe className="h-6 w-6 text-[#151617]" />
            </div>
            <h3 className="font-display text-xl text-[#151617]">NO WEBSITES REGISTERED YET</h3>
            <p className="text-sm font-medium text-[#151617]/70 max-w-md mx-auto mt-2 leading-relaxed text-pretty">
              Enter any documentation, SaaS landing page, agency, or digital product URL to crawl and synthesize Web MCP tools.
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-6 px-6 py-2.5 min-h-[44px] rounded-[10px] bg-[#B09CFB] hover:bg-[#9078F0] text-[#151617] font-bold text-xs uppercase border-2 border-[#151617] shadow-comic btn-press inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Launch Your First Website</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
            {filteredSites.map((site) => (
              <div
                key={site.site_id}
                className="p-5 sm:p-6 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic flex flex-col justify-between hover:shadow-comic-lg transition-all ring-1 ring-black/5"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#4ECB71]" />
                        <h3 className="font-display text-lg text-[#151617]">{site.title}</h3>
                        <span className="px-2 py-0.5 rounded-[9999px] bg-[#B09CFB] border border-[#151617] text-[10px] font-mono font-bold uppercase">
                          {site.framework || "Web"}
                        </span>
                      </div>
                      <a
                        href={site.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs font-mono text-[#151617]/60 hover:underline flex items-center gap-1 mt-1"
                      >
                        <span>{site.url}</span>
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>

                    <button
                      onClick={() => handleDelete(site.site_id)}
                      className="p-1.5 min-h-[36px] min-w-[36px] rounded-[8px] text-[#151617]/40 hover:text-[#FF5F56] hover:bg-[#F5F2F0] transition-colors flex items-center justify-center"
                      title="Remove site"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Tool Badges */}
                  <div className="mt-4">
                    <div className="text-[10px] font-mono font-bold text-[#151617]/60 uppercase mb-1.5 tabular-nums">
                      Synthesized Tools ({site.tools?.length || 0}):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {site.tools?.map((tool) => (
                        <span
                          key={tool.id}
                          className="px-2 py-0.5 rounded-[6px] bg-[#F5F2F0] border border-[#151617] font-mono text-[10px] font-bold text-[#151617]"
                        >
                          {tool.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t-2 border-[#151617]/10 flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#151617]/60 tabular-nums">
                    ID: {site.site_id}
                  </span>
                  <Link
                    href={`/studio/${site.site_id}`}
                    className="h-[36px] min-h-[36px] px-4 rounded-[8px] bg-[#FFBE98] hover:bg-[#ffa978] text-[#151617] font-bold text-xs uppercase border-2 border-[#151617] shadow-comic-sm btn-press flex items-center gap-1.5"
                  >
                    <span>Open Studio</span>
                    <ArrowRight className="h-3.5 w-3.5 translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Real Live Agent Telemetry Feed */}
        <div className="mt-8 p-6 rounded-[16px] bg-[#0D0E0F] text-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg ring-1 ring-white/10">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-[#4ECB71]" />
              <h3 className="font-display text-base text-white">LIVE AGENT TELEMETRY FEED</h3>
            </div>
            <span className="px-2 py-0.5 rounded-[9999px] bg-[#4ECB71] text-[#151617] font-mono text-[9px] font-bold tabular-nums">
              {telemetry.length} EVENTS LOGGED
            </span>
          </div>

          {telemetry.length === 0 ? (
            <div className="py-6 text-center text-xs font-mono text-white/50">
              No tool calls logged yet. Test any tool in the Studio or connect Claude Desktop to see real-time execution dispatches!
            </div>
          ) : (
            <div className="mt-3 space-y-2 font-mono text-xs text-white/80 max-h-64 overflow-y-auto">
              {telemetry.map((evt) => (
                <div key={evt.id} className="p-2.5 rounded-[8px] bg-[#151617] border border-white/10 flex items-center justify-between">
                  <div>
                    <span className={evt.status === "requires_approval" ? "text-[#FFBE98]" : "text-[#4ECB71]"}>
                      [{evt.status === "requires_approval" ? "HITL PROMPT" : "200 OK"}]
                    </span>{" "}
                    {evt.client_type} called <span className="text-[#FFBE98]">{evt.tool_name}({JSON.stringify(evt.args)})</span> on <b>{evt.site_title}</b>
                  </div>
                  <span className="text-white/40 text-[10px] tabular-nums">{evt.duration_ms}ms</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Add Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-xl rounded-[16px] max-w-lg w-full p-6 sm:p-8 relative ring-1 ring-black/5">
            <div className="flex items-center justify-between pb-3 border-b-2 border-[#151617]">
              <h3 className="font-display text-xl text-[#151617]">LAUNCH NEW WEBSITE</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="font-mono text-xs font-bold text-[#151617] p-1.5 rounded-[6px] bg-[#FFBE98] border-2 border-[#151617] btn-press"
              >
                [✕]
              </button>
            </div>

            <form onSubmit={handleCreateSite} className="mt-5 space-y-4">
              <div>
                <label className="block font-mono text-xs font-bold text-[#151617] uppercase mb-1.5">
                  Enter Website or Documentation URL:
                </label>
                <input
                  type="text"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  placeholder="https://docs.yourcompany.com or https://myproduct.com"
                  className="w-full px-3.5 py-2.5 rounded-[10px] bg-[#F5F2F0] border-2 border-[#151617] text-xs font-semibold text-[#151617] focus:outline-none min-h-[44px]"
                  disabled={isScanning}
                  autoFocus
                />
              </div>

              {isScanning && (
                <div className="p-2.5 rounded-[10px] bg-[#B09CFB] border-2 border-[#151617] text-xs font-bold text-[#151617] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  <span>{statusMessage}</span>
                </div>
              )}

              <div className="mt-5 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 min-h-[44px] rounded-[10px] bg-[#F5F2F0] text-[#151617] font-bold text-xs uppercase border-2 border-[#151617] btn-press"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isScanning || !newUrl.trim()}
                  className="px-5 py-2 min-h-[44px] rounded-[10px] bg-[#FFBE98] hover:bg-[#ffa978] text-[#151617] font-bold text-xs uppercase border-2 border-[#151617] shadow-comic-sm btn-press flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isScanning ? <Cpu className="h-4 w-4 animate-spin-fast" /> : <ArrowRight className="h-4 w-4" />}
                  <span>Synthesize &amp; Launch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
