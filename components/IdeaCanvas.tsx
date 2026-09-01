"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Plus, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Idea } from "@/lib/combine";
import { CanvasElement } from "@/lib/elements";
import {
  addCustomElement,
  addMany,
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
import { ingestText } from "@/lib/ingest";
import { registerCanvasMcp } from "@/lib/webmcp-host";

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
  const [dragging, setDragging] = useState(false);

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

  const ingestFiles = async (files: FileList | File[]) => {
    const list = Array.from(files);
    const texts: string[] = [];
    for (const file of list) {
      const lower = file.name.toLowerCase();
      if (lower.endsWith(".pdf") || file.type === "application/pdf") {
        setNotice("Drop a .txt, .md, or .html of the sponsor list. PDF is not read in the browser.");
        continue;
      }
      texts.push(await file.text());
    }
    const items = ingestText(texts.join("\n"));
    if (items.length === 0) {
      setNotice("No stacks found in that file.");
      return;
    }
    addMany(items);
    setNotice(`Added ${items.length} from the doc.`);
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
      <header className="shrink-0 border-b border-white/10 px-4 py-3 space-y-3 sm:space-y-0 sm:flex sm:h-14 sm:items-center sm:gap-3 sm:py-0">
        <div className="flex items-center justify-between gap-3">
          <BrandMark />
          <button
            type="button"
            onClick={download}
            className="btn-keycap h-10 min-h-10 px-3 inline-flex items-center gap-1.5 text-xs shrink-0 sm:hidden"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
        <form onSubmit={addCustom} className="flex min-w-0 flex-1 items-center gap-2">
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Add a stack, or drop a hackathon doc"
            aria-label="Add a stack"
            className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-[#9c9c9d] focus:outline-none min-h-10"
          />
          <button type="submit" className="btn-keycap h-10 min-h-10 px-3" aria-label="Add">
            <Plus className="h-4 w-4" />
          </button>
        </form>
        <button
          type="button"
          onClick={download}
          className="btn-keycap h-10 min-h-10 px-3 hidden sm:inline-flex items-center gap-1.5 text-xs shrink-0"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </button>
      </header>

      <main className="flex flex-1 min-h-0 flex-col gap-8 overflow-y-auto px-4 py-6 sm:px-8 sm:py-8">
        <section
          className={`flex min-h-[52vh] flex-1 flex-col rounded-[16px] border border-dashed p-6 sm:p-8 ${
            dragging ? "border-[#ff6b4a] bg-[rgba(255,107,74,0.06)]" : "border-white/15 bg-white/[0.02]"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            if (e.dataTransfer.files?.length) ingestFiles(e.dataTransfer.files);
          }}
        >
          <div className="flex items-center justify-between gap-3 mb-6">
            <h1 className="text-xl font-semibold tracking-tight">Canvas</h1>
            {state.workspace.length > 0 ? (
              <button
                type="button"
                onClick={() => resetCanvas()}
                className="text-xs text-[#9c9c9d] hover:text-white min-h-10 px-2"
              >
                Clear
              </button>
            ) : null}
          </div>

          {state.workspace.length === 0 ? (
            <div className="flex flex-1 items-center justify-center">
              <p className="max-w-sm text-center text-sm leading-6 text-[#9c9c9d]">
                Empty on purpose. An agent fills stacks with add_element, or drop this weekend’s sponsor list here.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap content-start gap-3">
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
        </section>

        {notice ? <p className="text-sm text-[#ff6b4a]">{notice}</p> : null}

        <section className="pb-10">
          <h2 className="text-lg font-semibold mb-4">
            Ideas <span className="text-[#9c9c9d] font-normal tabular-nums">{state.ideas.length}</span>
          </h2>
          {state.ideas.length === 0 ? (
            <p className="text-sm text-[#9c9c9d]">Click two pieces to combine them.</p>
          ) : (
            <ul className="space-y-4">
              {state.ideas.map((idea) => (
                <li key={idea.id} className="rounded-[14px] border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{idea.title}</h3>
                      <p className="mt-2 text-sm text-[#c8c8c8] leading-relaxed">{idea.pitch}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIdea(idea.id)}
                      className="shrink-0 text-[#9c9c9d] hover:text-white min-h-10 min-w-10 inline-flex items-center justify-center"
                      aria-label={`Remove ${idea.title}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {idea.scamper ? (
                    <ul className="mt-4 space-y-2 text-sm text-[#9c9c9d]">
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
                      className="mt-4 text-sm text-[#ffb347] hover:text-white min-h-10"
                    >
                      Push with SCAMPER
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
