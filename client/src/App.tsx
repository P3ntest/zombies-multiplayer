import { useColyseusRoom } from "./colyseus";
import { MainStage } from "./components/MainStage";
import { Menu } from "./components/ui/Menu";
import { useTryJoinByQueryOrReconnectToken } from "./lib/networking/hooks";
import { useAssetStore, useEnsureAssetsLoaded } from "./assets/assetHandler";
import { Spinner } from "./components/util/Spinner";
import { LogtoProvider, useLogto } from "@logto/react";
import { logtoConfig } from "./lib/auth/logto";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { CallBackHandler } from "./routes/callback";
import { MapEditor } from "./editor/MapEditor";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { trpc } from "./lib/trpc/trpcClient";
import { httpBatchLink } from "@trpc/client";
import { TrpcWrapper } from "./lib/trpc/TrpcWrapper";

const router = createBrowserRouter([
  {
    // path: "/",
    element: <AssetLoadLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/editor",
        element: <MapEditor />,
      },
    ],
  },
  {
    path: "/auth/callback",
    element: <CallBackHandler />,
  },
]);

export function Router() {
  return (
    <LogtoProvider config={logtoConfig}>
      <TrpcWrapper>
        <RouterProvider router={router} />
      </TrpcWrapper>
    </LogtoProvider>
  );
}

function AssetLoadLayout() {
  useEnsureAssetsLoaded();
  const { ready, isLoading } = useAssetStore();

  return (
    <>
      {isLoading && (
        <div className="w-screen h-screen flex items-center justify-center">
          <Spinner />
        </div>
      )}
      {ready && <Outlet />}
    </>
  );
}

export function App() {
  return <Game />;
}

function Game() {
  const room = useColyseusRoom();
  useTryJoinByQueryOrReconnectToken();

  if (!room) {
    return <Menu />;
  }

  return (
    <div
      style={{
        cursor: "crosshair",
      }}
    >
      <MainStage />
    </div>
  );
}
