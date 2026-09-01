export type ElementKind = "tech" | "sponsor" | "industry" | "wild";

export type CanvasElement = {
  id: string;
  name: string;
  kind: ElementKind;
};

export const PALETTE: CanvasElement[] = [
  { id: "t-llm", name: "LLMs", kind: "tech" },
  { id: "t-vision", name: "Vision AI", kind: "tech" },
  { id: "t-voice", name: "Voice calls", kind: "tech" },
  { id: "t-video", name: "Text to video", kind: "tech" },
  { id: "t-speech", name: "Speech", kind: "tech" },
  { id: "t-iot", name: "IoT sensors", kind: "tech" },
  { id: "t-maps", name: "Maps", kind: "tech" },
  { id: "t-chain", name: "Blockchain", kind: "tech" },

  { id: "s-openai", name: "OpenAI", kind: "sponsor" },
  { id: "s-gemini", name: "Google Gemini", kind: "sponsor" },
  { id: "s-anthropic", name: "Anthropic", kind: "sponsor" },
  { id: "s-twilio", name: "Twilio", kind: "sponsor" },
  { id: "s-eleven", name: "ElevenLabs", kind: "sponsor" },
  { id: "s-groq", name: "Groq", kind: "sponsor" },
  { id: "s-firecrawl", name: "Firecrawl", kind: "sponsor" },
  { id: "s-stripe", name: "Stripe", kind: "sponsor" },
  { id: "s-neon", name: "Neon", kind: "sponsor" },
  { id: "s-vercel", name: "Vercel", kind: "sponsor" },
  { id: "s-clerk", name: "Clerk", kind: "sponsor" },
  { id: "s-livekit", name: "LiveKit", kind: "sponsor" },
  { id: "s-solana", name: "Solana", kind: "sponsor" },
  { id: "s-privy", name: "Privy", kind: "sponsor" },

  { id: "i-health", name: "Health", kind: "industry" },
  { id: "i-edu", name: "Education", kind: "industry" },
  { id: "i-defense", name: "Defense", kind: "industry" },
  { id: "i-finance", name: "Finance", kind: "industry" },
  { id: "i-ent", name: "Entertainment", kind: "industry" },
  { id: "i-sports", name: "Sports", kind: "industry" },
  { id: "i-climate", name: "Climate", kind: "industry" },
  { id: "i-legal", name: "Legal", kind: "industry" },
  { id: "i-access", name: "Accessibility", kind: "industry" },
  { id: "i-elder", name: "Eldercare", kind: "industry" },

  { id: "w-voice", name: "Voice-only", kind: "wild" },
  { id: "w-24h", name: "Ship in 24h", kind: "wild" },
  { id: "w-nologin", name: "No login", kind: "wild" },
  { id: "w-offline", name: "Offline-first", kind: "wild" },
  { id: "w-pain", name: "Personal pain", kind: "wild" },
  { id: "w-prize", name: "Sponsor prize", kind: "wild" },
];

export const KIND_LABEL: Record<ElementKind, string> = {
  tech: "Tech",
  sponsor: "Sponsors",
  industry: "Industries",
  wild: "Wild cards",
};
