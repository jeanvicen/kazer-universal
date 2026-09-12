export type KazerCapability = "chat" | "reasoning" | "vision" | "image" | "video" | "audio" | "speech" | "embedding" | "agent" | "browser" | "coding" | "search" | "mcp" | "memory";

export type KazerAdapterManifest = {
  name: string;
  version: string;
  capabilities: KazerCapability[];
  permissions: string[];
  license: string;
  entrypoint: string;
  provenance: { source: string; commitSha?: string; classification: "core" | "adapter" | "embedded" | "adapted" | "external" | "review_required" };
};

export type KazerTask<TInput = unknown> = {
  id: string;
  capability: KazerCapability;
  status: "queued" | "running" | "completed" | "failed" | "cancelled";
  input: TInput;
  progress: number;
  createdAt: number;
};

export type KazerBusEvent<TPayload = unknown> = {
  id: string;
  type: string;
  source: string;
  occurredAt: number;
  payload: TPayload;
};
