import { Container, Graphics, useTick } from "@pixi/react";
import { useColyseusState } from "../../colyseus";
import { useLerped, useLerpedVec2 } from "../../lib/useLerped";
import { useCallback } from "react";

export function Bullets() {
  const bullets = useColyseusState((state) => state.bullets);

  return (
    <Container>
      {Array.from(bullets.keys()).map((bulletId) => (
        <Bullet key={bulletId} id={bulletId} />
      ))}
    </Container>
  );
}

function Bullet({ id }: { id: string }) {
  const bullet = useColyseusState((state) => state.bullets.get(id));

  return <BulletGraphics {...useLerpedVec2(bullet.transform, 0.3)} />;
}

function BulletGraphics({ x, y }: { x: number; y: number }) {
  return (
    <Graphics
      x={x}
      y={y}
      draw={useCallback((g) => {
        g.beginFill(0x222);
        g.drawCircle(0, 0, 5);
        g.endFill();
      }, [])}
    />
  );
}
