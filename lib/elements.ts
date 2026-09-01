export type ElementKind = "tech" | "sponsor" | "industry" | "wild";

export type CanvasElement = {
  id: string;
  name: string;
  kind: ElementKind;
};

export const KIND_LABEL: Record<ElementKind, string> = {
  tech: "Tech",
  sponsor: "Sponsors",
  industry: "Industries",
  wild: "Wild cards",
};

/** Used only when ingesting a dropped doc, to label a name that actually appears in the file. Not shown as a prefilled palette. */
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
  { name: "LLMs", kind: "tech" },
  { name: "Vision AI", kind: "tech" },
  { name: "Voice calls", kind: "tech" },
  { name: "Text to video", kind: "tech" },
  { name: "Speech", kind: "tech" },
  { name: "IoT sensors", kind: "tech" },
  { name: "Maps", kind: "tech" },
  { name: "Blockchain", kind: "tech" },
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
];
