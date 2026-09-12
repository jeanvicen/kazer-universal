import type { Express, Request, Response } from "express";
import { invokeLLM, listLLMModels, type Message } from "./_core/llm";
import { capabilities, platformHealth, registryItems, skills } from "./registry";
import { cancelTask, enqueueChatTask, getTask } from "../runtime/taskQueue";
import { validateApiKey } from "./db";

function jsonError(res: Response, status: number, code: string, message: string) {
  return res.status(status).json({ error: { code, message } });
}

function requireObjectBody(req: Request, res: Response) {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    jsonError(res, 400, "invalid_request", "Request body must be a JSON object.");
    return false;
  }
  return true;
}

function normalizeMessages(body: Record<string, unknown>): Message[] | null {
  if (Array.isArray(body.messages) && body.messages.length > 0) return body.messages as Message[];
  if (typeof body.prompt === "string" && body.prompt.trim()) return [{ role: "user", content: body.prompt.trim() }];
  return null;
}

async function authorizeExecution(req: Request, res: Response) {
  if (!process.env.DATABASE_URL) return true;
  const authorization = req.header("authorization") ?? "";
  const secret = authorization.startsWith("Bearer ") ? authorization.slice(7).trim() : "";
  if (!secret) { jsonError(res, 401, "missing_api_key", "Bearer Kazer API key is required for execution."); return false; }
  const project = await validateApiKey(secret);
  if (!project) { jsonError(res, 401, "invalid_api_key", "The Kazer API key is invalid or revoked."); return false; }
  return true;
}

async function complete(body: Record<string, unknown>) {
  const messages = normalizeMessages(body);
  if (!messages) throw new Error("Provide a non-empty messages array or prompt string.");
  return invokeLLM({ messages, model: typeof body.model === "string" ? body.model : undefined, maxTokens: typeof body.max_tokens === "number" ? body.max_tokens : undefined });
}

export function registerRestRoutes(app: Express) {
  app.get("/v1/health", (_req, res) => res.json({ status: "operational", services: { ...platformHealth, chat: "operational" } }));
  app.get("/v1/capabilities", (_req, res) => res.json({ data: capabilities }));
  app.get("/v1/registry", (_req, res) => res.json({ data: registryItems }));
  app.get("/v1/skills", (_req, res) => res.json({ data: skills }));
  app.get("/v1/models", async (_req, res) => {
    try { return res.json(await listLLMModels()); }
    catch { return res.json({ object: "list", data: [], notice: "No model catalog is available in the current environment." }); }
  });
  app.get("/v1/providers", (_req, res) => res.json({ data: [{ id: "manus-forge", type: "llm", status: "configured", attribution: "Manus built-in LLM integration" }] }));

  const chatHandler = async (req: Request, res: Response, openAiFormat = false) => {
    if (!requireObjectBody(req, res)) return;
    if (!await authorizeExecution(req, res)) return;
    try {
      const result = await complete(req.body as Record<string, unknown>);
      if (openAiFormat) return res.json(result);
      return res.json({ id: result.id, model: result.model, output: result.choices[0]?.message.content ?? "", choices: result.choices, usage: result.usage });
    } catch (error) {
      const message = error instanceof Error ? error.message : "LLM request failed";
      if (message.includes("Provide a non-empty")) return jsonError(res, 400, "invalid_request", message);
      return jsonError(res, 502, "provider_error", "The configured LLM provider could not complete the request.");
    }
  };

  app.post("/v1/chat", (req, res) => { void chatHandler(req, res); });
  app.post("/v1/chat/completions", (req, res) => { void chatHandler(req, res, true); });
  app.post("/v1/tasks", async (req, res) => {
    if (!requireObjectBody(req, res) || !await authorizeExecution(req, res)) return;
    const prompt = typeof req.body.prompt === "string" ? req.body.prompt.trim() : "";
    if (!prompt) return jsonError(res, 400, "invalid_request", "A prompt is required for a chat task.");
    return res.status(202).json(enqueueChatTask({ prompt }));
  });
  app.get("/v1/tasks/:id", (req, res) => {
    const task = getTask(req.params.id);
    return task ? res.json(task) : jsonError(res, 404, "task_not_found", "Task not found.");
  });
  app.delete("/v1/tasks/:id", (req, res) => cancelTask(req.params.id) ? res.json({ success: true }) : jsonError(res, 409, "task_not_cancellable", "Task cannot be cancelled."));

  const notConfigured = (req: Request, res: Response) => {
    if (!requireObjectBody(req, res)) return;
    return jsonError(res, 501, "capability_not_configured", "This capability is declared but no provider is configured in the current MVP.");
  };
  ["/v1/reason", "/v1/agent", "/v1/search", "/v1/vision", "/v1/image", "/v1/video", "/v1/audio", "/v1/speech", "/v1/embed", "/v1/code", "/v1/tools", "/v1/mcp"].forEach(path => app.post(path, notConfigured));
}
