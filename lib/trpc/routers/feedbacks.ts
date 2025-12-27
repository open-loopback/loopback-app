import { z } from "zod";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../init";
import { feedbacks, sources, projects } from "@/db/schema";
import { db } from "@/db";
import { eq, desc, and, lt, gt } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { cache } from "@/lib/cache";

export const feedbacksRouter = createTRPCRouter({
    getAll: protectedProcedure
        .input(z.object({
            sourceId: z.string(),
            limit: z.number().min(1).max(100).default(10),
            page: z.number().min(0).default(0),
            q: z.string().optional(),
        }))
        .query(async ({ input, ctx }) => {
            // Verify source ownership (cached)
            const source = await cache.wrap(
                `source:${input.sourceId}:owner`,
                async () => {
                    return await db.query.sources.findFirst({
                        where: eq(sources.id, input.sourceId),
                        with: {
                            project: true
                        }
                    });
                },
                600
            );

            if (!source || source.project.userId !== ctx.userId) {
                return { items: [], totalCount: 0 };
            }

            const isCacheable = !input.q && input.page === 0 && input.limit <= 20;
            const cacheKey = `source:${input.sourceId}:feedbacks:initial`;

            const fetchFeedbacks = async (params: typeof input) => {
                const totalQuery = await db.query.feedbacks.findMany({
                    where: (feedbacks, { eq }) => eq(feedbacks.source, params.sourceId),
                    columns: { id: true }
                });
                const totalCount = totalQuery.length;

                // Handle serial number search (#120)
                if (params.q?.startsWith("#")) {
                    const sn = parseInt(params.q.slice(1));
                    if (!isNaN(sn)) {
                        const index = totalCount - sn;
                        if (index >= 0 && index < totalCount) {
                            const item = await db.query.feedbacks.findFirst({
                                where: (feedbacks, { eq }) => eq(feedbacks.source, params.sourceId),
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
                        eq(feedbacks.source, params.sourceId),
                        params.q ? ilike(feedbacks.message, `%${params.q}%`) : undefined
                    ),
                    limit: params.limit,
                    offset: params.page * params.limit,
                    orderBy: [desc(feedbacks.createdAt), desc(feedbacks.id)],
                });

                return { items, totalCount };
            };

            if (isCacheable) {
                return await cache.wrap(
                    cacheKey,
                    () => fetchFeedbacks(input),
                    180 // 3 minutes
                );
            }

            return await fetchFeedbacks(input);
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

            // Invalidate relevant feedback and analytics caches
            const sourceId = feedback.source.id;
            const projectId = feedback.source.projectId;
            const userId = ctx.userId;

            await Promise.all([
                cache.del(`source:${sourceId}:feedbacks:initial`),
                // Invalidate analytics for this source, this project, and the global view
                cache.del(`analytics:stats:u:${userId}:p:${projectId}:s:${sourceId}`),
                cache.del(`analytics:stats:u:${userId}:p:${projectId}:s:all`),
                cache.del(`analytics:stats:u:${userId}:p:all:s:all`),
            ]);

            return { success: true };
        }),


});

