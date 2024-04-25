import { AppRouter } from "../../../../server/src/trpc/router";

import { createTRPCClient, httpBatchLink } from "@trpc/client";
import { currentLogtoToken } from "../../components/ui/mainMenu/AuthSection";

// if on localhost use localhost:2567 else use the current domain
const url =
  window.location.hostname === "localhost" ? "http://localhost:2567" : "";

export const trpc = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${url}/trpc`,
      headers: () => {
        const token = currentLogtoToken;
        if (!token) {
          return {};
        }
        return {
          Authorization: `Bearer ${token}`,
        };
      },
    }),
  ],
});
