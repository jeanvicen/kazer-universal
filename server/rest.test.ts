import express from "express";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { registerRestRoutes } from "./rest";

const app = express();
let server: ReturnType<typeof app.listen>;
let baseUrl = "";

beforeAll(async () => {
  app.use(express.json());
  registerRestRoutes(app);
  await new Promise<void>(resolve => {
    server = app.listen(0, () => {
      const address = server.address();
      if (address && typeof address !== "string") baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

describe("REST discovery API", () => {
  it("returns health and declared capabilities", async () => {
    const health = await fetch(`${baseUrl}/v1/health`);
    const capabilities = await fetch(`${baseUrl}/v1/capabilities`);
    expect(health.status).toBe(200);
    expect(capabilities.status).toBe(200);
    expect((await capabilities.json()).data).toEqual(expect.arrayContaining([expect.objectContaining({ id: "chat" })]));
  });

  it("protects chat execution with an API key", async () => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("missing_api_key");
  });

  it("keeps unconfigured capabilities explicit", async () => {
    const response = await fetch(`${baseUrl}/v1/image`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });
    expect(response.status).toBe(501);
    expect((await response.json()).error.code).toBe("capability_not_configured");
  });

  it("rejects repository inspection outside the safe GitHub boundary", async () => {
    const response = await fetch(`${baseUrl}/v1/repository/inspect`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ url: "https://example.com/unknown/repo" }),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("repository_host_not_allowed");
  });

  it("requires a repository URL for intake", async () => {
    const response = await fetch(`${baseUrl}/v1/repository/inspect`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe("invalid_request");
  });

  it("exposes the three official adapters without leaking secrets", async () => {
    const response = await fetch(`${baseUrl}/v1/adapters`);
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body.data).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: "llama-cpp", source: "https://github.com/ggml-org/llama.cpp" }),
      expect.objectContaining({ id: "qwen3", source: "https://github.com/QwenLM/Qwen3" }),
      expect.objectContaining({ id: "deepseek-r1", source: "https://github.com/deepseek-ai/DeepSeek-R1" }),
    ]));
    expect(JSON.stringify(body)).not.toContain("API_KEY");
  });

  it("reports an unconfigured adapter instead of pretending it is ready", async () => {
    const response = await fetch(`${baseUrl}/v1/adapters/llama-cpp/health`);
    expect(response.status).toBe(200);
    expect((await response.json()).data.status).toBe("not_configured");
  });

  it("protects adapter chat before revealing provider configuration", async () => {
    const response = await fetch(`${baseUrl}/v1/adapters/qwen3/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: "hello" }] }),
    });
    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe("missing_api_key");
  });
});
