import { useLogto } from "@logto/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { ReactNode, useState } from "react";
import { trpc } from "./trpcClient";

const url =
  window.location.hostname === "localhost" ? "http://localhost:2567" : "";

export function TrpcWrapper({ children }: { children: ReactNode }) {
  const { getAccessToken } = useLogto();

  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${url}/trpc`,
          async headers() {
            return {
              authorization:
                "Bearer " +
                (await getAccessToken("https://apocalypse.p3ntest.dev/")),
            };
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
