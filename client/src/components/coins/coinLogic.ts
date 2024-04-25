import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { useNetworkTick } from "../../lib/networking/hooks";
import { playCoinPickup } from "../../lib/sound/sound";

export const collectedCoinsBatch = new Set<number>();

export function useCheckCollectCoins(playerX: number, playerY: number) {
  const coins = useColyseusState()?.coins;

  useNetworkTick(() => {
    if (!coins) return;
    for (const coin of coins) {
      const distance = Math.hypot(coin.x - playerX, coin.y - playerY);
      if (distance < 90) {
        collectedCoinsBatch.add(coin.id);

        playCoinPickup();
      }
    }
  });
}
