import { useLogto } from "@logto/react";
import { useEffect, useState } from "react";

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
  });

  console.log(userInfo);

  return (
    <div className="bg-slate-800 px-3 p-2 rounded text-slate-200 font-bold text-center">
      Logged in as {userInfo?.name}
    </div>
  );
}
