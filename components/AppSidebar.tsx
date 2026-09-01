"use client";

import Link from "next/link";
import { LayoutDashboard, Globe, Radio, Layers, Plus } from "lucide-react";
import { SiteConfig } from "@/lib/types";
import { decodeHtml } from "@/lib/text";
import { BrandMark } from "@/components/BrandMark";

export type DashboardTab = "overview" | "sites" | "activity" | "tools";

const NAV: Array<{ id: DashboardTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "sites", label: "Sites", icon: Globe },
  { id: "activity", label: "Activity", icon: Radio },
  { id: "tools", label: "Tools", icon: Layers },
];

export function AppSidebar({
  sites,
  telemetryCount,
  activeTab,
  onTabChange,
  onLaunch,
  open,
  onClose,
  motionReady,
}: {
  sites: SiteConfig[];
  telemetryCount: number;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  onLaunch: () => void;
  open: boolean;
  onClose: () => void;
  motionReady: boolean;
}) {
  const totalTools = sites.reduce((n, s) => n + (s.tools?.length || 0), 0);
  const counts: Record<DashboardTab, number | null> = {
    overview: null,
    sites: sites.length,
    activity: telemetryCount,
    tools: totalTools,
  };

  return (
    <>
      <button
        type="button"
        className={`app-rail-scrim ${open ? "is-open" : ""} ${motionReady ? "is-ready" : ""}`}
        aria-label="Close menu"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />
      <aside
        className={`app-rail ${open ? "is-open" : ""} ${motionReady ? "is-ready" : ""}`}
      >
        <div
          className={`flex h-14 shrink-0 items-center border-b border-[#e8e8e4] ${
            open ? "px-4" : "justify-center px-0"
          }`}
        >
          <BrandMark href="/dashboard" light compact={!open} />
        </div>
        <nav className={`flex-1 overflow-y-auto py-4 ${open ? "px-3" : "px-1.5"}`}>
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              const count = counts[item.id];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    title={item.label}
                    onClick={() => {
                      onTabChange(item.id);
                      if (window.matchMedia("(max-width: 767px)").matches) onClose();
                    }}
                    className={`flex w-full items-center rounded-lg text-sm transition-colors duration-150 ${
                      open ? "gap-2.5 px-2.5 py-2" : "h-9 justify-center px-0"
                    } ${
                      active
                        ? "bg-[rgba(255,47,58,0.12)] text-[#161616]"
                        : "text-[#6f6f6f] hover:bg-black/[0.04] hover:text-[#161616]"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {open ? (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {count !== null ? (
                          <span className="font-mono text-[11px] tabular-nums text-[#8a8a8a]">{count}</span>
                        ) : null}
                      </>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          {open ? (
            <>
              <div className="mt-6 flex items-center justify-between px-2 mb-2">
                <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#8a8a8a]">Sites</p>
                <button
                  type="button"
                  onClick={onLaunch}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-[#6f6f6f] hover:bg-black/[0.04] hover:text-[#161616] transition-colors duration-150"
                  aria-label="Add site"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <ul className="space-y-1">
                {sites.length === 0 ? (
                  <li className="px-2.5 py-2 text-sm text-[#8a8a8a]">None yet</li>
                ) : (
                  sites.map((site) => (
                    <li key={site.site_id}>
                      <Link
                        href={`/studio/${site.site_id}`}
                        className="block truncate rounded-lg px-2.5 py-2 text-sm text-[#6f6f6f] hover:bg-black/[0.04] hover:text-[#161616] transition-colors duration-150"
                      >
                        {decodeHtml(site.title)}
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </>
          ) : (
            <div className="mt-4 flex justify-center">
              <button
                type="button"
                onClick={onLaunch}
                className="flex h-9 w-9 items-center justify-center rounded-md text-[#6f6f6f] hover:bg-black/[0.04] hover:text-[#161616] transition-colors duration-150"
                aria-label="Add site"
                title="Add site"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          )}
        </nav>
      </aside>
    </>
  );
}
