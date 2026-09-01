import { CanvasElement, PALETTE } from "./elements";
import { Idea, combineElements, ideasToMarkdown, pairKey, scamperIdea } from "./combine";

export type CanvasState = {
  workspace: CanvasElement[];
  ideas: Idea[];
  selectedId: string | null;
  customName: string;
};

const KEY = "cofound-canvas-v1";
const LEGACY_KEY = "agenttag-canvas-v1";

let state: CanvasState = load();
const listeners = new Set<() => void>();

function load(): CanvasState {
  if (typeof window === "undefined") {
    return { workspace: [], ideas: [], selectedId: null, customName: "" };
  }
  try {
    const raw = localStorage.getItem(KEY) || localStorage.getItem(LEGACY_KEY);
    if (!raw) return { workspace: [], ideas: [], selectedId: null, customName: "" };
    const parsed = JSON.parse(raw);
    return {
      workspace: Array.isArray(parsed.workspace) ? parsed.workspace : [],
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      selectedId: null,
      customName: "",
    };
  } catch {
    return { workspace: [], ideas: [], selectedId: null, customName: "" };
  }
}

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(
    KEY,
    JSON.stringify({ workspace: state.workspace, ideas: state.ideas })
  );
}

function emit(next: CanvasState) {
  state = next;
  persist();
  listeners.forEach((fn) => fn());
}

export function getCanvasState(): CanvasState {
  return state;
}

export function subscribeCanvas(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function addToWorkspace(el: CanvasElement): CanvasState {
  if (state.workspace.some((w) => w.id === el.id)) return state;
  emit({ ...state, workspace: [...state.workspace, el] });
  return state;
}

export function addCustomElement(name: string, kind: CanvasElement["kind"] = "sponsor"): CanvasElement {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required.");
  const el: CanvasElement = {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
    kind,
  };
  addToWorkspace(el);
  return el;
}

export function removeFromWorkspace(id: string): void {
  emit({
    ...state,
    workspace: state.workspace.filter((w) => w.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  });
}

export function selectWorkspace(id: string | null): void {
  emit({ ...state, selectedId: id });
}

export function combineById(idA: string, idB: string): Idea {
  if (idA === idB) throw new Error("Pick two different pieces.");
  const a = state.workspace.find((w) => w.id === idA);
  const b = state.workspace.find((w) => w.id === idB);
  if (!a || !b) throw new Error("Both pieces need to be on the canvas.");
  const key = pairKey(a.name, b.name);
  const existing = state.ideas.find((idea) => pairKey(idea.parts[0], idea.parts[1]) === key);
  if (existing) {
    emit({ ...state, selectedId: null });
    return existing;
  }
  const idea = combineElements(a, b);
  emit({ ...state, ideas: [idea, ...state.ideas], selectedId: null });
  return idea;
}

export function combineByName(nameA: string, nameB: string): Idea {
  const a = findNamed(nameA);
  const b = findNamed(nameB);
  addToWorkspace(a);
  addToWorkspace(b);
  const left = getCanvasState().workspace.find((w) => w.name.toLowerCase() === a.name.toLowerCase());
  const right = getCanvasState().workspace.find((w) => w.name.toLowerCase() === b.name.toLowerCase());
  if (!left || !right) throw new Error("Could not place those pieces.");
  return combineById(left.id, right.id);
}

export function runScamper(ideaId: string): Idea {
  const idea = state.ideas.find((i) => i.id === ideaId);
  if (!idea) throw new Error("Idea not found.");
  const next = { ...idea, scamper: scamperIdea(idea) };
  emit({
    ...state,
    ideas: state.ideas.map((i) => (i.id === ideaId ? next : i)),
  });
  return next;
}

export function removeIdea(id: string): void {
  emit({ ...state, ideas: state.ideas.filter((i) => i.id !== id) });
}

export function resetCanvas(): void {
  emit({ workspace: [], ideas: [], selectedId: null, customName: "" });
}

export function downloadMarkdown(): string {
  const md = ideasToMarkdown(state.ideas);
  if (typeof window !== "undefined" && state.ideas.length > 0) {
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "ideation-canvas.md";
    a.click();
    URL.revokeObjectURL(url);
  }
  return md;
}

function findNamed(name: string): CanvasElement {
  const q = name.trim().toLowerCase();
  const fromPalette = PALETTE.find((el) => el.name.toLowerCase() === q || el.id === q);
  if (fromPalette) return fromPalette;
  const fromWorkspace = state.workspace.find((el) => el.name.toLowerCase() === q);
  if (fromWorkspace) return fromWorkspace;
  return { id: `c_${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), kind: "sponsor" };
}
