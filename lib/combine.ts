import { CanvasElement } from "./elements";

export type Idea = {
  id: string;
  title: string;
  pitch: string;
  parts: string[];
  scamper?: Record<string, string>;
  createdAt: string;
};

export function pairKey(a: string, b: string): string {
  return [a, b].map((s) => s.toLowerCase()).sort().join("::");
}

export function combineElements(a: CanvasElement, b: CanvasElement): Idea {
  const title = `${a.name} × ${b.name}`;
  return {
    id: `idea_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    title,
    pitch: pitchFor(a, b),
    parts: [a.name, b.name],
    createdAt: new Date().toISOString(),
  };
}

export function scamperIdea(idea: Idea): Record<string, string> {
  const t = idea.title;
  return {
    Substitute: `Swap one part of ${t}. What if the API, model, or industry changed?`,
    Combine: `Merge ${t} with another app people already open every day.`,
    Adapt: `Reuse ${t} in a place this stack is not used yet.`,
    Modify: `Make ${t} smaller, faster, or voice-only so it ships in a weekend.`,
    "Put to another use": `Who else could use ${t} besides the first user you named?`,
    Eliminate: `Cut the hardest piece of ${t}. What still works?`,
    Reverse: `Flip ${t}: the user is the agent, or the agent is the user.`,
  };
}

export function ideasToMarkdown(ideas: Idea[]): string {
  const lines = ["# Ideation canvas", ""];
  if (ideas.length === 0) {
    lines.push("No combinations yet.");
    return lines.join("\n");
  }
  for (const idea of ideas) {
    lines.push(`## ${idea.title}`, "", idea.pitch, "", `Parts: ${idea.parts.join(" + ")}`, "");
    if (idea.scamper) {
      lines.push("SCAMPER", "");
      for (const [k, v] of Object.entries(idea.scamper)) {
        lines.push(`- ${k}: ${v}`);
      }
      lines.push("");
    }
  }
  return lines.join("\n");
}

function pitchFor(a: CanvasElement, b: CanvasElement): string {
  const kinds = [a.kind, b.kind].sort().join("+");
  if (kinds === "industry+sponsor" || kinds === "industry+tech") {
    const tech = a.kind === "industry" ? b : a;
    const industry = a.kind === "industry" ? a : b;
    const an = /^[aeiou]/i.test(tech.name) ? "An" : "A";
    return `${an} ${tech.name} product for ${industry.name}. Pick one slow, manual job in ${industry.name} and do it with ${tech.name} in a weekend.`;
  }
  if (kinds === "sponsor+tech" || kinds === "tech+tech" || kinds === "sponsor+sponsor") {
    return `Pipe ${a.name} into ${b.name} as one flow. The demo is the handoff between them.`;
  }
  if (kinds === "industry+wild") {
    const industry = a.kind === "industry" ? a : b;
    const wild = a.kind === "wild" ? a : b;
    return `${industry.name} with a ${wild.name} constraint. The constraint is the product.`;
  }
  if (kinds === "sponsor+wild" || kinds === "tech+wild") {
    const tool = a.kind === "wild" ? b : a;
    const wild = a.kind === "wild" ? a : b;
    return `Build with ${tool.name} under ${wild.name}. Judges remember the constraint.`;
  }
  if (kinds === "industry+industry") {
    return `Where ${a.name} meets ${b.name}. The user lives in both worlds.`;
  }
  return `Combine ${a.name} and ${b.name}. Name the user, the job, and what you can ship in 24 to 48 hours.`;
}
