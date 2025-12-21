import { createTRPCRouter } from "./init";
import { projectsRouter } from "./routers/projects";
import { sourcesRouter } from "./routers/sources";
import { feedbacksRouter } from "./routers/feedbacks";
import { analyticsRouter } from "./routers/analytics";

export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  sources: sourcesRouter,
  feedbacks: feedbacksRouter,
  analytics: analyticsRouter,
});

export type AppRouter = typeof appRouter;
