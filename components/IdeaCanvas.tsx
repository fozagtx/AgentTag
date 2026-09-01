"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { Download, Plus, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Idea } from "@/lib/combine";
import { CanvasElement, KIND_LABEL, PALETTE } from "@/lib/elements";
import {
  addCustomElement,
  addToWorkspace,
  combineById,
  downloadMarkdown,
  getCanvasState,
  removeFromWorkspace,
  removeIdea,
  resetCanvas,
  runScamper,
  selectWorkspace,
  subscribeCanvas,
} from "@/lib/canvas-store";
import { registerCanvasMcp } from "@/lib/webmcp-host";

const KINDS: CanvasElement["kind"][] = ["sponsor", "tech", "industry", "wild"];

const EMPTY_STATE = {
  workspace: [] as CanvasElement[],
  ideas: [] as Idea[],
  selectedId: null as string | null,
  customName: "",
};

export default function IdeaCanvas() {
  const state = useSyncExternalStore(subscribeCanvas, getCanvasState, () => EMPTY_STATE);
  const [custom, setCustom] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    if (registerCanvasMcp()) return;
    const tick = window.setInterval(() => {
      if (registerCanvasMcp()) window.clearInterval(tick);
    }, 40);
    const stop = window.setTimeout(() => window.clearInterval(tick), 4000);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(stop);
    };
  }, []);

  const grouped = useMemo(() => {
    const map: Record<string, CanvasElement[]> = { sponsor: [], tech: [], industry: [], wild: [] };
    for (const el of PALETTE) map[el.kind].push(el);
    return map;
  }, []);

  const onChip = (el: CanvasElement) => {
    addToWorkspace(el);
  };

  const onWorkspaceClick = (id: string) => {
    if (!state.selectedId) {
      selectWorkspace(id);
      return;
    }
    if (state.selectedId === id) {
      selectWorkspace(null);
      return;
    }
    try {
      combineById(state.selectedId, id);
      setNotice("");
    } catch (err: any) {
      setNotice(err.message || "Could not combine.");
    }
  };

  const addCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custom.trim()) return;
    addCustomElement(custom, "sponsor");
    setCustom("");
  };

  const download = () => {
    if (state.ideas.length === 0) {
      setNotice("Combine two pieces first.");
      return;
    }
    downloadMarkdown();
  };

  return (
    <div className="flex min-h-dvh flex-col bg-[#07080a] text-white">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-white/10 px-4">
        <BrandMark />
        <p className="hidden sm:block min-w-0 flex-1 truncate text-sm text-[#9c9c9d]">
          Combine sponsor tools. Download the idea.
        </p>
        <button
          type="button"
          onClick={download}
          className="btn-keycap h-9 min-h-9 px-3 inline-flex items-center gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </header>

      <div className="flex flex-1 min-h-0 flex-col lg:flex-row">
        <aside className="lg:w-[280px] shrink-0 border-b lg:border-b-0 lg:border-r border-white/10 overflow-y-auto p-4 space-y-5">
          <p className="text-[12px] text-[#9c9c9d]">
            Click a piece onto the canvas. Click two on the canvas to combine them.
          </p>
          {KINDS.map((kind) => (
            <div key={kind}>
              <div className="text-[11px] uppercase tracking-[0.14em] text-[#9c9c9d] mb-2">
                {KIND_LABEL[kind]}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grouped[kind].map((el) => (
                  <button
                    key={el.id}
                    type="button"
                    onClick={() => onChip(el)}
                    className={`chip chip-${kind}`}
                  >
                    {el.name}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <form onSubmit={addCustom} className="flex gap-1.5">
            <input
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              placeholder="Your sponsor tool"
              aria-label="Your sponsor tool"
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-2.5 py-2 text-xs text-white placeholder:text-[#9c9c9d] focus:outline-none min-h-10"
            />
            <button type="submit" className="btn-keycap h-10 min-h-10 px-2.5" aria-label="Add piece">
              <Plus className="h-4 w-4" />
            </button>
          </form>
        </aside>

        <main className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-6 space-y-6">
          <section>
            <div className="flex items-center justify-between gap-3 mb-3">
              <h1 className="text-lg font-semibold">Canvas</h1>
              {state.workspace.length > 0 ? (
                <button
                  type="button"
                  onClick={() => resetCanvas()}
                  className="text-xs text-[#9c9c9d] hover:text-white min-h-9 px-2"
                >
                  Clear
                </button>
              ) : null}
            </div>
            <div className="min-h-[160px] rounded-[14px] border border-dashed border-white/15 bg-white/[0.02] p-4">
              {state.workspace.length === 0 ? (
                <p className="text-sm text-[#9c9c9d]">Empty. Add Twilio, Health, or a sponsor from this weekend.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {state.workspace.map((el) => (
                    <button
                      key={el.id}
                      type="button"
                      onClick={() => onWorkspaceClick(el.id)}
                      onDoubleClick={() => removeFromWorkspace(el.id)}
                      className={`chip chip-${el.kind} ${state.selectedId === el.id ? "is-on" : ""}`}
                    >
                      {el.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="mt-2 text-[11px] text-[#9c9c9d]">Double-click a canvas piece to remove it.</p>
            {notice ? <p className="mt-2 text-xs text-[#ff6b4a]">{notice}</p> : null}
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-3">
              Ideas <span className="text-[#9c9c9d] font-normal tabular-nums">{state.ideas.length}</span>
            </h2>
            {state.ideas.length === 0 ? (
              <p className="text-sm text-[#9c9c9d]">No ideas yet. Two pieces make one.</p>
            ) : (
              <ul className="space-y-3">
                {state.ideas.map((idea) => (
                  <li key={idea.id} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-semibold">{idea.title}</h3>
                        <p className="mt-2 text-sm text-[#c8c8c8] leading-relaxed">{idea.pitch}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeIdea(idea.id)}
                        className="shrink-0 text-[#9c9c9d] hover:text-white min-h-9 min-w-9 inline-flex items-center justify-center"
                        aria-label={`Remove ${idea.title}`}
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    {idea.scamper ? (
                      <ul className="mt-3 space-y-1 text-xs text-[#9c9c9d]">
                        {Object.entries(idea.scamper).map(([k, v]) => (
                          <li key={k}>
                            <span className="text-white/80">{k}.</span> {v}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <button
                        type="button"
                        onClick={() => runScamper(idea.id)}
                        className="mt-3 text-xs text-[#ffb347] hover:text-white min-h-9"
                      >
                        Push with SCAMPER
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <p className="text-[11px] text-[#9c9c9d] pb-8">
            Method from{" "}
            <a
              className="underline decoration-white/20 hover:text-white"
              href="https://thehackathonplaybook.dev/playbook/ideation"
            >
              The Hackathon Playbook
            </a>
            . Agents can call combine, add_element, scamper, and download_canvas on this page.
          </p>
        </main>
      </div>
    </div>
  );
}
