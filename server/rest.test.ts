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

  it("does not pretend execution is available without a provider", async () => {
    const response = await fetch(`${baseUrl}/v1/chat`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: "hello" }),
    });
    expect(response.status).toBe(501);
    expect((await response.json()).error.code).toBe("capability_not_configured");
  });
});
