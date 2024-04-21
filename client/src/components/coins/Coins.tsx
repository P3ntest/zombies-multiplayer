import { ParticleContainer, Sprite } from "@pixi/react";
import { useColyseusState } from "../../colyseus";
import { CoinState } from "../../../../server/src/rooms/schema/MyRoomState";

export function Coins() {
  const coins = useColyseusState((state) => state.coins);

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

function Coin({ coin }: { coin: CoinState }) {
  return (
    <Sprite
      x={coin.x}
      y={coin.y}
      image="assets/coin.png"
      anchor={[0.5, 0.5]}
      scale={[0.3, 0.3]}
    />
  );
}
