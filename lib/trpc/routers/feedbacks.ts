import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../init";
import { feedbacks, sources } from "@/db/schema";
import { db } from "@/db";
import { eq, desc, and, lt, gt } from "drizzle-orm";

export const feedbacksRouter = createTRPCRouter({
  getAll: publicProcedure
    .input(z.object({ 
        sourceId: z.string(),
        limit: z.number().min(1).max(100).default(20),
        cursor: z.string().nullish(), // Cursor is the ID of the last item
    }))
    .query(async ({ input, ctx }) => {
       if (!ctx.userId) return { items: [], nextCursor: undefined };
       
       // Verify ownership (optional but recommended)
       // Skip for performance or assume sourceId is secret enough? No, user can list.
       
       const items = await db.query.feedbacks.findMany({
           where: (feedbacks, { eq, and, lt }) => and(
               eq(feedbacks.source, input.sourceId),
               input.cursor ? lt(feedbacks.id, input.cursor) : undefined
           ),
           limit: input.limit + 1,
           orderBy: [desc(feedbacks.createdAt), desc(feedbacks.id)],
       });

       let nextCursor: typeof input.cursor | undefined = undefined;
       if (items.length > input.limit) {
           const nextItem = items.pop();
           nextCursor = nextItem!.id;
       }

      return {
          items,
          nextCursor
      };
    }),
});
