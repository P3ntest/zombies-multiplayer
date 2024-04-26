import { z } from "zod";
import { prisma } from "../prisma";
import { authProcedure, publicProcedure, router } from "./trpc";
import { GameLevel } from "../game/mapEditor/editorTypes";

export const mapRouter = router({
  loadMap: publicProcedure
    .input(z.string())
    // .output(
    //   z.object({
    //     level: GameLevel,
    //     name: z.string(),
    //     id: z.string(),
    //   })
    // )
    .query(async ({ input }) => {
      const map = await prisma.map.findUnique({
        where: {
          id: input,
        },
      });
      return {
        level: GameLevel.parse(map.level),
        name: map.name,
        id: map.id,
      };
    }),
  myMaps: authProcedure.query(async ({ ctx }) => {
    return await prisma.map.findMany({
      where: {
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
});
