import { useLogto } from "@logto/react";
import { useEffect, useState } from "react";

export function AuthSection() {
  const { signIn, isAuthenticated } = useLogto();

  if (isAuthenticated) return <UserInfo />;

  return (
    <button
      className="btn"
      onClick={() => signIn(window.location.origin + "/auth/callback")}
    >
      Sign in
    </button>
  );
}

function UserInfo() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userInfo, setUserInfo] = useState<any>(null);
  const { fetchUserInfo, signOut } = useLogto();
  useEffect(() => {
    fetchUserInfo().then((info) => {
      setUserInfo(info);
    });
  }, [fetchUserInfo]);

  return (
    <div className="card">
      <div className="card">Logged in as {userInfo?.name}</div>
      <button
        className="btn"
        onClick={() => {
          signOut(window.location.origin);
        }}
      >
        Sign out
      </button>
    </div>
  );
}
