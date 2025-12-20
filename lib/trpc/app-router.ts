import { createTRPCRouter } from "./init";
import { projectsRouter } from "./routers/projects";
import { sourcesRouter } from "./routers/sources";
import { feedbacksRouter } from "./routers/feedbacks";

export const appRouter = createTRPCRouter({
  projects: projectsRouter,
  sources: sourcesRouter,
  feedbacks: feedbacksRouter,
});

export type AppRouter = typeof appRouter;
