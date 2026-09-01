import {
  addCustomElement,
  addMany,
  combineByName,
  downloadMarkdown,
  getCanvasState,
  resetCanvas,
  runScamper,
} from "./canvas-store";
import { ingestText } from "./ingest";

export type McpTool = {
  name: string;
  description: string;
  inputSchema: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required?: string[];
  };
  handler: (args: Record<string, any>) => Promise<any> | any;
  requires_approval?: boolean;
};

export const CANVAS_TOOLS: McpTool[] = [
  {
    name: "list_palette",
    description: "List tech, sponsor, industry, and wild-card pieces on the ideation canvas.",
    inputSchema: { type: "object", properties: {} },
    handler: () => ({
      workspace: getCanvasState().workspace.map((el) => ({ name: el.name, kind: el.kind })),
    }),
  },
  {
    name: "add_element",
    description: "Add a piece to the canvas. Use this for a sponsor tool the event actually has.",
    inputSchema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Name of the tool, industry, or constraint" },
        kind: {
          type: "string",
          enum: ["tech", "sponsor", "industry", "wild"],
          description: "sponsor for event APIs, industry for problem spaces",
        },
      },
      required: ["name"],
    },
    handler: (args) => {
      const kind = ["tech", "sponsor", "industry", "wild"].includes(args.kind) ? args.kind : "sponsor";
      const el = addCustomElement(String(args.name || ""), kind);
      return { added: el };
    },
  },
  {
    name: "ingest_doc",
    description:
      "Read hackathon or sponsor text (README, prize list, Devpost blurb) and register only stacks named in that text.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Plain text of the doc" },
      },
      required: ["text"],
    },
    handler: (args) => {
      const items = ingestText(String(args.text || ""));
      const added = addMany(items);
      return { added: added.map((el) => ({ name: el.name, kind: el.kind })), count: added.length };
    },
  },
  {
    name: "combine",
    description: "Combine two pieces on the canvas into one idea (Little Alchemy method).",
    inputSchema: {
      type: "object",
      properties: {
        a: { type: "string", description: "First piece name" },
        b: { type: "string", description: "Second piece name" },
      },
      required: ["a", "b"],
    },
    handler: (args) => combineByName(String(args.a || ""), String(args.b || "")),
  },
  {
    name: "list_ideas",
    description: "List ideas already combined on the canvas.",
    inputSchema: { type: "object", properties: {} },
    handler: () => ({ ideas: getCanvasState().ideas }),
  },
  {
    name: "scamper",
    description: "Push an idea through SCAMPER (substitute, combine, adapt, modify, put to another use, eliminate, reverse).",
    inputSchema: {
      type: "object",
      properties: {
        idea_id: { type: "string", description: "Idea id from list_ideas" },
      },
      required: ["idea_id"],
    },
    handler: (args) => runScamper(String(args.idea_id || "")),
  },
  {
    name: "download_canvas",
    description: "Download the canvas as a markdown file the team can keep.",
    inputSchema: { type: "object", properties: {} },
    requires_approval: true,
    handler: () => {
      const markdown = downloadMarkdown();
      return { markdown, ideas: getCanvasState().ideas.length };
    },
  },
  {
    name: "reset_canvas",
    description: "Clear the workspace and ideas.",
    inputSchema: { type: "object", properties: {} },
    requires_approval: true,
    handler: () => {
      resetCanvas();
      return { ok: true };
    },
  },
];

export function registerCanvasMcp(): boolean {
  if (typeof window === "undefined") return false;
  const w = window as any;
  if (typeof w.WebMCP?.registerTool !== "function") return false;
  for (const tool of CANVAS_TOOLS) {
    w.WebMCP.registerTool?.({
      name: tool.name,
      description: tool.description,
      parameters: tool.inputSchema,
      requires_approval: tool.requires_approval || false,
      handler: tool.handler,
    });
  }

  const modelContext = (navigator as any).modelContext;
  if (modelContext?.registerTool) {
    for (const tool of CANVAS_TOOLS) {
      try {
        modelContext.registerTool({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
          execute: async (args: Record<string, any>) => ({
            content: [{ type: "text", text: JSON.stringify(await tool.handler(args ?? {}), null, 2) }],
          }),
        });
      } catch {
        /* older implementations */
      }
    }
  }
  return true;
}
