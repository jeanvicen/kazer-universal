import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

const context: TrpcContext = {
  user: null,
  req: {} as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("platform registry", () => {
  it("exposes capabilities and health without authentication", async () => {
    const caller = appRouter.createCaller(context);
    const [caps, health] = await Promise.all([
      caller.platform.capabilities(),
      caller.platform.health(),
    ]);

    expect(caps.map(capability => capability.id)).toContain("chat");
    expect(health.status).toBe("operational");
    expect(health.services.registry).toBe("operational");
  });

  it("requires provenance and license metadata for registry entries", async () => {
    const caller = appRouter.createCaller(context);
    const items = await caller.platform.registry();

    expect(items.length).toBeGreaterThan(0);
    for (const item of items) {
      expect(item.source.length).toBeGreaterThan(0);
      expect(item.license.length).toBeGreaterThan(0);
      expect(item.provenance.length).toBeGreaterThan(0);
    }
  });

  it("returns extensible skills with explicit permissions", async () => {
    const caller = appRouter.createCaller(context);
    const result = await caller.platform.skills();

    expect(result.length).toBeGreaterThan(0);
    expect(result.some(skill => skill.id === "license-review")).toBe(true);
    expect(result.every(skill => skill.permissions.length > 0)).toBe(true);
  });
});
