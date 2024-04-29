import { useLogto } from "@logto/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { trpc } from "./trpcClient";
import { backendUrl } from "./backendUrl";

export function TrpcWrapper({ children }: { children: ReactNode }) {
  const { getAccessToken, isAuthenticated } = useLogto();

  const [queryClient] = useState(() => new QueryClient());

  const getHeadersFunctionRef = useRef(async () => {
    if (!isAuthenticated) return {};
    return {
      authorization:
        "Bearer " + (await getAccessToken("https://apocalypse.p3ntest.dev/")),
    };
  });

  useEffect(() => {
    getHeadersFunctionRef.current = async () => {
      if (!isAuthenticated) return {};
      return {
        authorization:
          "Bearer " + (await getAccessToken("https://apocalypse.p3ntest.dev/")),
      };
    };
  }, [isAuthenticated, getAccessToken]);

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${backendUrl}/trpc`,
          async headers() {
            return await getHeadersFunctionRef.current();
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
