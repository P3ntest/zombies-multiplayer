import { mapRouter } from "./mapRouter";
import { authProcedure, router } from "./trpc";

export const appRouter = router({
  testConnection: authProcedure.mutation(() => {
    return "Connection Test Successful!";
  }),
  maps: mapRouter,
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
