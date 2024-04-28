import { appRouter } from "./trpc/router";
import config from "@colyseus/tools";
import { monitor } from "@colyseus/monitor";
import { playground } from "@colyseus/playground";
import express from "express";
import { join } from "path";
import compression from "compression";
import * as trpcExpress from "@trpc/server/adapters/express";
import fileUpload from "express-fileupload";
/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";
import { createContext, extractUserFromRequest } from "./trpc/context";
import { handleAssetUpload } from "./trpc/assetRouter";

export default config({
  initializeGameServer: (gameServer) => {
    /**
     * Define your room handlers:
     */
    gameServer.define("my_room", MyRoom);
  },

  initializeExpress: (app) => {
    /**
     * Bind your custom express routes here:
     * Read more: https://expressjs.com/en/starter/basic-routing.html
     */
    if (process.env.NODE_ENV !== "production") {
      app.use("/playground", playground);
    } else {
      const clientBuildPath = join(__dirname, "..", "client", "dist");
      console.log("clientBuildPath", clientBuildPath);
      app.use("/", compression(), express.static(clientBuildPath));
      app.get("/auth/callback", (req, res) => {
        res.sendFile(join(clientBuildPath, "index.html"));
      });
    }

    app.use(
      "/trpc",
      trpcExpress.createExpressMiddleware({
        router: appRouter,
        createContext,
      })
    );

    app.post(
      "/createAsset",
      fileUpload({
        limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      }),
      async (req, res) => {
        console.log("uploading file");
        const user = await extractUserFromRequest(req);
        if (!user) {
          return res.status(401).send("Unauthorized");
        }
        await handleAssetUpload(user.user.id, req.files?.file as any, {
          name: req.body.assetName,
        });
        res.send("ok");
      }
    );

    /**
     * Use @colyseus/monitor
     * It is recommended to protect this route with a password
     * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
     */
    app.use("/colyseus", monitor());
  },

  beforeListen: () => {
    /**
     * Before before gameServer.listen() is called.
     */
  },
});
