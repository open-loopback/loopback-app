import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { feedbacks, sources, projects } from "@/db/schema";
import { db } from "@/db";
import { eq, desc, and, lt, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const feedbacksRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(z.object({ 
        sourceId: z.string(),
        limit: z.number().min(1).max(100).default(10),
        page: z.number().min(0).default(0),
        q: z.string().optional(),
    }))
    .query(async ({ input, ctx }) => {
       // Verify source ownership
       const source = await db.query.sources.findFirst({
           where: eq(sources.id, input.sourceId),
           with: {
               project: true
           }
       });

       if (!source || source.project.userId !== ctx.userId) {
           return { items: [], totalCount: 0 };
       }
       
       const totalQuery = await db.query.feedbacks.findMany({
           where: (feedbacks, { eq }) => eq(feedbacks.source, input.sourceId),
           columns: { id: true }
       });
       const totalCount = totalQuery.length;

       // Handle serial number search (#120)
       if (input.q?.startsWith("#")) {
           const sn = parseInt(input.q.slice(1));
           if (!isNaN(sn)) {
               const index = totalCount - sn;
               if (index >= 0 && index < totalCount) {
                   const item = await db.query.feedbacks.findFirst({
                       where: (feedbacks, { eq }) => eq(feedbacks.source, input.sourceId),
                       offset: index,
                       orderBy: [desc(feedbacks.createdAt), desc(feedbacks.id)],
                   });
                   return { items: item ? [item] : [], totalCount: 1 };
               }
               return { items: [], totalCount: 0 };
           }
       }

       const items = await db.query.feedbacks.findMany({
           where: (feedbacks, { eq, and, ilike }) => and(
               eq(feedbacks.source, input.sourceId),
               input.q ? ilike(feedbacks.message, `%${input.q}%`) : undefined
           ),
           limit: input.limit,
           offset: input.page * input.limit,
           orderBy: [desc(feedbacks.createdAt), desc(feedbacks.id)],
       });

      return {
          items,
          totalCount
      };
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const feedback = await db.query.feedbacks.findFirst({
        where: eq(feedbacks.id, input.id),
        with: {
            source: {
                with: {
                    project: true
                }
            }
        }
      });

      if (!feedback) throw new TRPCError({ code: "NOT_FOUND" });

      // @ts-ignore - nested relations work if defined
      if (feedback.source.project.userId !== ctx.userId) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      await db.delete(feedbacks).where(eq(feedbacks.id, input.id));

      return { success: true };
    }),
});
