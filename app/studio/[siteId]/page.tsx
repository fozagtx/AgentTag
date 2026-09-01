"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteConfig } from "@/lib/types";
import {
  Code2,
  Play,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Terminal,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";
import { BrandMark } from "@/components/BrandMark";
import { decodeHtml } from "@/lib/text";

export default function StudioPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [toolArgs, setToolArgs] = useState<Record<string, string>>({});
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const [expandedSchema, setExpandedSchema] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedMcp, setCopiedMcp] = useState(false);
  const [showEmbedModal, setShowEmbedModal] = useState(false);

  useEffect(() => {
    async function fetchConfig() {
      try {
        const res = await fetch(`/api/sites/${siteId}`);
        const data = await res.json();
        if (data.success && data.config) {
          setConfig(data.config);
          if (data.config.tools.length > 0) {
            setSelectedTool(data.config.tools[0].name);
          }
        }
      } catch (err) {
        console.error("Error fetching site config:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfig();
  }, [siteId]);

  const toggleTool = async (toolId: string) => {
    if (!config) return;
    const updatedTools = config.tools.map((t) =>
      t.id === toolId ? { ...t, is_enabled: !t.is_enabled } : t
    );
    const updatedConfig = { ...config, tools: updatedTools };
    setConfig(updatedConfig);

    await fetch(`/api/sites/${siteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tools: updatedTools }),
    });
  };

  const handleSimulate = async () => {
    if (!selectedTool) return;
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId,
          toolName: selectedTool,
          args: toolArgs,
        }),
      });
      const data = await res.json();
      setSimulationResult(data);
    } catch (err: any) {
      setSimulationResult({ error: err.message });
    } finally {
      setIsSimulating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] text-[#6f6f6f] flex flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-[#e8e8e4] px-4">
          <BrandMark href="/dashboard" light />
        </header>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-[#f7f7f5] text-[#161616] flex flex-col">
        <header className="flex h-14 items-center gap-3 border-b border-[#e8e8e4] px-4">
          <BrandMark href="/dashboard" light />
        </header>
        <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-md w-full rounded-[14px] border border-[#e8e8e4] bg-white p-8 text-center">
          <h2 className="text-xl font-semibold">Site not found</h2>
          <p className="text-sm text-[#6f6f6f] mt-2">This site is not in your list.</p>
          <Link href="/dashboard" className="btn-keycap mt-6 inline-flex h-9 items-center px-4 text-xs">
            Back to dashboard
          </Link>
        </div>
        </div>
      </div>
    );
  }

  const scriptTagCode = `<script src="https://cdn.agenttag.io/client.js" data-site-id="${config.site_id}"></script>`;
  const claudeConfigJson = JSON.stringify(
    {
      mcpServers: {
        [config.title.toLowerCase().replace(/[^a-z0-9]/g, "-") || "my-website"]: {
          url: `https://relay.agenttag.io/mcp/${config.site_id}`,
        },
      },
    },
    null,
    2
  );

  return (
    <div className="w-full min-h-screen bg-[#f7f7f5] text-[#161616]">
      <header className="flex h-14 items-center gap-3 border-b border-[#e8e8e4] px-4">
        <BrandMark href="/dashboard" light />
      </header>
      <div className="max-w-[1280px] mx-auto py-10 px-4 sm:px-8">
        <div className="p-6 sm:p-8 rounded-[14px] bg-white border border-[#e8e8e4] flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="p-2.5 min-h-11 min-w-11 rounded-lg bg-white/5 hover:bg-white/10 border border-[#e8e8e4] flex items-center justify-center transition-colors duration-150"
                aria-label="Back to dashboard"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-2xl sm:text-3xl font-semibold truncate">{decodeHtml(config.title)}</h1>
            </div>
            <a
              href={config.url}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-xs font-mono text-[#6f6f6f] hover:text-[#161616]"
            >
              <span className="truncate">{config.url}</span>
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          </div>

          <button
            onClick={() => setShowEmbedModal(true)}
            className="btn-keycap h-11 px-5 inline-flex items-center gap-2 text-xs"
            type="button"
          >
            <Code2 className="h-4 w-4" />
            Get script tag
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Tools</h2>
              <span className="text-xs text-[#6f6f6f] tabular-nums">
                {config.tools.filter((t) => t.is_enabled).length} on
              </span>
            </div>

            <div className="space-y-3">
              {config.tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`p-5 rounded-[14px] border border-[#e8e8e4] bg-white ${
                    tool.is_enabled ? "" : "opacity-50"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-sm">{tool.name}</span>
                        {tool.requires_approval ? (
                          <span className="text-[11px] px-2 py-0.5 rounded-md border border-[#e8e8e4] text-[#6f6f6f]">
                            Needs confirmation
                          </span>
                        ) : null}
                      </div>
                      <p className="text-sm text-[#6f6f6f] mt-2">{tool.description}</p>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {Object.entries(tool.parameters.properties || {}).map(
                          ([paramName, prop]: [string, any]) => (
                            <span
                              key={paramName}
                              className="px-2 py-0.5 rounded-md bg-white/5 border border-[#e8e8e4] font-mono text-[11px] text-[#6f6f6f]"
                            >
                              {paramName}
                              {prop?.type ? `: ${prop.type}` : ""}
                            </span>
                          )
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => toggleTool(tool.id)}
                      className="p-1 min-h-11 min-w-11 flex items-center justify-center"
                      aria-label={tool.is_enabled ? "Turn tool off" : "Turn tool on"}
                      type="button"
                    >
                      {tool.is_enabled ? (
                        <ToggleRight className="h-8 w-8 text-[#ff6b4a]" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-[#6f6f6f]" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={() => setExpandedSchema(expandedSchema === tool.id ? null : tool.id)}
                    className="mt-3 flex items-center gap-1 text-[11px] text-[#6f6f6f] hover:text-[#161616]"
                    type="button"
                  >
                    {expandedSchema === tool.id ? "Hide parameters" : "Parameters"}
                    {expandedSchema === tool.id ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </button>
                  {expandedSchema === tool.id ? (
                    <pre className="mt-3 p-4 rounded-lg bg-[#0c0d0f] text-[#6f6f6f] text-[11px] font-mono border border-[#e8e8e4] overflow-x-auto">
                      {JSON.stringify(tool.parameters, null, 2)}
                    </pre>
                  ) : null}
                </div>
              ))}
            </div>

          </div>

          <div className="lg:col-span-5">
            <div className="p-6 rounded-[14px] bg-white border border-[#e8e8e4] sticky top-8">
              <div className="flex items-center gap-2 pb-4 border-b border-[#e8e8e4]">
                <Terminal className="h-4 w-4 text-[#6f6f6f]" />
                <h3 className="text-base font-semibold">Try a tool</h3>
              </div>

              <div className="mt-4">
                <label className="block text-xs text-[#6f6f6f] mb-1.5">Tool</label>
                <select
                  value={selectedTool}
                  onChange={(e) => {
                    setSelectedTool(e.target.value);
                    setToolArgs({});
                  }}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#0c0d0f] border border-[#e8e8e4] text-sm text-[#161616] focus:outline-none min-h-11"
                >
                  {config.tools
                    .filter((t) => t.is_enabled)
                    .map((tool) => (
                      <option key={tool.name} value={tool.name}>
                        {tool.name}
                      </option>
                    ))}
                </select>
              </div>

              {selectedTool ? (
                <div className="mt-4 space-y-3">
                  {Object.entries(
                    config.tools.find((t) => t.name === selectedTool)?.parameters.properties || {}
                  ).map(([paramName, prop]: [string, any]) => (
                    <div key={paramName}>
                      <label className="block text-[11px] text-[#6f6f6f] mb-1">{paramName}</label>
                      <input
                        type="text"
                        placeholder={prop.description || paramName}
                        value={toolArgs[paramName] || ""}
                        onChange={(e) => setToolArgs({ ...toolArgs, [paramName]: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-white/5 border border-[#e8e8e4] text-sm text-[#161616] focus:outline-none min-h-10"
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              <button
                onClick={handleSimulate}
                disabled={isSimulating || !selectedTool}
                className="btn-keycap mt-6 w-full h-11 inline-flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                type="button"
              >
                {isSimulating ? (
                  <>
                    <Cpu className="h-4 w-4 animate-spin-fast" />
                    Running
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Run
                  </>
                )}
              </button>

              {simulationResult ? (
                <pre className="mt-5 p-4 rounded-lg bg-[#0c0d0f] text-[#6f6f6f] font-mono text-[11px] border border-[#e8e8e4] max-h-64 overflow-y-auto">
                  {JSON.stringify(simulationResult, null, 2)}
                </pre>
              ) : null}
            </div>
          </div>
        </div>

        {showEmbedModal ? (
          <div className="t-modal-scrim is-open" onClick={() => setShowEmbedModal(false)}>
            <div
              className="t-modal is-open bg-white text-[#161616] border border-[#e8e8e4] rounded-[14px] max-w-2xl w-full p-6 sm:p-8"
              role="dialog"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#e8e8e4]">
                <h3 className="text-lg font-semibold">Script tag</h3>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="text-sm text-[#6f6f6f] hover:text-[#161616]"
                  type="button"
                >
                  Close
                </button>
              </div>

              <div className="mt-6 space-y-6">
                <div>
                  <div className="text-xs text-[#6f6f6f] mb-2">Paste into your site</div>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-white/5 text-[#161616] font-mono text-xs overflow-x-auto border border-[#e8e8e4]">
                      {scriptTagCode}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scriptTagCode);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="absolute top-2.5 right-2.5 px-3 py-1.5 min-h-9 rounded-md bg-white/10 text-xs border border-[#e8e8e4] flex items-center gap-1"
                      type="button"
                    >
                      {copiedScript ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedScript ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <div className="text-xs text-[#6f6f6f] mb-2">Claude Desktop config</div>
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-[#f7f7f5] text-[#6f6f6f] font-mono text-xs overflow-x-auto border border-[#e8e8e4]">
                      {claudeConfigJson}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(claudeConfigJson);
                        setCopiedMcp(true);
                        setTimeout(() => setCopiedMcp(false), 2000);
                      }}
                      className="absolute top-2.5 right-2.5 px-3 py-1.5 min-h-9 rounded-md bg-white/10 text-xs border border-[#e8e8e4] flex items-center gap-1"
                      type="button"
                    >
                      {copiedMcp ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copiedMcp ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="btn-keycap h-11 px-5 text-xs"
                  type="button"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
