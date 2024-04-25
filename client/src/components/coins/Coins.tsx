import { ParticleContainer, Sprite } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { CoinState } from "../../../../server/src/rooms/schema/MyRoomState";
import { memo } from "react";
import { Texture } from "pixi.js";
import { useNetworkTick } from "../../lib/networking/hooks";
import { collectedCoinsBatch } from "./coinLogic";

export function Coins() {
  const coins = useColyseusState((state) => state.coins);
  const room = useColyseusRoom();

  useNetworkTick(() => {
    if (collectedCoinsBatch.size > 0) {
      room?.send("collectCoinBatch", Array.from(collectedCoinsBatch));
      collectedCoinsBatch.clear();
    }
  });

  if (!coins) {
    return null;
  }

  return (
    <ParticleContainer>
      {Array.from(coins.entries()).map(([id, coin]) => (
        <Coin key={id} coin={coin} />
      ))}
    </ParticleContainer>
  );
}

const tint = {
  1: 0xcd7f32,
  10: 0xc0c0c0,
  100: 0xffd700,
  1000: 0x00ff00,
  10000: 0xff0000,
  100000: 0x0000ff,
};
function _Coin({ coin }: { coin: CoinState }) {
  const scale = 0.3;
  return (
    <Sprite
      x={coin.x}
      y={coin.y}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      tint={(tint as any)[coin.value] ?? 0xffffff}
      image="assets/coin.png"
      // texture={Texture.from("assets/coin.png")}
      anchor={[0.5, 0.5]}
      scale={[scale, scale]}
    />
  );
}

const Coin = memo(_Coin);
