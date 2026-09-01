export type ElementKind = "sponsor" | "industry" | "wild";

export type CanvasElement = {
  id: string;
  name: string;
  kind: ElementKind;
};

export const FIELDS: Array<{ id: ElementKind; label: string; hint: string }> = [
  { id: "sponsor", label: "Sponsors", hint: "Tools and APIs for this event" },
  { id: "industry", label: "Industries", hint: "Who the idea is for" },
  { id: "wild", label: "Wild cards", hint: "A constraint or angle" },
];

/** Classify a name found in a dropped doc. Not shown until that name is in the file. */
export const KIND_HINTS: Array<{ name: string; kind: ElementKind }> = [
  { name: "OpenAI", kind: "sponsor" },
  { name: "Google Gemini", kind: "sponsor" },
  { name: "Anthropic", kind: "sponsor" },
  { name: "Twilio", kind: "sponsor" },
  { name: "ElevenLabs", kind: "sponsor" },
  { name: "Groq", kind: "sponsor" },
  { name: "Firecrawl", kind: "sponsor" },
  { name: "Stripe", kind: "sponsor" },
  { name: "Neon", kind: "sponsor" },
  { name: "Vercel", kind: "sponsor" },
  { name: "Clerk", kind: "sponsor" },
  { name: "LiveKit", kind: "sponsor" },
  { name: "Solana", kind: "sponsor" },
  { name: "Privy", kind: "sponsor" },
  { name: "LLMs", kind: "sponsor" },
  { name: "Vision AI", kind: "sponsor" },
  { name: "Health", kind: "industry" },
  { name: "Education", kind: "industry" },
  { name: "Defense", kind: "industry" },
  { name: "Finance", kind: "industry" },
  { name: "Entertainment", kind: "industry" },
  { name: "Sports", kind: "industry" },
  { name: "Climate", kind: "industry" },
  { name: "Legal", kind: "industry" },
  { name: "Accessibility", kind: "industry" },
  { name: "Eldercare", kind: "industry" },
  { name: "Voice-only", kind: "wild" },
  { name: "Ship in 24h", kind: "wild" },
];
