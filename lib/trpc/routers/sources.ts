import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { sources } from "@/db/schema";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

export const sourcesRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      // Verify project ownership
      const project = await db.query.projects.findFirst({
        where: (projects, { and, eq }) => and(eq(projects.id, input.projectId), eq(projects.userId, ctx.userId))
      });

      if (!project) return [];

      const projectSources = await db.query.sources.findMany({
        where: eq(sources.projectId, input.projectId),
        orderBy: [desc(sources.createdAt)],
      });
      return projectSources;
    }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), projectId: z.string() }))
    .mutation(async ({ input, ctx }) => {
       // Verify project belongs to user
       const project = await db.query.projects.findFirst({
           where: (projects, { and, eq }) => and(eq(projects.id, input.projectId), eq(projects.userId, ctx.userId))
       });

       if (!project) throw new TRPCError({ code: "NOT_FOUND", message: "Project not found" });

       const sourceId = "src_" + randomBytes(16).toString("hex");

       const [newSource] = await db.insert(sources).values({
           name: input.name,
           projectId: input.projectId,
           sourceId: sourceId
       }).returning();

       return newSource;
    }),
  regenerateToken: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
        // Verify source and ownership using relational query
        const source = await db.query.sources.findFirst({
            where: eq(sources.id, input.id),
            with: {
                project: true
            }
        });
        
        if (!source) throw new TRPCError({ code: "NOT_FOUND" });

        // Verify project ownership
        if (source.project.userId !== ctx.userId) {
            throw new TRPCError({ code: "FORBIDDEN" });
        }

        const newSourceId = "src_" + randomBytes(16).toString("hex");
        
        const [updated] = await db.update(sources)
            .set({ 
                sourceId: newSourceId,
                updatedAt: new Date()
            })
            .where(eq(sources.id, input.id))
            .returning();
            
        return updated;
    }),
    getById: protectedProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            const source = await db.query.sources.findFirst({
                where: eq(sources.id, input.id),
                with: {
                    project: true
                }
            });

            if (!source) return null;
            if (source.project.userId !== ctx.userId) return null;

            return source;
        })
});
