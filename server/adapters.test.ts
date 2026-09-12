import { afterEach, describe, expect, it, vi } from "vitest";

const original = {
  base: process.env.KAZER_LLAMA_CPP_BASE_URL,
  model: process.env.KAZER_LLAMA_CPP_MODEL,
  key: process.env.KAZER_LLAMA_CPP_API_KEY,
};

afterEach(() => {
  vi.restoreAllMocks();
  if (original.base === undefined) delete process.env.KAZER_LLAMA_CPP_BASE_URL; else process.env.KAZER_LLAMA_CPP_BASE_URL = original.base;
  if (original.model === undefined) delete process.env.KAZER_LLAMA_CPP_MODEL; else process.env.KAZER_LLAMA_CPP_MODEL = original.model;
  if (original.key === undefined) delete process.env.KAZER_LLAMA_CPP_API_KEY; else process.env.KAZER_LLAMA_CPP_API_KEY = original.key;
  vi.resetModules();
});

describe("official adapter transport", () => {
  it("sends a llama.cpp-compatible chat request with the configured model and bearer key", async () => {
    process.env.KAZER_LLAMA_CPP_BASE_URL = "http://adapter.test/v1";
    process.env.KAZER_LLAMA_CPP_MODEL = "qwen3-8b-gguf";
    process.env.KAZER_LLAMA_CPP_API_KEY = "server-secret";
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      expect(url).toBe("http://adapter.test/v1/chat/completions");
      expect(init?.headers).toMatchObject({ authorization: "Bearer server-secret" });
      const body = JSON.parse(String(init?.body));
      expect(body.model).toBe("qwen3-8b-gguf");
      expect(body.max_tokens).toBe(128);
      return new Response(JSON.stringify({ id: "chat_1", model: body.model, choices: [{ message: { role: "assistant", content: "ok" } }] }), { status: 200, headers: { "content-type": "application/json" } });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { chatWithAdapter } = await import("./adapters");
    const result = await chatWithAdapter("llama-cpp", { messages: [{ role: "user", content: "hello" }], max_tokens: 128 });
    expect(result.choices?.[0]?.message?.content).toBe("ok");
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("marks a configured Qwen3 endpoint degraded when its exact checkpoint is absent", async () => {
    process.env.KAZER_LLAMA_CPP_BASE_URL = undefined;
    process.env.KAZER_LLAMA_CPP_MODEL = undefined;
    process.env.KAZER_LLAMA_CPP_API_KEY = undefined;
    process.env.KAZER_QWEN3_BASE_URL = "http://qwen.test/v1";
    process.env.KAZER_QWEN3_MODEL = "Qwen/Qwen3-8B";
    const fetchMock = vi.fn(async (url: string) => {
      expect(url).toBe("http://qwen.test/v1/models");
      return new Response(JSON.stringify({ data: [{ id: "other-model" }] }), { status: 200 });
    });
    vi.stubGlobal("fetch", fetchMock);
    const { healthAdapter } = await import("./adapters");
    const result = await healthAdapter("qwen3");
    expect(result.status).toBe("degraded");
    expect(result.modelMatch).toBe(false);
  });
});
