import { CanvasElement, ElementKind, STARTER_INDUSTRIES } from "./elements";
import { Idea, combineElements, ideasToMarkdown, pairKey, scamperIdea } from "./combine";

export type CanvasState = {
  pieces: CanvasElement[];
  ideas: Idea[];
  selectedId: string | null;
};

const KEY = "cofound-canvas-v4";

const empty = (): CanvasState => ({
  pieces: [...STARTER_INDUSTRIES],
  ideas: [],
  selectedId: null,
});

let state: CanvasState = load();
const listeners = new Set<() => void>();

function load(): CanvasState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw);
    const pieces = Array.isArray(parsed.pieces) ? parsed.pieces : [];
    const withIndustries = pieces.some((p) => p.kind === "industry")
      ? pieces
      : [...pieces, ...STARTER_INDUSTRIES];
    return {
      pieces: withIndustries,
      ideas: Array.isArray(parsed.ideas) ? parsed.ideas : [],
      selectedId: null,
    };
  } catch {
    return empty();
  }
}

function persist() {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify({ pieces: state.pieces, ideas: state.ideas }));
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

function normalizeKind(kind: string): ElementKind {
  if (kind === "industry") return "industry";
  if (kind === "wild") return "wild";
  return "sponsor";
}

export function addCustomElement(name: string, kind: string = "sponsor"): CanvasElement {
  const trimmed = name.trim();
  if (!trimmed) throw new Error("Name is required.");
  const existing = state.pieces.find((w) => w.name.toLowerCase() === trimmed.toLowerCase());
  if (existing) return existing;
  const el: CanvasElement = {
    id: `c_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: trimmed,
    kind: normalizeKind(kind),
  };
  emit({ ...state, pieces: [...state.pieces, el] });
  return el;
}

export function addMany(items: Array<{ name: string; kind: string }>): CanvasElement[] {
  const added: CanvasElement[] = [];
  for (const item of items) {
    added.push(addCustomElement(item.name, item.kind));
  }
  return added;
}

export function removePiece(id: string): void {
  emit({
    ...state,
    pieces: state.pieces.filter((w) => w.id !== id),
    selectedId: state.selectedId === id ? null : state.selectedId,
  });
}

export function selectPiece(id: string | null): void {
  emit({ ...state, selectedId: id });
}

export function combineById(idA: string, idB: string): Idea {
  if (idA === idB) throw new Error("Pick two different pieces.");
  const a = state.pieces.find((w) => w.id === idA);
  const b = state.pieces.find((w) => w.id === idB);
  if (!a || !b) throw new Error("Both pieces need to be on the board.");
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
  addCustomElement(a.name, a.kind);
  addCustomElement(b.name, b.kind);
  const left = getCanvasState().pieces.find((w) => w.name.toLowerCase() === a.name.toLowerCase());
  const right = getCanvasState().pieces.find((w) => w.name.toLowerCase() === b.name.toLowerCase());
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
  emit(empty());
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
  const fromBoard = state.pieces.find((el) => el.name.toLowerCase() === q);
  if (fromBoard) return fromBoard;
  return { id: `c_${Math.random().toString(36).slice(2, 8)}`, name: name.trim(), kind: "sponsor" };
}
