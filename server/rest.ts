import type { Express, Request, Response } from "express";
import { capabilities, platformHealth, registryItems, skills } from "./registry";

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

export function registerRestRoutes(app: Express) {
  app.get("/v1/health", (_req, res) => res.json({ status: "operational", services: platformHealth }));
  app.get("/v1/capabilities", (_req, res) => res.json({ data: capabilities }));
  app.get("/v1/registry", (_req, res) => res.json({ data: registryItems }));
  app.get("/v1/skills", (_req, res) => res.json({ data: skills }));
  app.get("/v1/models", (_req, res) => res.json({ data: [], notice: "No model provider is enabled in this MVP." }));
  app.get("/v1/providers", (_req, res) => res.json({ data: [], notice: "No external provider is enabled in this MVP." }));

  const notConfigured = (req: Request, res: Response) => {
    if (!requireObjectBody(req, res)) return;
    return jsonError(res, 501, "capability_not_configured", "This capability is declared but no provider is configured in the current MVP.");
  };

  ["/v1/chat", "/v1/reason", "/v1/agent", "/v1/search", "/v1/vision", "/v1/image", "/v1/video", "/v1/audio", "/v1/speech", "/v1/embed", "/v1/code", "/v1/tools", "/v1/mcp"].forEach(path => {
    app.post(path, notConfigured);
  });
}
