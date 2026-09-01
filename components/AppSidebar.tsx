"use client";

import Link from "next/link";
import { LayoutDashboard, Globe, Radio, Layers, Plus } from "lucide-react";
import { SiteConfig } from "@/lib/types";

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
        aria-hidden={!open}
      >
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <ul className="space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              const count = counts[item.id];
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => {
                      onTabChange(item.id);
                      if (window.matchMedia("(max-width: 767px)").matches) onClose();
                    }}
                    className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150 ${
                      active
                        ? "bg-[rgba(255,47,58,0.16)] text-white"
                        : "text-[#9c9c9d] hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 text-left">{item.label}</span>
                    {count !== null ? (
                      <span className="font-mono text-[11px] tabular-nums text-[#9c9c9d]">{count}</span>
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="mt-6 flex items-center justify-between px-2 mb-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#9c9c9d]">Sites</p>
            <button
              type="button"
              onClick={onLaunch}
              className="flex h-8 w-8 items-center justify-center rounded-md text-[#9c9c9d] hover:bg-white/5 hover:text-white transition-colors duration-150"
              aria-label="Add site"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
          <ul className="space-y-1">
            {sites.length === 0 ? (
              <li className="px-2.5 py-2 text-sm text-[#9c9c9d]">None yet</li>
            ) : (
              sites.map((site) => (
                <li key={site.site_id}>
                  <Link
                    href={`/studio/${site.site_id}`}
                    className="block truncate rounded-lg px-2.5 py-2 text-sm text-[#9c9c9d] hover:bg-white/5 hover:text-white transition-colors duration-150"
                  >
                    {site.title}
                  </Link>
                </li>
              ))
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}
