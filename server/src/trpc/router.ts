import { mapRouter } from "./mapRouter";
import { authProcedure, publicProcedure, router } from "./trpc";

export const appRouter = router({
  helloWorld: authProcedure.query(() => {
    return "Hello, world!";
  }),
  maps: mapRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
