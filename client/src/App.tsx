import { useColyseusRoom } from "./colyseus";
import { MainStage } from "./components/MainStage";
import { useControlEventListeners } from "./lib/useControls";
import { Menu } from "./components/ui/Menu";
import { useTryJoinByQueryOrReconnectToken } from "./lib/networking/hooks";
import { useAssetStore, useEnsureAssetsLoaded } from "./assets/assetHandler";
import { Spinner } from "./components/util/Spinner";
import { LogtoProvider } from "@logto/react";
import { logtoConfig } from "./lib/auth/logto";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { CallBackHandler } from "./routes/callback";
import { MapEditor } from "./editor/MapEditor";

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
      <RouterProvider router={router} />
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

  useControlEventListeners();

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
