import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { sources } from "@/db/schema";
import { db } from "@/db";
import { eq, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { randomBytes } from "crypto";

export const sourcesRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ input, ctx }) => {
      if (!ctx.userId) return [];
      const projectSources = await db.query.sources.findMany({
        where: eq(sources.projectId, input.projectId),
        orderBy: [desc(sources.createdAt)],
      });
      return projectSources;
    }),
  create: publicProcedure
    .input(z.object({ name: z.string(), projectId: z.string() }))
    .mutation(async ({ input, ctx }) => {
       if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
       
       // Verify project belongs to user
       const project = await db.query.projects.findFirst({
           where: (projects, { and, eq }) => and(eq(projects.id, input.projectId), eq(projects.userId, ctx.userId!))
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
   regenerateToken: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
        if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });
        
        // Verify source and ownership
        const source = await db.query.sources.findFirst({
            where: (sources, { eq }) => eq(sources.id, input.id),
            with: {
                project: true
            }
        });
        
        // Note: Relation might not be set up in schema.ts "relations", so manual check might be needed if "with" fails.
        // Assuming no relations defined in schema yet.
        
        const existingSource = await db.query.sources.findFirst({
            where: eq(sources.id, input.id),
        });
        
        if (!existingSource) throw new TRPCError({ code: "NOT_FOUND" });

        const project = await db.query.projects.findFirst({
             where: (projects, { and, eq }) => and(eq(projects.id, existingSource.projectId), eq(projects.userId, ctx.userId!))
        });

        if (!project) throw new TRPCError({ code: "FORBIDDEN" });

        const newSourceId = "src_" + randomBytes(16).toString("hex");
        
        const [updated] = await db.update(sources)
            .set({ sourceId: newSourceId })
            .where(eq(sources.id, input.id))
            .returning();
            
        return updated;
    }),
    getById: publicProcedure
        .input(z.object({ id: z.string() }))
        .query(async ({ input, ctx }) => {
            if (!ctx.userId) return null;
            const source = await db.query.sources.findFirst({
                where: eq(sources.id, input.id),
            });
            // Should verify ownership, but for read it implies if they have ID they might see? No, must verify project->user.
            if (!source) return null;
            const project = await db.query.projects.findFirst({
                where: (projects, { and, eq }) => and(eq(projects.id, source.projectId), eq(projects.userId, ctx.userId!))
            });
            if (!project) return null;
            return source;
        })
});
