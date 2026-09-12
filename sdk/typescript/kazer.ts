export type KazerOptions = { apiKey?: string; baseURL?: string };
export type ChatRequest = { prompt?: string; messages?: Array<{ role: string; content: string }>; model?: string; max_tokens?: number };

export class Kazer {
  private readonly baseURL: string;
  private readonly apiKey?: string;
  constructor(options: KazerOptions = {}) { this.baseURL = (options.baseURL ?? "http://localhost:3000").replace(/\/$/, ""); this.apiKey = options.apiKey; }
  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseURL}${path}`, { ...init, headers: { "content-type": "application/json", ...(this.apiKey ? { authorization: `Bearer ${this.apiKey}` } : {}), ...(init?.headers ?? {}) } });
    if (!response.ok) throw new Error(`Kazer API ${response.status}: ${await response.text()}`);
    return response.json() as Promise<T>;
  }
  chat(input: ChatRequest | string) { return this.request<{ id: string; output: string }>("/v1/chat", { method: "POST", body: JSON.stringify(typeof input === "string" ? { prompt: input } : input) }); }
  capabilities() { return this.request<{ data: unknown[] }>("/v1/capabilities"); }
  registry() { return this.request<{ data: unknown[] }>("/v1/registry"); }
  skills() { return this.request<{ data: unknown[] }>("/v1/skills"); }
  auto(task: string) { return this.chat({ prompt: task }); }
}
export default Kazer;
