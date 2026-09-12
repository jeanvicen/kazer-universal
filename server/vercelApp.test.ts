import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { vercelApp } from "./vercelApp";

let server: ReturnType<typeof vercelApp.listen>;
let baseUrl = "";

beforeAll(async () => {
  await new Promise<void>(resolve => {
    server = vercelApp.listen(0, () => {
      const address = server.address();
      if (address && typeof address !== "string") baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

afterAll(async () => {
  await new Promise<void>(resolve => server.close(() => resolve()));
});

describe("Vercel serverless app", () => {
  it("serves the Kazer REST API through the exported Express app", async () => {
    const response = await fetch(`${baseUrl}/v1/health`);
    expect(response.status).toBe(200);
    expect((await response.json()).status).toBe("operational");
  });
});
