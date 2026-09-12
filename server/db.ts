import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { createHash, randomBytes } from "node:crypto";
import { nanoid } from "nanoid";
import { InsertUser, apiKeys, projects, users } from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;
  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      const value = user[field] ?? null;
      values[field] = value;
      updateSet[field] = value;
    }
  }
  if (user.lastSignedIn !== undefined) {
    values.lastSignedIn = user.lastSignedIn;
    updateSet.lastSignedIn = user.lastSignedIn;
  }
  if (user.role !== undefined) {
    values.role = user.role;
    updateSet.role = user.role;
  } else if (user.openId === ENV.ownerOpenId) {
    values.role = "admin";
    updateSet.role = "admin";
  }
  values.lastSignedIn ??= new Date();
  updateSet.lastSignedIn ??= new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function requireDb() {
  if (!_db) throw new Error("Database is not configured");
  return _db;
}

export async function createProjectForUser(input: { ownerId: number; name: string; environment: "development" | "staging" | "production"; capabilities: string[] }) {
  const db = requireDb();
  const projectId = `prj_${nanoid(16)}`;
  const [created] = await db.insert(projects).values({
    ownerId: input.ownerId,
    projectId,
    name: input.name,
    environment: input.environment,
    capabilities: JSON.stringify(input.capabilities),
  }).$returningId();
  return { id: created.id, projectId, name: input.name, environment: input.environment, capabilities: input.capabilities };
}

export async function listProjectsForUser(ownerId: number) {
  const db = requireDb();
  const rows = await db.select().from(projects).where(eq(projects.ownerId, ownerId)).orderBy(desc(projects.createdAt));
  return rows.map(row => ({ ...row, capabilities: JSON.parse(row.capabilities) as string[] }));
}

export async function createApiKeyForProject(input: { ownerId: number; projectId: number; label: string }) {
  const db = requireDb();
  const project = await db.select().from(projects).where(and(eq(projects.id, input.projectId), eq(projects.ownerId, input.ownerId))).limit(1);
  if (!project[0]) throw new Error("Project not found");
  const secret = `kzr_${randomBytes(24).toString("base64url")}`;
  const keyHash = createHash("sha256").update(secret).digest("hex");
  const keyPrefix = secret.slice(0, 12);
  await db.insert(apiKeys).values({ projectId: input.projectId, label: input.label, keyPrefix, keyHash });
  return { secret, keyPrefix, projectId: project[0].projectId };
}

export async function revokeApiKey(ownerId: number, keyId: number) {
  const db = requireDb();
  const owned = await db.select({ keyId: apiKeys.id }).from(apiKeys).innerJoin(projects, eq(apiKeys.projectId, projects.id)).where(and(eq(apiKeys.id, keyId), eq(projects.ownerId, ownerId))).limit(1);
  if (!owned[0]) throw new Error("API key not found");
  await db.update(apiKeys).set({ revokedAt: new Date() }).where(eq(apiKeys.id, keyId));
  return { success: true as const };
}
