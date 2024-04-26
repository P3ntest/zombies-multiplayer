import { z } from "zod";
import { prisma } from "../prisma";
import { authProcedure, publicProcedure, router } from "./trpc";
import { GameLevel } from "../game/mapEditor/editorTypes";

export type MapInfo = {
  id: string;
  level: GameLevel;
  name: string;
  verified: boolean;
  published: boolean;
};

export const mapRouter = router({
  loadMap: publicProcedure.input(z.string()).query(async ({ input }) => {
    const map = await prisma.map.findUnique({
      where: {
        id: input,
      },
    });
    return {
      level: GameLevel.parse(map.level),
      name: map.name,
      id: map.id,
      verified: map.verified,
      published: map.published,
    } satisfies MapInfo;
  }),
  verifyMap: authProcedure
    .input(
      z.object({
        mapId: z.string(),
        verify: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!ctx.user.scopePermissions.includes("verify:maps")) {
        return "Unauthorized";
      }
      const update = await prisma.map.update({
        where: {
          id: input.mapId,
        },
        data: {
          verified: input.verify,
        },
      });
      if (update) {
        return `Map ${update.name} has been ${
          update.verified ? "verified" : "unverified"
        }`;
      }
      return "Operation failed";
    }),
  myMaps: authProcedure.query(async ({ ctx }) => {
    const maps = await prisma.map.findMany({
      where: {
        authorId: ctx.user.id,
      },
    });
    return maps.map((map) => {
      return {
        id: map.id,
        level: GameLevel.parse(map.level),
        name: map.name,
        verified: map.verified,
        published: map.published,
      } satisfies MapInfo;
    });
  }),
  myMapOne: authProcedure.input(z.string()).query(async ({ input, ctx }) => {
    const map = await prisma.map.findFirst({
      where: {
        id: input,
        authorId: ctx.user.id,
      },
    });
    return {
      id: map.id,
      level: GameLevel.parse(map.level),
      name: map.name,
      verified: map.verified,
      published: map.published,
    } satisfies MapInfo;
  }),
  setPublishMap: authProcedure
    .input(
      z.object({
        mapId: z.string(),
        publish: z.boolean(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await prisma.map.update({
        where: {
          id: input.mapId,
          authorId: ctx.user.id,
        },
        data: {
          published: input.publish,
        },
      });
    }),
  overwriteMap: authProcedure
    .input(
      z.object({
        mapId: z.string(),
        level: GameLevel,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await prisma.map.update({
        where: {
          id: input.mapId,
          authorId: ctx.user.id,
        },
        data: {
          level: input.level,
        },
      });
    }),
  deleteMap: authProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      return await prisma.map.delete({
        where: {
          id: input,
          authorId: ctx.user.id,
        },
      });
    }),
  saveNewMap: authProcedure
    .input(
      z.object({
        name: z.string(),
        level: GameLevel,
      })
    )
    .mutation(async ({ input, ctx }) => {
      return await prisma.map.create({
        data: {
          level: input.level,
          name: input.name,
          author: {
            connect: {
              id: ctx.user.id,
            },
          },
        },
      });
    }),

  getMapsToPlay: publicProcedure.query(async ({ ctx }) => {
    const verifiedMaps = await prisma.map.findMany({
      where: {
        verified: true,
      },
    });
    const myMaps = ctx.user
      ? await prisma.map.findMany({
          where: {
            authorId: ctx.user.id,
            verified: false,
          },
        })
      : undefined;

    const communityMaps = await prisma.map.findMany({
      where: {
        published: true,
        authorId: {
          not: ctx.user?.id,
        },
      },
      orderBy: {
        plays: "desc",
      },
      take: 20,
    });

    return {
      verifiedMaps,
      myMaps,
      communityMaps,
    } as {
      verifiedMaps: MapInfo[];
      myMaps?: MapInfo[];
      communityMaps: MapInfo[];
    };
  }),
});
