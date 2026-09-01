"use client";

import { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";
import type { Globe as CobeGlobe } from "cobe";
import { Globe as GlobeIcon, Radio } from "lucide-react";
import { TelemetryEvent } from "@/lib/types";

function relativeTime(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const seconds = Math.max(0, Math.floor((Date.now() - then) / 1000));
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AgentGlobe({
  className = "",
  events: eventsProp,
}: {
  className?: string;
  events?: TelemetryEvent[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointerInteracting = useRef<number | null>(null);
  const pointerInteractionMovement = useRef(0);
  const [fetchedEvents, setFetchedEvents] = useState<TelemetryEvent[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const events = eventsProp ?? fetchedEvents;
  const active = events[selectedIndex] ?? events[0] ?? null;

  useEffect(() => {
    if (eventsProp) return;
    let cancelled = false;
    fetch("/api/telemetry?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        if (data.success && Array.isArray(data.events)) {
          setFetchedEvents(data.events);
        }
      })
      .catch(() => {
        if (!cancelled) setFetchedEvents([]);
      });
    return () => {
      cancelled = true;
    };
  }, [eventsProp]);

  useEffect(() => {
    if (selectedIndex >= events.length) setSelectedIndex(0);
  }, [events.length, selectedIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let globe: CobeGlobe | null = null;
    let animationFrameId = 0;
    let phi = 4.8;
    const canvasWidth = canvas.offsetWidth || 500;

    try {
      globe = createGlobe(canvas, {
        devicePixelRatio: 2,
        width: canvasWidth * 2,
        height: canvasWidth * 2,
        phi,
        theta: 0.3,
        dark: 1,
        diffuse: 1.4,
        mapSamples: 18000,
        mapBrightness: 6,
        baseColor: [0.15, 0.16, 0.18],
        markerColor: [0.3, 0.8, 0.44],
        glowColor: [0.08, 0.1, 0.12],
        markers: [],
      });

      const animate = () => {
        if (globe) {
          if (pointerInteracting.current === null) {
            phi += 0.003;
          } else {
            phi += pointerInteractionMovement.current;
            pointerInteractionMovement.current = 0;
          }
          globe.update({ phi, markers: [] });
        }
        animationFrameId = requestAnimationFrame(animate);
      };
      animate();
    } catch (err) {
      console.error("Failed to initialize WebGL globe:", err);
    }

    const onResize = () => {
      if (canvas && globe) {
        const newWidth = canvas.offsetWidth || 500;
        globe.update({ width: newWidth * 2, height: newWidth * 2 });
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("resize", onResize);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (globe) globe.destroy();
    };
  }, []);

  return (
    <div
      className={`relative w-full rounded-[14px] bg-[#0c0d0f] border border-white/10 overflow-hidden text-white ${className}`}
    >
      <div className="absolute inset-0 pointer-events-none" />

      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-[#151617]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[#4ECB71]/10 border border-[#4ECB71]/40 flex items-center justify-center text-[#4ECB71]">
            <Radio className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl tracking-tight text-white">Calls</h3>
            <p className="text-xs text-white/60 mt-0.5">
              {events.length === 0
                ? "Nothing recorded yet"
                : `${events.length} recorded`}
            </p>
          </div>
        </div>
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-12 min-h-[540px] items-center p-4 sm:p-8 gap-8">
        <div className="lg:col-span-7 flex flex-col items-center justify-center relative select-none">
          <div className="relative w-full max-w-[460px] aspect-square flex items-center justify-center">
            <div className="absolute inset-4 rounded-full bg-[#4ECB71]/10 blur-3xl pointer-events-none" />
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
                }
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              style={{ width: "100%", height: "100%", aspectRatio: "1 / 1" }}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-[9999px] bg-[#151617]/90 border border-white/10 text-[11px] font-mono text-white/60 pointer-events-none flex items-center gap-1.5">
              <GlobeIcon className="h-3.5 w-3.5 text-[#4ECB71]" />
              <span>Drag to rotate</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-5">
          {!active ? (
            <div className="p-6 rounded-[16px] bg-[#151617] border border-white/10">
              <p className="text-sm text-white/60">No calls yet.</p>
            </div>
          ) : (
          <div className="p-6 rounded-[16px] bg-[#151617] border-2 border-[#4ECB71]/40 ring-1 ring-white/10">
                <div className="flex items-start justify-between pb-4 border-b border-white/10">
                  <div>
                    <div className="text-[11px] font-mono uppercase tracking-wider text-[#4ECB71] font-bold">
                      Last recorded call
                    </div>
                    <h4 className="font-display text-xl text-white mt-0.5">{active.tool_name}</h4>
                  </div>
                  <span className="px-2.5 py-1 rounded-[6px] bg-[#1F2023] border border-white/10 text-[11px] font-mono font-bold text-[#FFBE98] tabular-nums">
                    {active.duration_ms > 0 ? `${active.duration_ms}ms` : "—"}
                  </span>
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-white/50 block font-semibold">Client</span>
                    <div className="font-semibold text-white mt-0.5">{active.client_type}</div>
                  </div>
                  <div className="p-3.5 rounded-[10px] bg-[#0A0B0C] border border-white/10 font-mono text-xs">
                    <div className="flex items-center justify-between pb-2 border-b border-white/10">
                      <span className="text-white/50">Site</span>
                      <span className="text-[#4ECB71]">{active.site_title}</span>
                    </div>
                    <div className="mt-2.5 text-[#FFBE98] break-all">
                      {active.tool_name}({JSON.stringify(active.args)})
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5 text-white/50 flex justify-between">
                      <span>{relativeTime(active.created_at)}</span>
                      <span className="text-[#4ECB71] font-bold">{active.status}</span>
                    </div>
                  </div>
                </div>
          </div>
          )}

          {events.length > 0 ? (
          <div className="p-4 rounded-[16px] bg-[#151617] border border-white/10">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-medium text-white/80">Recent</span>
              <span className="text-[10px] font-mono text-white/40 tabular-nums">{events.length}</span>
            </div>
              <div className="space-y-2">
                {events.slice(0, 5).map((evt, idx) => (
                  <button
                    key={evt.id}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`w-full text-left p-2.5 rounded-[8px] bg-[#0A0B0C] border flex items-center justify-between text-xs font-mono transition-colors duration-150 ${
                      idx === selectedIndex ? "border-[#4ECB71]/50" : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#4ECB71]" />
                      <span className="text-white font-semibold truncate">{evt.client_type}</span>
                      <span className="text-white/40">→</span>
                      <span className="text-[#FFBE98] truncate">{evt.tool_name}</span>
                    </div>
                    <span className="text-white/40 text-[10px] flex-shrink-0 ml-2">
                      {relativeTime(evt.created_at)}
                    </span>
                  </button>
                ))}
              </div>
          </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
