export type FocusArea = "sources" | "composer";

export type SourceSelectionMode = "all" | "single" | "multi-pending-ragcli";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  citations?: Citation[];
}

export interface Citation {
  source: string;
  page: number;
  chunkIndex: number;
  score: number | null;
}

export interface AppOptions {
  ragcliPath: string;
  storeName?: string;
}
