import { useLogto } from "@logto/react";
import { useEffect } from "react";
import { colyseusClient } from "../../colyseus";

export function useSetColyseusAuthToken() {
  const { isAuthenticated, getAccessToken } = useLogto();

  useEffect(() => {
    (async () => {
      if (isAuthenticated) {
        const accessToken = await getAccessToken(
          "https://apocalypse.p3ntest.dev/"
        );
        colyseusClient.auth.token = accessToken;
      } else {
        colyseusClient.auth.token = undefined;
      }
    })();
  }, [isAuthenticated, getAccessToken]);
}
