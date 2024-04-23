import { Container, Stage, TilingSprite, useTick } from "@pixi/react";
import React, { useEffect, useState } from "react";
import { PlayerSprite } from "../player/PlayerSprite";
import { PlayerClass } from "../../../../server/src/game/player";
const PREVIEW_SIZE = 250;

export function CharacterPreview({
  name,
  selectedClass,
}: {
  name: string;
  selectedClass: PlayerClass;
}) {
  const [rotation, setRotation] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((r) => r + 0.0005);
    }, 1000 / 60);
    return () => clearInterval(interval);
  }, []);

  return (
    <Stage
      width={PREVIEW_SIZE}
      height={PREVIEW_SIZE}
      options={{
        backgroundAlpha: 1,
      }}
    >
      <Container
        x={PREVIEW_SIZE / 2}
        y={PREVIEW_SIZE / 2}
        scale={PREVIEW_SIZE / 250}
        rotation={0}
      >
        <Floor />
        <PlayerSprite
          name={name}
          playerClass={selectedClass}
          x={0}
          y={0}
          rotation={0 * rotation}
          velocityX={10}
          velocityY={10}
          health={100}
        />
      </Container>
    </Stage>
  );
}

function Floor() {
  const [floorX, setFloorX] = useState(0);
  useTick((delta) => {
    setFloorX((x) => (x - 1.8 * delta) % (PREVIEW_SIZE * 100));
  });

  return (
    <TilingSprite
      tilePosition={{ x: 0, y: 0 }}
      image="assets/sand.jpg"
      x={floorX - PREVIEW_SIZE / 2}
      y={-PREVIEW_SIZE / 2}
      tileScale={{
        x: 0.5,
        y: 0.5,
      }}
      width={PREVIEW_SIZE * 100}
      height={PREVIEW_SIZE}
    />
  );
}
