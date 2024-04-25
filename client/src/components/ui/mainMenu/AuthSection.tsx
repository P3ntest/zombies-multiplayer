import { useLogto } from "@logto/react";
import { useEffect, useState } from "react";

export let currentLogtoToken: string | null = null;

export function LogtoTokenSetterForTrpc() {
  const { getAccessToken, isAuthenticated } = useLogto();
  useEffect(() => {
    if (!isAuthenticated) {
      currentLogtoToken = null;
    } else {
      getAccessToken("https://apocalypse.p3ntest.dev/").then((token) => {
        if (token) {
          currentLogtoToken = token;
        }
      });
    }
  }, [getAccessToken, isAuthenticated]);

  return null;
}

export function AuthSection() {
  const { signIn, isAuthenticated } = useLogto();

  if (isAuthenticated) return <UserInfo />;

  return (
    <button
      className="button"
      onClick={() => signIn(window.location.origin + "/auth/callback")}
    >
      Sign in
    </button>
  );
}

function UserInfo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userInfo, setUserInfo] = useState<any>(null);
  const { fetchUserInfo } = useLogto();
  useEffect(() => {
    fetchUserInfo().then((info) => {
      setUserInfo(info);
    });
  }, [fetchUserInfo]);

  return (
    <div className="bg-slate-800 px-3 p-2 rounded text-slate-200 font-bold text-center">
      Logged in as {userInfo?.name}
    </div>
  );
}
