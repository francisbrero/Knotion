import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { linksRouter } from "./routers/links";
import { tagsRouter } from "./routers/tags";
import { collectionsRouter } from "./routers/collections";
import { commentRouter } from "./routers/comment";
import { notificationsRouter } from "./routers/notifications";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  links: linksRouter,
  tags: tagsRouter,
  collections: collectionsRouter,
  comment: commentRouter,
  notifications: notificationsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
