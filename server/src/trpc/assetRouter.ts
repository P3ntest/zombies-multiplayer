import { z } from "zod";
import { prisma } from "../prisma";
import { authProcedure, publicProcedure, router } from "./trpc";
import axios from "axios";

const assetsClient = axios.create({
  baseURL: process.env.ASSETS_SERVICE_URL,
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.ASSETS_SERVICE_TOKEN}`,
  },
});

export const assetRouter = router({
  assetsEndpoint: publicProcedure.query(async () => {
    return process.env.ASSETS_SERVICE_URL;
  }),
  viewAssetLibrary: authProcedure
    .input(
      z
        .object({
          search: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      const assets = input.search
        ? await prisma.customAsset.findMany({
            where: {
              OR: [
                {
                  tags: {
                    hasSome: input.search.toLowerCase().split(" "),
                  },
                },
                {
                  name: {
                    contains: input.search,
                    mode: "insensitive",
                  },
                },
                {
                  description: {
                    contains: input.search,
                    mode: "insensitive",
                  },
                },
              ],
            },
          })
        : await prisma.customAsset.findMany();

      return assets.map((asset) => ({
        id: asset.id,
        uploadId: asset.uploadId,
        name: asset.name,
        tags: asset.tags,
      }));
    }),
  uploadAssetFromUrl: authProcedure
    .input(
      z.object({
        externalUrl: z.string().optional(),
        name: z.string(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // assetsClient has two POST endpoints: /upload and /from-url

      if (!input.externalUrl) {
        return "No file provided";
      }

      console.log("Generating Asset from ", input.externalUrl);
      const response = await assetsClient.post("/from-url", {
        url: input.externalUrl,
      });
      console.log("Generated Asset", response.data.id);

      const uploadId = response.data.id;
      const customAsset = await prisma.customAsset.create({
        data: {
          uploadId,
          name: input.name,
          uploadedById: ctx.user.id,
        },
      });
      return uploadId.id;
    }),
});
