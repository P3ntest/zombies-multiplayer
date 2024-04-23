import { useHandleSignInCallback } from "@logto/react";
import { useNavigate } from "react-router-dom";
import { Spinner } from "../components/util/Spinner";

export function CallBackHandler() {
  const navigate = useNavigate();
  const { isLoading } = useHandleSignInCallback(() => {
    console.log("Sign in callback");
    navigate("/");
  });
  if (isLoading) return <Spinner />;
  return <div>Done.</div>;
}
