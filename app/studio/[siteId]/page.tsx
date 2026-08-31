"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { SiteConfig, WebMCPTool } from "@/lib/types";
import {
  Code2,
  Play,
  Copy,
  Check,
  ToggleLeft,
  ToggleRight,
  Plus,
  Terminal,
  ExternalLink,
  ShieldAlert,
  Layers,
  ChevronDown,
  ChevronUp,
  Cpu,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function StudioPage() {
  const params = useParams();
  const siteId = params.siteId as string;

  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<string>("");
  const [toolArgs, setToolArgs] = useState<Record<string, string>>({});
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [vibePrompt, setVibePrompt] = useState("");
  const [isAddingVibe, setIsAddingVibe] = useState(false);
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

  const handleAddVibeTool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vibePrompt.trim() || !config) return;
    setIsAddingVibe(true);

    const newToolName = vibePrompt
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, "_")
      .slice(0, 30) || "custom_tool";

    const newTool: WebMCPTool = {
      id: `tool_${Date.now()}`,
      name: newToolName,
      description: vibePrompt,
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Parameter input" },
        },
        required: ["query"],
      },
      execution_type: "dom_search",
      is_enabled: true,
      requires_approval: false,
    };

    const updatedTools = [...config.tools, newTool];
    const updatedConfig = { ...config, tools: updatedTools };
    setConfig(updatedConfig);
    setSelectedTool(newTool.name);
    setVibePrompt("");
    setIsAddingVibe(false);

    await fetch(`/api/sites/${siteId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tools: updatedTools }),
    });
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-3 bg-[#B09CFB] text-[#151617]">
        <Cpu className="h-8 w-8 text-[#151617] animate-spin" />
        <p className="font-display text-xl uppercase tracking-wider">
          Loading WebMCP Studio...
        </p>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg rounded-[16px] text-center">
        <h2 className="font-display text-2xl text-[#151617]">CONFIG NOT FOUND</h2>
        <p className="text-sm font-medium text-[#151617]/70 mt-2">Target site identifier does not exist in registry.</p>
        <Link href="/" className="mt-6 inline-block px-6 py-2.5 bg-[#FFBE98] text-[#151617] font-bold text-xs uppercase rounded-[12px] border-2 border-[#151617] shadow-comic-sm">
          Create New Registry
        </Link>
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
    <div className="w-full min-h-screen bg-[#F5F2F0] text-[#151617] py-10 px-4 sm:px-8">
      <div className="max-w-[1280px] mx-auto">
        {/* Top Control Header Card */}
        <div className="p-6 sm:p-8 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <Link href="/" className="p-2 rounded-[8px] bg-[#F5F2F0] hover:bg-[#FFBE98] border-2 border-[#151617] shadow-comic-sm transition-all text-[#151617]">
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="font-display text-2xl sm:text-4xl text-[#151617]">
                {config.title}
              </h1>
              <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#B09CFB] border-2 border-[#151617] text-xs font-mono font-bold text-[#151617] uppercase">
                {config.framework || "Web"}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs font-bold text-[#151617]">
              <a href={config.url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                <span>{config.url}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
              <span>•</span>
              <span className="font-mono bg-[#F5F2F0] px-2 py-0.5 rounded-[6px] border border-[#151617]">
                ID: {config.site_id}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowEmbedModal(true)}
              className="h-[44px] px-6 rounded-[12px] bg-[#FFBE98] hover:bg-[#ffa978] text-[#151617] font-bold text-xs uppercase tracking-wide border-2 border-[#151617] shadow-comic btn-press flex items-center gap-2"
            >
              <Code2 className="h-4 w-4" />
              <span>Get Embed Snippet</span>
            </button>
          </div>
        </div>

        {/* Studio Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Left Column: Tool Cards & Vibe Refiner */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between pb-2 border-b-2 border-[#151617]/10">
              <div className="flex items-center gap-2">
                <Layers className="h-5 w-5 text-[#151617]" />
                <h2 className="font-display text-xl text-[#151617]">ACTIVE TOOL REGISTRY</h2>
              </div>
              <span className="px-2.5 py-0.5 rounded-[9999px] bg-[#4ECB71] border-2 border-[#151617] text-xs font-bold font-mono">
                {config.tools.filter((t) => t.is_enabled).length}/{config.tools.length} ACTIVE
              </span>
            </div>

            {/* Tool Cards */}
            <div className="space-y-4">
              {config.tools.map((tool) => (
                <div
                  key={tool.id}
                  className={`p-6 rounded-[16px] border-2 border-[#151617] transition-all ${
                    tool.is_enabled
                      ? "bg-[#FAFAF9] shadow-comic"
                      : "bg-[#FAFAF9]/50 opacity-60 shadow-none"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono text-sm font-bold text-[#151617] bg-[#B09CFB] px-2 py-0.5 rounded-[6px] border-2 border-[#151617]">
                          {tool.name}
                        </span>
                        {tool.requires_approval && (
                          <span className="flex items-center gap-1 font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded-[6px] bg-[#FFBE98] border-2 border-[#151617] text-[#151617]">
                            <ShieldAlert className="h-3 w-3" />
                            HITL Guardrail
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-medium text-[#151617] mt-3 leading-relaxed">{tool.description}</p>

                      {/* Parameters Chip List */}
                      <div className="flex flex-wrap items-center gap-1.5 mt-4">
                        {Object.entries(tool.parameters.properties || {}).map(([paramName, prop]: [string, any]) => (
                          <span
                            key={paramName}
                            className="px-2 py-0.5 rounded-[6px] bg-[#F5F2F0] border border-[#151617] font-mono text-[11px] font-bold text-[#151617]"
                          >
                            {paramName}: <span className="text-[#9078F0]">{prop.type}</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Toggle Button */}
                    <button
                      onClick={() => toggleTool(tool.id)}
                      className="text-[#151617] transition-colors"
                    >
                      {tool.is_enabled ? (
                        <ToggleRight className="h-8 w-8 text-[#4ECB71]" />
                      ) : (
                        <ToggleLeft className="h-8 w-8 text-[#151617]/40" />
                      )}
                    </button>
                  </div>

                  {/* Schema inspection */}
                  <div className="mt-4 pt-3 border-t-2 border-[#151617]/10 flex items-center justify-between text-[11px] font-mono font-bold text-[#151617]/60">
                    <button
                      onClick={() => setExpandedSchema(expandedSchema === tool.id ? null : tool.id)}
                      className="flex items-center gap-1 hover:text-[#151617]"
                    >
                      <span>{expandedSchema === tool.id ? "[Hide Schema]" : "[Inspect JSON Schema]"}</span>
                      {expandedSchema === tool.id ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                    </button>
                    <span className="uppercase text-[10px]">{tool.execution_type}</span>
                  </div>

                  {expandedSchema === tool.id && (
                    <pre className="mt-3 p-4 rounded-[12px] bg-[#0D0E0F] text-[#4ECB71] text-[11px] font-mono border-2 border-[#151617] overflow-x-auto">
                      {JSON.stringify(tool.parameters, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>

            {/* Vibe Prompt: Add Tool via Natural Language */}
            <div className="p-6 rounded-[16px] bg-[#B09CFB] border-2 border-[#151617] shadow-comic">
              <div className="font-display text-lg text-[#151617] mb-2 flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <span>VIBE REFINE: DESCRIBE ANY CUSTOM TOOL</span>
              </div>
              <form onSubmit={handleAddVibeTool} className="flex flex-col sm:flex-row gap-2 mt-3">
                <input
                  type="text"
                  value={vibePrompt}
                  onChange={(e) => setVibePrompt(e.target.value)}
                  placeholder="e.g. 'Add a tool to check team pricing' or 'Add a tool to query CLI flags'"
                  className="flex-1 px-4 py-2.5 rounded-[12px] bg-[#FAFAF9] border-2 border-[#151617] text-xs font-bold text-[#151617] placeholder:text-[#151617]/50 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isAddingVibe || !vibePrompt.trim()}
                  className="px-6 py-2.5 rounded-[12px] bg-[#FFBE98] hover:bg-[#ffa978] text-[#151617] font-bold text-xs uppercase border-2 border-[#151617] shadow-comic-sm btn-press flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Tool</span>
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Live Agent Simulator Card */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-[16px] bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-lg sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#151617]/10">
                <div className="flex items-center gap-2">
                  <Terminal className="h-5 w-5 text-[#151617]" />
                  <h3 className="font-display text-lg text-[#151617]">LIVE AGENT SIMULATOR</h3>
                </div>
                <span className="px-2 py-0.5 rounded-[9999px] bg-[#4ECB71] text-[#151617] font-mono text-[10px] font-bold border border-[#151617]">
                  TEST HARNESS
                </span>
              </div>

              {/* Select Tool */}
              <div className="mt-4">
                <label className="block font-mono text-xs font-bold text-[#151617] mb-1.5">
                  Select Tool to Test:
                </label>
                <select
                  value={selectedTool}
                  onChange={(e) => {
                    setSelectedTool(e.target.value);
                    setToolArgs({});
                  }}
                  className="w-full px-3 py-2.5 rounded-[12px] bg-[#F5F2F0] border-2 border-[#151617] text-xs font-mono font-bold text-[#151617] focus:outline-none"
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

              {/* Argument Inputs */}
              {selectedTool && (
                <div className="mt-4 space-y-3">
                  {Object.entries(
                    config.tools.find((t) => t.name === selectedTool)?.parameters.properties || {}
                  ).map(([paramName, prop]: [string, any]) => (
                    <div key={paramName}>
                      <label className="block font-mono text-[11px] font-bold text-[#151617] mb-1">
                        {paramName} ({prop.type}):
                      </label>
                      <input
                        type="text"
                        placeholder={prop.description || paramName}
                        value={toolArgs[paramName] || ""}
                        onChange={(e) => setToolArgs({ ...toolArgs, [paramName]: e.target.value })}
                        className="w-full px-3 py-2 rounded-[10px] bg-[#F5F2F0] border-2 border-[#151617] text-xs font-medium text-[#151617] focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Execute Simulation Button */}
              <button
                onClick={handleSimulate}
                disabled={isSimulating || !selectedTool}
                className="mt-6 w-full h-[46px] rounded-[12px] bg-[#4ECB71] hover:bg-[#43b764] text-[#151617] font-bold text-xs uppercase tracking-wide border-2 border-[#151617] shadow-comic btn-press flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSimulating ? (
                  <span>Executing Dispatches...</span>
                ) : (
                  <>
                    <Play className="h-4 w-4 fill-current" />
                    <span>Simulate Agent Tool Call</span>
                  </>
                )}
              </button>

              {/* Simulation Result */}
              {simulationResult && (
                <div className="mt-5 pt-4 border-t-2 border-[#151617]/10">
                  <div className="font-mono text-[10px] text-[#151617] font-bold uppercase mb-2 flex items-center justify-between">
                    <span>// JSON-RPC 2.0 AGENT RESPONSE</span>
                    <span className="px-2 py-0.5 rounded-[4px] bg-[#B09CFB] border border-[#151617]">200 OK</span>
                  </div>
                  <pre className="p-4 rounded-[12px] bg-[#0D0E0F] text-[#FAFAF9] font-mono text-[11px] border-2 border-[#151617] max-h-64 overflow-y-auto leading-relaxed">
                    {JSON.stringify(simulationResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Embed Snippet Modal */}
        {showEmbedModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <div className="bg-[#FAFAF9] border-2 border-[#151617] shadow-comic-xl rounded-[20px] max-w-2xl w-full p-8 relative">
              <div className="flex items-center justify-between pb-4 border-b-2 border-[#151617]">
                <h3 className="font-display text-2xl text-[#151617]">EMBED WEBMCP SCRIPT</h3>
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="font-mono text-xs font-bold text-[#151617] p-1.5 rounded-[6px] bg-[#FFBE98] border-2 border-[#151617]"
                >
                  [✕ CLOSE]
                </button>
              </div>

              <div className="mt-6 space-y-6">
                {/* 1. Script Tag */}
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#151617] mb-2">
                    01. Paste into &lt;head&gt; or &lt;body&gt;:
                  </div>
                  <div className="relative">
                    <pre className="p-4 rounded-[12px] bg-[#F5F2F0] text-[#151617] font-mono text-xs overflow-x-auto border-2 border-[#151617]">
                      {scriptTagCode}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(scriptTagCode);
                        setCopiedScript(true);
                        setTimeout(() => setCopiedScript(false), 2000);
                      }}
                      className="absolute top-2.5 right-2.5 px-3 py-1 rounded-[8px] bg-[#FFBE98] text-[#151617] text-xs font-bold border-2 border-[#151617] shadow-comic-sm flex items-center gap-1"
                    >
                      {copiedScript ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedScript ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                {/* 2. Claude Config */}
                <div>
                  <div className="font-mono text-xs font-bold uppercase tracking-wider text-[#151617] mb-2">
                    02. Add to claude_desktop_config.json:
                  </div>
                  <div className="relative">
                    <pre className="p-4 rounded-[12px] bg-[#0D0E0F] text-[#4ECB71] font-mono text-xs overflow-x-auto border-2 border-[#151617]">
                      {claudeConfigJson}
                    </pre>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(claudeConfigJson);
                        setCopiedMcp(true);
                        setTimeout(() => setCopiedMcp(false), 2000);
                      }}
                      className="absolute top-2.5 right-2.5 px-3 py-1 rounded-[8px] bg-[#B09CFB] text-[#151617] text-xs font-bold border-2 border-[#151617] shadow-comic-sm flex items-center gap-1"
                    >
                      {copiedMcp ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedMcp ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setShowEmbedModal(false)}
                  className="px-6 py-2.5 rounded-[12px] bg-[#151617] text-[#FAFAF9] font-bold text-xs uppercase border-2 border-[#151617]"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
