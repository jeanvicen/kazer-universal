export type AdapterId = "llama-cpp" | "qwen3" | "deepseek-r1";

export type AdapterConfig = {
  id: AdapterId;
  name: string;
  family: "llama.cpp" | "qwen3" | "deepseek-r1";
  baseUrl: string | null;
  model: string | null;
  apiKeyEnv: string | null;
  configured: boolean;
  license: string;
  source: string;
  notes: string[];
};

export type AdapterHealth = {
  id: AdapterId;
  status: "configured" | "not_configured" | "healthy" | "degraded" | "unhealthy";
  baseUrl: string | null;
  expectedModel: string | null;
  availableModels: string[];
  modelMatch: boolean | null;
  latencyMs?: number;
  error?: string;
};

export type AdapterChatRequest = {
  messages: unknown[];
  model?: string;
  max_tokens?: number;
  temperature?: number;
  top_p?: number;
  stream?: boolean;
  tools?: unknown[];
  tool_choice?: unknown;
  response_format?: unknown;
  thinking?: { type: "enabled" | "disabled" };
  reasoning_effort?: "low" | "high" | "max";
};

export type AdapterChatResponse = {
  id?: string;
  model?: string;
  choices?: Array<{ index?: number; message?: { role?: string; content?: unknown; reasoning_content?: unknown; tool_calls?: unknown[] }; finish_reason?: string | null }>;
  usage?: Record<string, unknown>;
  [key: string]: unknown;
};
