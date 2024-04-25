import { useState } from "react";
import { useRoomMessageHandler } from "../../lib/networking/hooks";
import { ParticleContainer, Sprite, useTick } from "@pixi/react";
import { playSplat } from "../../lib/sound/sound";
import { Texture } from "pixi.js";

let currId = 0;

export function BloodManager() {
  const [blood, setBlood] = useState<
    {
      x: number;
      y: number;
      size: number;
      id: number;
    }[]
  >([]);

  useRoomMessageHandler("blood", (message) => {
    const { x, y, size, amount = 1 } = message;
    for (let i = 0; i < amount; i++)
      setBlood((blood) => [
        ...blood,
        {
          x,
          y,
          size,
          id: currId++,
        },
      ]);
    playSplat();
  });

  return (
    <ParticleContainer>
      {blood.map((b) => (
        <Blood
          key={b.id}
          x={b.x}
          y={b.y}
          size={b.size}
          onRemove={() => {
            setBlood((blood) => blood.filter((bb) => bb.id !== b.id));
          }}
        />
      ))}
      {/* <Blood x={100} y={100} size={10} onRemove={() => {}} /> */}
    </ParticleContainer>
  );
}

function Blood({
  x,
  y,
  size,
  onRemove,
}: {
  x: number;
  y: number;
  size: number;
  onRemove: () => void;
}) {
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0);
  const rotation = useState(Math.random() * Math.PI * 2)[0];

  if (opacity <= 0) {
    onRemove();
  }

  useTick((delta) => {
    setOpacity((o) => o - delta / 2000);
    setScale((s) => Math.min(1, s + delta / 8));
  }, true);

  return (
    <Sprite
      x={x}
      y={y}
      rotation={rotation}
      anchor={{
        x: 0.5,
        y: 0.5,
      }}
      alpha={opacity}
      texture={Texture.from("blood.png")}
      scale={scale * size * 0.1}
    />
  );
}
