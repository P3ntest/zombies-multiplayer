import { prisma } from "../prisma";
import { publicProcedure, router } from "./trpc";

export const statRouter = router({
  getLeaderboard: publicProcedure.query(async () => {
    const leaderboard = await prisma.playedGameParticipant.findMany({
      take: 10,
      orderBy: {
        score: "desc",
      },
    });
    return {
      leaderboard,
    };
  }),
});
