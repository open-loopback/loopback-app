import { z } from "zod";
import { eq, sql, and, gte } from "drizzle-orm";

import { createTRPCRouter, protectedProcedure } from "../init";
import { feedbacks, sources, projects } from "@/db/schema";
import { db } from "@/db";
import { cache } from "@/lib/cache";

export const analyticsRouter = createTRPCRouter({
    getStats: protectedProcedure
        .input(
            z.object({
                projectId: z.string().optional(),
                sourceId: z.string().optional(),
            })
        )
        .query(async ({ input, ctx }) => {
            const { projectId, sourceId } = input;
            const { userId } = ctx;

            const cacheKey = `analytics:stats:u:${userId}:p:${projectId || 'all'}:s:${sourceId || 'all'}`;

            return await cache.wrap(
                cacheKey,
                async () => {
                    const thirtyDaysAgo = new Date();
                    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

                    const applyFilters = (query: any) => {
                        let base = query.innerJoin(sources, eq(feedbacks.source, sources.id))
                            .innerJoin(projects, eq(sources.projectId, projects.id));

                        base = base.where(and(
                            eq(projects.userId, userId),
                            sourceId ? eq(feedbacks.source, sourceId) : undefined,
                            projectId ? eq(sources.projectId, projectId) : undefined
                        ));
                        return base;
                    };

                    // 1. Total Feedbacks
                    const totalFeedbacksQuery = db
                        .select({ count: sql<number>`count(${feedbacks.id})`.as('count') })
                        .from(feedbacks);

                    const totalFeedbacksRes = await applyFilters(totalFeedbacksQuery);
                    const totalFeedbacks = Number(totalFeedbacksRes[0]?.count || 0);

                    // 2. Average Rating
                    const avgRatingQuery = db
                        .select({ avg: sql<number>`avg(${feedbacks.rating})`.as('avg') })
                        .from(feedbacks);

                    const avgRatingRes = await applyFilters(avgRatingQuery);
                    const averageRating = Number(avgRatingRes[0]?.avg || 0);

                    // 3. Feedbacks Over Time (Last 30 days)
                    const overTimeQuery = db
                        .select({
                            date: sql<string>`to_char(${feedbacks.createdAt}, 'YYYY-MM-DD')`.as('date'),
                            count: sql<number>`count(${feedbacks.id})`.as('count')
                        })
                        .from(feedbacks);

                    let baseOverTime = overTimeQuery
                        .innerJoin(sources, eq(feedbacks.source, sources.id))
                        .innerJoin(projects, eq(sources.projectId, projects.id))
                        .where(and(
                            eq(projects.userId, userId),
                            gte(feedbacks.createdAt, thirtyDaysAgo),
                            sourceId ? eq(feedbacks.source, sourceId) : undefined,
                            projectId ? eq(sources.projectId, projectId) : undefined
                        ));

                    const feedbacksOverTime = await baseOverTime
                        .groupBy(sql`to_char(${feedbacks.createdAt}, 'YYYY-MM-DD')`)
                        .orderBy(sql`to_char(${feedbacks.createdAt}, 'YYYY-MM-DD')`);

                    return {
                        totalFeedbacks,
                        averageRating,
                        feedbacksOverTime: feedbacksOverTime.map(item => ({
                            date: item.date,
                            count: Number(item.count)
                        })),
                    };
                },
                300 // 5 minutes
            );
        }),

});
