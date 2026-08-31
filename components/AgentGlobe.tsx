"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import createGlobe, { Globe as CobeGlobe, Arc } from "cobe";
import {
  Cpu,
  Globe as GlobeIcon,
  Radio,
  Zap,
  ShieldCheck,
  Play,
  Pause,
  Activity,
} from "lucide-react";

export interface AgentNode {
  id: string;
  name: string;
  clientType: "Claude Desktop" | "Cursor IDE" | "Autonomous Buyer" | "Gemini Agent" | "Custom MCP";
  region: string;
  cloudProvider: string;
  lat: number;
  long: number;
  phiTarget: number;
  thetaTarget: number;
  currentTool: string;
  querySnippet: string;
  targetSite: string;
  latencyMs: number;
  hitlRequired: boolean;
  status: "active" | "streaming" | "approved";
  color: string;
}

const GLOBAL_AGENT_NODES: AgentNode[] = [
  {
    id: "node_us_east",
    name: "Claude 3.7 Sonnet",
    clientType: "Claude Desktop",
    region: "AWS US East 2 (Ohio)",
    cloudProvider: "Render Oregon / Neon AWS",
    lat: 39.9612,
    long: -82.9988,
    phiTarget: 4.8,
    thetaTarget: 0.3,
    currentTool: "search_docs",
    querySnippet: 'search_docs(query: "create_checkout_session")',
    targetSite: "docs.stripe.com",
    latencyMs: 18,
    hitlRequired: false,
    status: "streaming",
    color: "#4ECB71",
  },
  {
    id: "node_us_west",
    name: "Cursor AI Agent",
    clientType: "Cursor IDE",
    region: "AWS US West 1 (SF)",
    cloudProvider: "Render Cloud Relay",
    lat: 37.7749,
    long: -122.4194,
    phiTarget: 5.4,
    thetaTarget: 0.28,
    currentTool: "get_code_example",
    querySnippet: 'get_code_example(feature: "auth", lang: "typescript")',
    targetSite: "docs.prisma.io",
    latencyMs: 24,
    hitlRequired: false,
    status: "active",
    color: "#FFBE98",
  },
  {
    id: "node_eu_central",
    name: "Autonomous Buyer 01",
    clientType: "Autonomous Buyer",
    region: "AWS EU Central 1 (Frankfurt)",
    cloudProvider: "Render Frankfurt Hub",
    lat: 50.1109,
    long: 8.6821,
    phiTarget: 2.8,
    thetaTarget: 0.45,
    currentTool: "initiate_checkout",
    querySnippet: 'initiate_checkout(tier_name: "Pro SaaS License")',
    targetSite: "agenttag.io/pricing",
    latencyMs: 31,
    hitlRequired: true,
    status: "approved",
    color: "#B09CFB",
  },
  {
    id: "node_ap_northeast",
    name: "Gemini 2.0 Coding Agent",
    clientType: "Gemini Agent",
    region: "AWS AP Northeast 1 (Tokyo)",
    cloudProvider: "Render Tokyo Edge",
    lat: 35.6762,
    long: 139.6503,
    phiTarget: 0.8,
    thetaTarget: 0.25,
    currentTool: "get_api_reference",
    querySnippet: 'get_api_reference(endpoint: "POST /v1/telemetry")',
    targetSite: "mintlify.com/docs",
    latencyMs: 19,
    hitlRequired: false,
    status: "streaming",
    color: "#4ECB71",
  },
  {
    id: "node_ap_southeast",
    name: "Enterprise Scheduler Agent",
    clientType: "Custom MCP",
    region: "AWS AP Southeast 1 (Singapore)",
    cloudProvider: "Render Singapore Edge",
    lat: 1.3521,
    long: 103.8198,
    phiTarget: 1.4,
    thetaTarget: 0.05,
    currentTool: "book_discovery_call",
    querySnippet: 'book_discovery_call(preferred_time: "2026-09-02T15:00Z")',
    targetSite: "cal.com/enterprise",
    latencyMs: 28,
    hitlRequired: true,
    status: "approved",
    color: "#FFBE98",
  },
  {
    id: "node_uk_london",
    name: "Research Synthesizer Agent",
    clientType: "Claude Desktop",
    region: "AWS EU West 2 (London)",
    cloudProvider: "Render London Edge",
    lat: 51.5074,
    long: -0.1278,
    phiTarget: 3.1,
    thetaTarget: 0.48,
    currentTool: "get_case_studies",
    querySnippet: 'get_case_studies(industry: "fintech")',
    targetSite: "coss.com/ui",
    latencyMs: 22,
    hitlRequired: false,
    status: "active",
    color: "#4ECB71",
  },
];

const GLOBAL_ARCS: Arc[] = [
  { from: [37.7749, -122.4194], to: [39.9612, -82.9988], color: [0.3, 0.8, 0.44] },
  { from: [39.9612, -82.9988], to: [51.5074, -0.1278], color: [0.7, 0.6, 0.98] },
  { from: [51.5074, -0.1278], to: [50.1109, 8.6821], color: [1.0, 0.74, 0.59] },
  { from: [50.1109, 8.6821], to: [35.6762, 139.6503], color: [0.3, 0.8, 0.44] },
  { from: [35.6762, 139.6503], to: [1.3521, 103.8198], color: [0.7, 0.6, 0.98] },
];

interface AgentGlobeProps {
  className?: string;
  showControls?: boolean;
  showFeed?: boolean;
  variant?: "hero" | "dashboard" | "full";
}

export default function AgentGlobe({
  className = "",
  showControls = true,
  showFeed = true,
}: AgentGlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  
  const [selectedNodeIndex, setSelectedNodeIndex] = useState(0);
  const [isAutoCycling, setIsAutoCycling] = useState(true);
  const [isRotating, setIsRotating] = useState(true);
  const [liveEvents, setLiveEvents] = useState([
    { id: 1, agent: "Claude 3.7", action: "search_docs", site: "docs.stripe.com", time: "just now", region: "US East (Ohio)" },
    { id: 2, agent: "Cursor AI", action: "get_code_example", site: "docs.prisma.io", time: "2s ago", region: "US West (SF)" },
    { id: 3, agent: "Autonomous Buyer", action: "initiate_checkout", site: "agenttag.io", time: "5s ago", region: "EU Central (Frankfurt)" },
    { id: 4, agent: "Gemini 2.0", action: "get_api_reference", site: "mintlify.com", time: "8s ago", region: "AP Northeast (Tokyo)" },
  ]);

  const activeNode = GLOBAL_AGENT_NODES[selectedNodeIndex];

  // Stable references for continuous rendering without WebGL rebuilds
  const selectedNodeIndexRef = useRef(selectedNodeIndex);
  selectedNodeIndexRef.current = selectedNodeIndex;

  const isAutoCyclingRef = useRef(isAutoCycling);
  isAutoCyclingRef.current = isAutoCycling;

  const isRotatingRef = useRef(isRotating);
  isRotatingRef.current = isRotating;

  // Angles
  const phiRef = useRef(4.8);
  const thetaRef = useRef(0.3);
  const targetPhiRef = useRef(4.8);
  const targetThetaRef = useRef(0.3);

  // Auto cycle agent nodes
  useEffect(() => {
    if (!isAutoCycling) return;
    const interval = setInterval(() => {
      setSelectedNodeIndex((prev) => {
        const next = (prev + 1) % GLOBAL_AGENT_NODES.length;
        const node = GLOBAL_AGENT_NODES[next];
        targetPhiRef.current = node.phiTarget;
        targetThetaRef.current = node.thetaTarget;
        return next;
      });
    }, 5000);
    return () => clearInterval(interval);
  }, [isAutoCycling]);

  // Live telemetry feed ticker simulator
  useEffect(() => {
    const tickerInterval = setInterval(() => {
      const randomNode = GLOBAL_AGENT_NODES[Math.floor(Math.random() * GLOBAL_AGENT_NODES.length)];
      setLiveEvents((prev) => [
        {
          id: Date.now(),
          agent: randomNode.name.split(" ")[0] + " " + (randomNode.name.split(" ")[1] || "Agent"),
          action: randomNode.currentTool,
          site: randomNode.targetSite,
          time: "just now",
          region: randomNode.region.split("(")[1]?.replace(")", "") || "Global",
        },
        ...prev.slice(0, 5),
      ]);
    }, 3500);

    return () => clearInterval(tickerInterval);
  }, []);

  const handleSelectNode = useCallback((index: number) => {
    setSelectedNodeIndex(index);
    setIsAutoCycling(false);
    const node = GLOBAL_AGENT_NODES[index];
    targetPhiRef.current = node.phiTarget;
    targetThetaRef.current = node.thetaTarget;
  }, []);

  // WebGL Globe Initialization with COBE (Initialized once on mount)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: CobeGlobe | null = null;
    let animationFrameId: number;

    const canvasWidth = canvas.offsetWidth || 500;

    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: canvasWidth * 2,
        height: canvasWidth * 2,
        phi: phiRef.current,
        theta: thetaRef.current,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 18000,
        mapBrightness: 6,
        baseColor: [0.15, 0.16, 0.18],
        markerColor: [0.3, 0.8, 0.44],
        glowColor: [0.08, 0.1, 0.12],
        arcs: GLOBAL_ARCS,
        arcColor: [0.3, 0.8, 0.44],
        arcWidth: 1.5,
        arcHeight: 0.3,
        markers: GLOBAL_AGENT_NODES.map((node, i) => ({
          location: [node.lat, node.long],
          size: i === 0 ? 0.12 : 0.06,
        })),
      });

      const animate = () => {
        if (globe) {
          if (!pointerInteracting.current) {
            if (isRotatingRef.current && isAutoCyclingRef.current) {
              phiRef.current += 0.003;
            } else {
              phiRef.current += (targetPhiRef.current - phiRef.current) * 0.06;
              thetaRef.current += (targetThetaRef.current - thetaRef.current) * 0.06;
            }
          } else {
            phiRef.current += pointerInteractionMovement.current;
            pointerInteractionMovement.current = 0;
          }

          const currentIdx = selectedNodeIndexRef.current;
          const pulse = (Math.sin(Date.now() / 200) + 1) / 2;
          const updatedMarkers = GLOBAL_AGENT_NODES.map((node, i) => ({
            location: [node.lat, node.long] as [number, number],
            size: i === currentIdx ? 0.08 + pulse * 0.04 : 0.05,
          }));

          globe.update({
            phi: phiRef.current,
            theta: thetaRef.current,
            markers: updatedMarkers,
          });
        }
        animationFrameId = requestAnimationFrame(animate);
      };

      animate();
    } catch (err) {
      console.error("Failed to initialize WebGL Cobe globe:", err);
    }

    const onResize = () => {
      if (canvas && globe) {
        const newWidth = canvas.offsetWidth || 500;
        globe.update({
          width: newWidth * 2,
          height: newWidth * 2,
        });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (globe) {
        globe.destroy();
      }
    };
  }, []);

  return (
    <div
      className={`relative w-full rounded-[20px] bg-[#0D0E0F] border-2 border-[#151617] shadow-comic-xl overflow-hidden text-white font-sans ${className}`}
    >
      {/* Background Dark Dot Grid */}
      <div className="absolute inset-0 comic-grid-dark opacity-30 pointer-events-none" />

      {/* Top Banner & Telemetry Status Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-[#151617]/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#4ECB71]/10 border border-[#4ECB71]/40 flex items-center justify-center text-[#4ECB71] shadow-[0_0_15px_rgba(78,203,113,0.3)]">
            <Radio className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg sm:text-xl uppercase tracking-tight text-white">
                GLOBAL AGENT NETWORK
              </h3>
              <span className="px-2 py-0.5 rounded-[9999px] bg-[#4ECB71] text-[#151617] font-mono text-[10px] font-bold">
                LIVE RELAY
              </span>
            </div>
            <p className="text-xs text-white/60 font-mono mt-0.5">
              Real-time WebMCP connections across Claude, Cursor &amp; Autonomous Agents
            </p>
          </div>
        </div>

        {/* Global Metric Badges */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-[8px] bg-[#1F2023] border border-white/10 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4ECB71] animate-ping" />
            <span className="text-white/60">Active Agents:</span>
            <span className="font-bold text-white tabular-nums">1,420+</span>
          </div>

          <div className="px-3 py-1.5 rounded-[8px] bg-[#1F2023] border border-white/10 flex items-center gap-2">
            <Zap className="h-3.5 w-3.5 text-[#FFBE98]" />
            <span className="text-white/60">Avg Latency:</span>
            <span className="font-bold text-[#FFBE98] tabular-nums">21ms</span>
          </div>

          <div className="px-3 py-1.5 rounded-[8px] bg-[#1F2023] border border-white/10 flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#B09CFB]" />
            <span className="text-white/60">HITL Shield:</span>
            <span className="font-bold text-[#B09CFB]">Enforced</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage: 3D Globe + Neon HUD Overlay */}
      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[540px] items-center p-4 sm:p-8 gap-8">
        {/* Left / Center: 3D WebGL Globe Viewport */}
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
            {/* Ambient Backlight Glow Ring */}
            <div className="absolute inset-4 rounded-full bg-[#4ECB71]/10 blur-3xl pointer-events-none" />
            <div className="absolute inset-16 rounded-full bg-[#B09CFB]/10 blur-2xl pointer-events-none" />

            {/* Canvas for COBE 3D WebGL */}
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
              }}
              onPointerUp={() => {
                pointerInteracting.current = null;
                if (canvasRef.current) canvasRef.current.style.cursor = "grab";
              }}
              onPointerOut={() => {
                pointerInteracting.current = null;
                if (canvasRef.current) canvasRef.current.style.cursor = "grab";
              }}
              onMouseMove={(e) => {
                if (pointerInteracting.current !== null) {
                  const delta = e.clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta * 0.005;
                  setIsAutoCycling(false);
                }
              }}
              onTouchMove={(e) => {
                if (pointerInteracting.current !== null && e.touches[0]) {
                  const delta = e.touches[0].clientX - pointerInteracting.current;
                  pointerInteractionMovement.current = delta * 0.005;
                  setIsAutoCycling(false);
                }
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing transition-opacity duration-500"
              style={{ width: "100%", height: "100%", aspectRatio: "1 / 1", contain: "layout paint size" }}
            />

            {/* Hint Overlay */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-[9999px] bg-[#151617]/90 border border-white/10 text-[11px] font-mono text-white/60 pointer-events-none flex items-center gap-1.5">
              <GlobeIcon className="h-3.5 w-3.5 text-[#4ECB71]" />
              <span>Drag to rotate • Click nodes to focus</span>
            </div>
          </div>

          {/* Interactive Node Selector Pills */}
          {showControls && (
            <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-2">
              {GLOBAL_AGENT_NODES.map((node, idx) => {
                const isSelected = idx === selectedNodeIndex;
                return (
                  <button
                    key={node.id}
                    onClick={() => handleSelectNode(idx)}
                    className={`px-3 py-1.5 rounded-[8px] text-xs font-mono font-bold transition-all flex items-center gap-2 border ${
                      isSelected
                        ? "bg-[#4ECB71] text-[#151617] border-[#4ECB71] shadow-[0_0_12px_rgba(78,203,113,0.4)] scale-105"
                        : "bg-[#18191B] text-white/70 border-white/10 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isSelected ? "bg-[#151617]" : "bg-[#4ECB71]"
                      }`}
                    />
                    <span>{node.region.split("(")[1]?.replace(")", "") || node.region}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Neon-Style HUD Card & Live Dispatch Telemetry */}
        <div className="lg:col-span-5 flex flex-col gap-5">
          {/* Neon Floating Card (Matches Screenshot Aesthetic) */}
          <div className="p-6 rounded-[16px] bg-[#151617] border-2 border-[#4ECB71]/40 shadow-[0_0_25px_rgba(78,203,113,0.15)] ring-1 ring-white/10 relative overflow-hidden">
            {/* Ambient Corner Glow */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#4ECB71]/10 blur-2xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex items-start justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[10px] bg-[#1E2022] border border-[#4ECB71]/50 flex items-center justify-center text-[#4ECB71] shadow-inner">
                  <Cpu className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#4ECB71] font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#4ECB71] animate-ping inline-block" />
                    ACTIVE AGENT NODE
                  </div>
                  <h4 className="font-display text-xl text-white mt-0.5">{activeNode.name}</h4>
                </div>
              </div>

              <span className="px-2.5 py-1 rounded-[6px] bg-[#1F2023] border border-white/10 text-[11px] font-mono font-bold text-[#FFBE98] tabular-nums">
                {activeNode.latencyMs}ms
              </span>
            </div>

            {/* Card Body & Parameter Details */}
            <div className="mt-4 space-y-3.5">
              <div>
                <span className="text-[10px] font-mono uppercase text-white/50 block font-semibold">
                  Region &amp; Cloud Gateway
                </span>
                <div className="text-sm font-semibold text-white mt-0.5 flex items-center gap-2">
                  <GlobeIcon className="h-3.5 w-3.5 text-[#4ECB71]" />
                  <span>{activeNode.region}</span>
                </div>
                <span className="text-xs font-mono text-white/60 block mt-0.5">
                  Route: {activeNode.cloudProvider}
                </span>
              </div>

              <div className="p-3.5 rounded-[10px] bg-[#0A0B0C] border border-white/10">
                <div className="flex items-center justify-between text-[11px] font-mono pb-2 border-b border-white/10">
                  <span className="text-white/50">Dispatched WebMCP Tool:</span>
                  <span className="font-bold text-[#4ECB71]">{activeNode.currentTool}</span>
                </div>
                <div className="mt-2.5 font-mono text-xs text-[#FFBE98] break-all">
                  {activeNode.querySnippet}
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-white/50 pt-2 border-t border-white/5">
                  <span>Target: {activeNode.targetSite}</span>
                  <span className="text-[#4ECB71] font-bold">Status: 200 OK</span>
                </div>
              </div>

              {/* Security Toast Indication */}
              {activeNode.hitlRequired && (
                <div className="p-3 rounded-[10px] bg-[#B09CFB]/15 border border-[#B09CFB]/40 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2 text-[#B09CFB]">
                    <ShieldCheck className="h-4 w-4" />
                    <span>HITL Browser Toast: Consent Granted</span>
                  </div>
                  <span className="text-[10px] uppercase font-bold text-white/80">Secured</span>
                </div>
              )}
            </div>

            {/* Quick Actions Footer */}
            <div className="mt-5 pt-4 border-t border-white/10 flex items-center justify-between">
              <button
                onClick={() => setIsAutoCycling(!isAutoCycling)}
                className="px-3 py-1.5 rounded-[8px] bg-[#1F2023] hover:bg-[#2A2B2F] border border-white/10 text-xs font-mono text-white/80 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                {isAutoCycling ? (
                  <>
                    <Pause className="h-3 w-3 text-[#FFBE98]" />
                    <span>Pause Cycle</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 text-[#4ECB71]" />
                    <span>Resume Auto-Cycle</span>
                  </>
                )}
              </button>

              <div className="text-[11px] font-mono text-white/50">
                Protocol: <span className="text-white font-bold">SSE JSON-RPC 2.0</span>
              </div>
            </div>
          </div>

          {/* Live Activity Feed Stream */}
          {showFeed && (
            <div className="p-4 rounded-[16px] bg-[#151617] border border-white/10">
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <Activity className="h-3.5 w-3.5 text-[#4ECB71]" />
                  <span className="font-mono text-xs font-bold uppercase text-white/80 tracking-wider">
                    Live Dispatch Stream
                  </span>
                </div>
                <span className="text-[10px] font-mono text-white/40">Auto-updating</span>
              </div>

              <div className="space-y-2">
                {liveEvents.slice(0, 3).map((evt) => (
                  <div
                    key={evt.id}
                    className="p-2.5 rounded-[8px] bg-[#0A0B0C] border border-white/5 flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ECB71]" />
                      <span className="text-white font-semibold truncate">{evt.agent}</span>
                      <span className="text-white/40">→</span>
                      <span className="text-[#FFBE98] truncate">{evt.action}</span>
                    </div>
                    <span className="text-white/40 text-[10px] flex-shrink-0 ml-2">{evt.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
