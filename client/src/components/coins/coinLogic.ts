import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { useNetworkTick } from "../../lib/networking/hooks";

export function useCheckCollectCoins(playerX: number, playerY: number) {
  const coins = useColyseusState()?.coins;
  const room = useColyseusRoom();

  useNetworkTick(() => {
    if (!coins) return;
    for (const coin of coins) {
      const distance = Math.hypot(coin.x - playerX, coin.y - playerY);
      console.log(distance);
      if (distance < 90) {
        room?.send("collectCoin", { id: coin.id });
      }
    }
  });
}
