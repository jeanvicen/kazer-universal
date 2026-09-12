import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createApiKeyForProject, createProjectForUser, listProjectsForUser, revokeApiKey } from "./db";
import { capabilities, platformHealth, registryItems, skills } from "./registry";

const environment = z.enum(["development", "staging", "production"]);

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  platform: router({
    health: publicProcedure.query(() => ({ status: "operational", services: platformHealth })),
    capabilities: publicProcedure.query(() => capabilities),
    registry: publicProcedure.query(() => registryItems),
    skills: publicProcedure.query(() => skills),
  }),
  workspace: router({
    projects: protectedProcedure.query(({ ctx }) => listProjectsForUser(ctx.user.id)),
    createProject: protectedProcedure.input(z.object({
      name: z.string().trim().min(2).max(160),
      environment: environment.default("development"),
      capabilities: z.array(z.string().min(1).max(64)).max(32).default([]),
    })).mutation(({ ctx, input }) => createProjectForUser({ ownerId: ctx.user.id, ...input })),
    createApiKey: protectedProcedure.input(z.object({
      projectId: z.number().int().positive(),
      label: z.string().trim().min(2).max(120),
    })).mutation(({ ctx, input }) => createApiKeyForProject({ ownerId: ctx.user.id, ...input })),
    revokeApiKey: protectedProcedure.input(z.object({ keyId: z.number().int().positive() })).mutation(({ ctx, input }) => revokeApiKey(ctx.user.id, input.keyId)),
  }),
});

export type AppRouter = typeof appRouter;
