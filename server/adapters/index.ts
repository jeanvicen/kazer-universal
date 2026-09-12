import type { AdapterChatRequest, AdapterChatResponse, AdapterConfig, AdapterHealth, AdapterId } from "./types";

const DEFAULT_TIMEOUT_MS = 30_000;
const MAX_BODY_BYTES = 2_000_000;

const env = (name: string) => process.env[name]?.trim() || null;
const normalizeBase = (value: string) => value.replace(/\/+$/, "");

export const adapterConfigs: AdapterConfig[] = [
  {
    id: "llama-cpp",
    name: "llama.cpp Server",
    family: "llama.cpp",
    baseUrl: env("KAZER_LLAMA_CPP_BASE_URL"),
    model: env("KAZER_LLAMA_CPP_MODEL"),
    apiKeyEnv: "KAZER_LLAMA_CPP_API_KEY",
    configured: Boolean(env("KAZER_LLAMA_CPP_BASE_URL") && env("KAZER_LLAMA_CPP_MODEL")),
    license: "MIT code; model and GGUF/LoRA licenses remain upstream-specific",
    source: "https://github.com/ggml-org/llama.cpp",
    notes: ["Expected endpoint: /v1/chat/completions", "Readiness: /health", "No model weights are bundled by Kazer"],
  },
  {
    id: "qwen3",
    name: "Qwen3 OpenAI-compatible",
    family: "qwen3",
    baseUrl: env("KAZER_QWEN3_BASE_URL"),
    model: env("KAZER_QWEN3_MODEL"),
    apiKeyEnv: "KAZER_QWEN3_API_KEY",
    configured: Boolean(env("KAZER_QWEN3_BASE_URL") && env("KAZER_QWEN3_MODEL")),
    license: "Apache-2.0 model weights; repository code and dependencies require separate review",
    source: "https://github.com/QwenLM/Qwen3",
    notes: ["Expected runtime: vLLM, SGLang or another compatible server", "Thinking output is normalized but not exposed by default", "Checkpoint must be explicit"],
  },
  {
    id: "deepseek-r1",
    name: "DeepSeek-R1",
    family: "deepseek-r1",
    baseUrl: env("KAZER_DEEPSEEK_R1_BASE_URL") || (env("DEEPSEEK_API_KEY") ? "https://api.deepseek.com" : null),
    model: env("KAZER_DEEPSEEK_R1_MODEL") || "deepseek-reasoner",
    apiKeyEnv: "KAZER_DEEPSEEK_R1_API_KEY",
    configured: Boolean((env("KAZER_DEEPSEEK_R1_BASE_URL") || env("DEEPSEEK_API_KEY")) && (env("KAZER_DEEPSEEK_R1_API_KEY") || env("DEEPSEEK_API_KEY"))),
    license: "MIT for original R1 code and weights; distilled Qwen/Llama variants retain upstream terms",
    source: "https://github.com/deepseek-ai/DeepSeek-R1",
    notes: ["Model identity is checked against /models", "reasoning_content is retained server-side only", "No silent fallback to a successor model"],
  },
];

function getConfig(id: AdapterId) {
  const config = adapterConfigs.find(item => item.id === id);
  if (!config) throw new Error("adapter_not_found");
  return config;
}

function secretFor(config: AdapterConfig) {
  if (config.id === "deepseek-r1") return env("KAZER_DEEPSEEK_R1_API_KEY") || env("DEEPSEEK_API_KEY");
  return config.apiKeyEnv ? env(config.apiKeyEnv) : null;
}

function endpoint(config: AdapterConfig, path: string) {
  if (!config.baseUrl) throw new Error("adapter_not_configured");
  const base = normalizeBase(config.baseUrl);
  return `${base.endsWith("/v1") && path.startsWith("/v1/") ? base + path.slice(3) : base + path}`;
}

async function fetchJson(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);
  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const text = await response.text();
    if (Buffer.byteLength(text, "utf8") > MAX_BODY_BYTES) throw new Error("adapter_response_too_large");
    let body: unknown = null;
    try { body = text ? JSON.parse(text) : null; } catch { body = { raw: text.slice(0, 1000) }; }
    if (!response.ok) {
      const detail = typeof body === "object" && body && "error" in body ? String((body as { error?: unknown }).error) : `HTTP ${response.status}`;
      throw new Error(`adapter_upstream_${response.status}:${detail.slice(0, 300)}`);
    }
    return body as Record<string, unknown>;
  } finally {
    clearTimeout(timer);
  }
}

function headers(config: AdapterConfig) {
  const secret = secretFor(config);
  return { "content-type": "application/json", ...(secret ? { authorization: `Bearer ${secret}` } : {}) };
}

export async function healthAdapter(id: AdapterId): Promise<AdapterHealth> {
  const config = getConfig(id);
  if (!config.configured) return { id, status: "not_configured", baseUrl: config.baseUrl, expectedModel: config.model, availableModels: [], modelMatch: null };
  const started = Date.now();
  try {
    const health = id === "llama-cpp" ? await fetchJson(endpoint(config, "/health"), { headers: headers(config) }) : null;
    const models = await fetchJson(endpoint(config, "/v1/models"), { headers: headers(config) });
    const data = Array.isArray(models.data) ? models.data : [];
    const availableModels = data.flatMap(item => typeof item === "object" && item && typeof (item as { id?: unknown }).id === "string" ? [(item as { id: string }).id] : []);
    const modelMatch = Boolean(config.model && availableModels.includes(config.model));
    const llamaReady = id !== "llama-cpp" || Boolean(health && (health.status === "ok" || health.status === "loading"));
    return { id, status: llamaReady && modelMatch ? "healthy" : "degraded", baseUrl: config.baseUrl, expectedModel: config.model, availableModels, modelMatch, latencyMs: Date.now() - started };
  } catch (error) {
    return { id, status: "unhealthy", baseUrl: config.baseUrl, expectedModel: config.model, availableModels: [], modelMatch: false, latencyMs: Date.now() - started, error: error instanceof Error ? error.message : "adapter_health_failed" };
  }
}

export async function chatWithAdapter(id: AdapterId, input: AdapterChatRequest): Promise<AdapterChatResponse> {
  const config = getConfig(id);
  if (!config.configured) throw new Error("adapter_not_configured");
  const model = input.model || config.model;
  if (!model) throw new Error("adapter_model_required");
  if (!Array.isArray(input.messages) || input.messages.length === 0) throw new Error("adapter_messages_required");
  if (input.messages.length > 100) throw new Error("adapter_message_limit");
  const maxTokens = Math.min(Math.max(input.max_tokens ?? 1024, 1), 8192);
  const body: Record<string, unknown> = { ...input, model, max_tokens: maxTokens };
  if (id === "deepseek-r1") {
    body.model = config.model;
    if (input.reasoning_effort) body.reasoning_effort = input.reasoning_effort;
  }
  return await fetchJson(endpoint(config, "/v1/chat/completions"), { method: "POST", headers: headers(config), body: JSON.stringify(body) }) as AdapterChatResponse;
}

export function publicAdapterCatalog() {
  return adapterConfigs.map(config => ({ ...config, apiKeyEnv: undefined, apiKeyConfigured: Boolean(secretFor(config)) }));
}
