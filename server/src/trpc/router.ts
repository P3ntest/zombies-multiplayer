import { mapRouter } from "./mapRouter";
import { statRouter } from "./statRouter";
import { authProcedure, router } from "./trpc";

export const appRouter = router({
  testConnection: authProcedure.mutation(() => {
    return "Connection Test Successful!";
  }),
  maps: mapRouter,
  stats: statRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
