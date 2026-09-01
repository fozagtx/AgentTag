"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Download, Plus, X } from "lucide-react";
import { BrandMark } from "@/components/BrandMark";
import { Idea } from "@/lib/combine";
import { CanvasElement, ElementKind, FIELDS } from "@/lib/elements";
import {
  addCustomElement,
  addMany,
  combineById,
  downloadMarkdown,
  getCanvasState,
  removeIdea,
  removePiece,
  resetCanvas,
  runScamper,
  selectPiece,
  subscribeCanvas,
} from "@/lib/canvas-store";
import { ingestText } from "@/lib/ingest";
import { registerCanvasMcp } from "@/lib/webmcp-host";

const EMPTY_STATE = {
  pieces: [] as CanvasElement[],
  ideas: [] as Idea[],
  selectedId: null as string | null,
};

export default function IdeaCanvas() {
  const state = useSyncExternalStore(subscribeCanvas, getCanvasState, () => EMPTY_STATE);
  const [custom, setCustom] = useState("");
  const [field, setField] = useState<ElementKind>("sponsor");
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

  const onPieceClick = (id: string) => {
    if (!state.selectedId) {
      selectPiece(id);
      return;
    }
    if (state.selectedId === id) {
      selectPiece(null);
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
    addCustomElement(custom, field);
    setCustom("");
  };

  const ingestFiles = async (files: FileList | File[]) => {
    const texts: string[] = [];
    for (const file of Array.from(files)) {
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
    <div className="flex min-h-dvh flex-col bg-[#f7f7f5] text-[#161616]">
      <header className="shrink-0 border-b border-[#e8e8e4] bg-[#f7f7f5] px-4 py-3 space-y-3 sm:space-y-0 sm:flex sm:h-14 sm:items-center sm:gap-3 sm:py-0">
        <div className="flex items-center justify-between gap-3">
          <BrandMark light />
          <button
            type="button"
            onClick={download}
            className="btn-keycap h-10 min-h-10 px-3 inline-flex items-center gap-1.5 text-xs shrink-0 sm:hidden"
          >
            <Download className="h-3.5 w-3.5" />
          </button>
        </div>
        <form onSubmit={addCustom} className="flex min-w-0 flex-1 items-center gap-2">
          <select
            value={field}
            onChange={(e) => setField(e.target.value as ElementKind)}
            aria-label="Field"
            className="h-10 rounded-lg border border-[#e8e8e4] bg-white px-2 text-xs text-[#161616] focus:outline-none"
          >
            {FIELDS.map((f) => (
              <option key={f.id} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
          <input
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            placeholder="Add a name, or drop a hackathon doc"
            aria-label="Add a stack"
            className="min-w-0 flex-1 rounded-lg border border-[#e8e8e4] bg-white px-3 py-2 text-sm text-[#161616] placeholder:text-[#8a8a8a] focus:outline-none min-h-10"
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
        <div
          className={`grid grid-cols-1 gap-4 md:grid-cols-3 ${dragging ? "opacity-95" : ""}`}
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
          {FIELDS.map((f) => {
            const items = state.pieces.filter((p) => p.kind === f.id);
            return (
              <section
                key={f.id}
                className={`field-${f.id} min-h-[240px] rounded-[16px] border p-5 ${
                  dragging ? "ring-2 ring-[#161616]" : ""
                }`}
              >
                <div className="flex items-baseline justify-between gap-2 mb-4">
                  <h1 className="text-base font-semibold">{f.label}</h1>
                  <span className="text-[11px] tabular-nums text-[#6f6f6f]">{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <p className="text-sm leading-6 text-[#6f6f6f]">
                    {f.id === "industry" ? f.hint : `${f.hint}. Empty until an agent or a dropped doc fills it.`}
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2.5">
                    {items.map((el) => (
                      <button
                        key={el.id}
                        type="button"
                        onClick={() => onPieceClick(el.id)}
                        onDoubleClick={() => removePiece(el.id)}
                        className={`chip chip-${el.kind} ${state.selectedId === el.id ? "is-on" : ""}`}
                      >
                        {el.name}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            );
          })}
        </div>

        {notice ? <p className="text-sm text-[#ff6b4a]">{notice}</p> : null}

        <section className="pb-10">
          <div className="flex items-center justify-between gap-3 mb-4">
            <h2 className="text-lg font-semibold">
              Ideas <span className="text-[#6f6f6f] font-normal tabular-nums">{state.ideas.length}</span>
            </h2>
            {state.pieces.length > 0 || state.ideas.length > 0 ? (
              <button
                type="button"
                onClick={() => resetCanvas()}
                className="text-xs text-[#6f6f6f] hover:text-[#161616] min-h-10 px-2"
              >
                Clear
              </button>
            ) : null}
          </div>
          {state.ideas.length === 0 ? (
            <p className="text-sm text-[#6f6f6f]">Click one piece, then another, to combine them.</p>
          ) : (
            <ul className="space-y-4">
              {state.ideas.map((idea) => (
                <li key={idea.id} className="rounded-[14px] border border-[#e8e8e4] bg-white p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className="text-base font-semibold">{idea.title}</h3>
                      <p className="mt-2 text-sm text-[#6f6f6f] leading-relaxed">{idea.pitch}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeIdea(idea.id)}
                      className="shrink-0 text-[#6f6f6f] hover:text-[#161616] min-h-10 min-w-10 inline-flex items-center justify-center"
                      aria-label={`Remove ${idea.title}`}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  {idea.scamper ? (
                    <ul className="mt-4 space-y-2 text-sm text-[#6f6f6f]">
                      {Object.entries(idea.scamper).map(([k, v]) => (
                        <li key={k}>
                          <span className="text-[#161616]">{k}.</span> {v}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runScamper(idea.id)}
                      className="mt-4 text-sm text-[#145a52] hover:text-[#161616] min-h-10"
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
