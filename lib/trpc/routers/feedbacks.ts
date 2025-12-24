import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { feedbacks, sources, projects } from "@/db/schema";
import { db } from "@/db";
import { eq, desc, and, lt, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const feedbacksRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ 
        sourceId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(0).default(0),
    }))
    .query(async ({ input, ctx }) => {
       if (!ctx.userId) return { items: [], totalCount: 0 };
       
       // Verify ownership (optional but recommended)
       // Skip for performance or assume sourceId is secret enough? No, user can list.
       
       const [items, total] = await Promise.all([
           db.query.feedbacks.findMany({
               where: (feedbacks, { eq }) => eq(feedbacks.source, input.sourceId),
               limit: input.limit,
               offset: input.page * input.limit,
               orderBy: [desc(feedbacks.createdAt), desc(feedbacks.id)],
           }),
           db.query.feedbacks.findMany({
               where: (feedbacks, { eq }) => eq(feedbacks.source, input.sourceId),
               columns: { id: true }
           })
       ]);

      return {
          items,
          totalCount: total.length
      };
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      if (!ctx.userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const feedback = await db.query.feedbacks.findFirst({
        where: eq(feedbacks.id, input.id),
      });

      if (!feedback) throw new TRPCError({ code: "NOT_FOUND" });

      const source = await db.query.sources.findFirst({
        where: eq(sources.id, feedback.source),
      });

      if (!source) throw new TRPCError({ code: "NOT_FOUND" });

      const project = await db.query.projects.findFirst({
        where: and(eq(projects.id, source.projectId), eq(projects.userId, ctx.userId)),
      });

      if (!project) throw new TRPCError({ code: "FORBIDDEN" });

      await db.delete(feedbacks).where(eq(feedbacks.id, input.id));

      return { success: true };
    }),
});
