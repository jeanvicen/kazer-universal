import { randomUUID } from "node:crypto";
import { invokeLLM } from "../server/_core/llm";
import type { KazerTask } from "../core/contracts";

type ChatTaskInput = { prompt: string };
const tasks = new Map<string, KazerTask<ChatTaskInput> & { result?: unknown; error?: string }>();

export function enqueueChatTask(input: ChatTaskInput) {
  const task = { id: `task_${randomUUID()}`, capability: "chat" as const, status: "queued" as const, input, progress: 0, createdAt: Date.now() };
  tasks.set(task.id, task);
  void run(task.id);
  return task;
}

async function run(id: string) {
  const task = tasks.get(id);
  if (!task) return;
  task.status = "running";
  task.progress = 25;
  try {
    const result = await invokeLLM({ messages: [{ role: "user", content: task.input.prompt }] });
    task.result = { output: result.choices[0]?.message.content ?? "", model: result.model, usage: result.usage };
    task.progress = 100;
    task.status = "completed";
  } catch (error) {
    task.error = "Provider could not complete the task";
    task.status = "failed";
    task.progress = 100;
  }
}

export function getTask(id: string) { return tasks.get(id); }
export function cancelTask(id: string) {
  const task = tasks.get(id);
  if (!task || task.status === "completed" || task.status === "failed") return false;
  task.status = "cancelled";
  task.progress = 100;
  return true;
}
