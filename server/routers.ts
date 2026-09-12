import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { capabilities, platformHealth, registryItems, skills } from "./registry";

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
});

export type AppRouter = typeof appRouter;
