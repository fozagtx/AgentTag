"use client";

import { useEffect, useRef, useState } from "react";
import { Globe as GlobeIcon, Radio } from "lucide-react";
import { TelemetryEvent } from "@/lib/types";
import { decodeHtml } from "@/lib/text";

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

type Vec3 = { x: number; y: number; z: number };

function fibonacciSphere(count: number): Vec3[] {
  const points: Vec3[] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = golden * i;
    points.push({
      x: Math.cos(theta) * radius,
      y,
      z: Math.sin(theta) * radius,
    });
  }
  return points;
}

const DOTS = fibonacciSphere(1400);

export default function AgentGlobe({
  className = "",
  events: eventsProp,
}: {
  className?: string;
  events?: TelemetryEvent[];
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dragging = useRef(false);
  const lastX = useRef(0);
  const rotY = useRef(0.4);
  const rotX = useRef(0.35);
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let frame = 0;
    let running = true;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const paint = () => {
      if (!running) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const size = canvas.clientWidth || 460;
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, size, size);

      const cx = size / 2;
      const cy = size / 2;
      const radius = size * 0.38;

      if (!dragging.current && !reduceMotion) {
        rotY.current += 0.004;
      }

      const cosY = Math.cos(rotY.current);
      const sinY = Math.sin(rotY.current);
      const cosX = Math.cos(rotX.current);
      const sinX = Math.sin(rotX.current);

      const halo = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 1.35);
      halo.addColorStop(0, "rgba(255, 107, 74, 0.14)");
      halo.addColorStop(1, "rgba(255, 107, 74, 0)");
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(cx, cy, radius * 1.35, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = "#0a0b0d";
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();

      for (const p of DOTS) {
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        if (z2 < -0.02) continue;
        const depth = (z2 + 1) / 2;
        const px = cx + x1 * radius;
        const py = cy + y2 * radius;
        const alpha = 0.18 + depth * 0.72;
        const dot = 0.7 + depth * 1.35;
        ctx.fillStyle = `rgba(255, ${Math.round(107 + depth * 72)}, ${Math.round(74 + depth * 40)}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(px, py, dot, 0, Math.PI * 2);
        ctx.fill();
      }

      frame = requestAnimationFrame(paint);
    };

    frame = requestAnimationFrame(paint);
    return () => {
      running = false;
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className={`relative w-full rounded-[14px] bg-[#0c0d0f] border border-white/10 overflow-hidden text-white ${className}`}
    >
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 p-5 sm:p-6 border-b border-white/10 bg-[#151617]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[10px] bg-[rgba(255,107,74,0.12)] border border-[rgba(255,107,74,0.35)] flex items-center justify-center text-[#ff6b4a]">
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
            <canvas
              ref={canvasRef}
              onPointerDown={(e) => {
                dragging.current = true;
                lastX.current = e.clientX;
                canvasRef.current?.setPointerCapture(e.pointerId);
                if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
              }}
              onPointerUp={(e) => {
                dragging.current = false;
                canvasRef.current?.releasePointerCapture(e.pointerId);
                if (canvasRef.current) canvasRef.current.style.cursor = "grab";
              }}
              onPointerMove={(e) => {
                if (!dragging.current) return;
                const dx = e.clientX - lastX.current;
                lastX.current = e.clientX;
                rotY.current += dx * 0.008;
              }}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              style={{ width: "100%", height: "100%", aspectRatio: "1 / 1" }}
            />
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-[9999px] bg-[#151617]/90 border border-white/10 text-[11px] font-mono text-white/60 pointer-events-none flex items-center gap-1.5">
              <GlobeIcon className="h-3.5 w-3.5 text-[#ff6b4a]" />
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
            <div className="p-6 rounded-[16px] bg-[#151617] border border-[rgba(255,107,74,0.35)]">
              <div className="flex items-start justify-between pb-4 border-b border-white/10">
                <div>
                  <div className="text-[11px] font-mono uppercase tracking-wider text-[#ff6b4a] font-bold">
                    Last recorded call
                  </div>
                  <h4 className="text-xl text-white mt-0.5">{active.tool_name}</h4>
                </div>
                <span className="px-2.5 py-1 rounded-[6px] bg-[#1F2023] border border-white/10 text-[11px] font-mono font-bold text-[#ffb347] tabular-nums">
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
                    <span className="text-[#ff6b4a]">{decodeHtml(active.site_title)}</span>
                  </div>
                  <div className="mt-2.5 text-[#ffb347] break-all">
                    {active.tool_name}({JSON.stringify(active.args)})
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/5 text-white/50 flex justify-between">
                    <span>{relativeTime(active.created_at)}</span>
                    <span className="text-[#ff6b4a] font-bold">{active.status}</span>
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
                      idx === selectedIndex ? "border-[rgba(255,107,74,0.5)]" : "border-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2 overflow-hidden">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#ff6b4a]" />
                      <span className="text-white font-semibold truncate">{evt.client_type}</span>
                      <span className="text-white/40">→</span>
                      <span className="text-[#ffb347] truncate">{evt.tool_name}</span>
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
