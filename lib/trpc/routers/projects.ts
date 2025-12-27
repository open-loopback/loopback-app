import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { projects } from "@/db/schema";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { cache } from "@/lib/cache";

export const projectsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    if (!ctx.userId) {
      return [];
    }

    return await cache.wrap(
      `user:${ctx.userId}:projects`,
      async () => {
        const allProjects = await db.query.projects.findMany({
          where: eq(projects.userId, ctx.userId as string),
          orderBy: [desc(projects.createdAt)],
        });
        return allProjects;
      },
      300 // 5 minutes
    );
  }),
  create: publicProcedure
    .input(z.object({ name: z.string().min(1) }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      const [newProject] = await db.insert(projects).values({
        name: input.name,
        userId: ctx.userId,
      }).returning();

      // Invalidate projects cache for this user
      await cache.del(`user:${ctx.userId}:projects`);

      return newProject;
    }),
  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) return null;
      const userId = ctx.userId;

      return await cache.wrap(
        `project:${input.id}`,
        async () => {
          const project = await db.query.projects.findFirst({
            where: (projects, { and, eq }) => and(eq(projects.id, input.id), eq(projects.userId, userId)),
          });
          return project;
        },
        600 // 10 minutes
      );
    })
});

