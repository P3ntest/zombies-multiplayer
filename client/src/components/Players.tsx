import { useContext, useEffect } from "react";
import { PlayerState } from "../../../server/src/rooms/schema/MyRoomState";
import { useColyseusRoom, useColyseusState } from "../colyseus";
import { Sprite, useApp, useTick } from "@pixi/react";
import { stageContext } from "./stageContext";
import { useAxis } from "../lib/useControls";
import { useLerped, useLerpedRadian } from "../lib/useLerped";

export function Players() {
  const state = useColyseusState();
  const players = state?.players;

  if (!players) {
    console.log("no players");
    return null;
  }

  console.log("players", Array.from(players.values()));

  return (
    <>
      {Array.from(players.entries()).map(([id, player]) => (
        <Player key={id} player={player} />
      ))}
    </>
  );
}

function Player({ player }: { player: PlayerState }) {
  const sessionId = useColyseusRoom()?.sessionId;
  const isMe = player.sessionId === sessionId;

  const x = useLerped(player.x, 0.5);
  const y = useLerped(player.y, 0.5);
  const rotation = useLerpedRadian(player.rotation, 0.5);

  return (
    <>
      <Sprite
        image="/assets/Top_Down_Survivor/rifle/idle/survivor-idle_rifle_0.png"
        x={x}
        y={y}
        scale={{ x: 0.5, y: 0.5 }}
        anchor={{ x: 0.5, y: 0.5 }}
        rotation={rotation - 0.2}
      />
      {isMe && (
        <>
          <PlayerControls x={player.x} y={player.y} />
          <PlayerCamera x={x} y={y} />
        </>
      )}
    </>
  );
}

function PlayerCamera({ x, y }: { x: number; y: number }) {
  const stageRef = useContext(stageContext);
  const app = useApp();

  useEffect(() => {
    stageRef?.levelContainer?.pivot.set(x, y);
    stageRef?.levelContainer?.position.set(
      app.renderer.width / 4,
      app.renderer.height / 4
    );
  }, [x, y, stageRef, app.renderer.width, app.renderer.height]);

  return null;
}

function PlayerControls({ x, y }: { x: number; y: number }) {
  const room = useColyseusRoom();
  const app = useApp();
  const stageRef = useContext(stageContext);

  const axis = useAxis();

  const normalized = Math.sqrt(axis.x ** 2 + axis.y ** 2);
  if (normalized > 1) {
    axis.x /= normalized;
    axis.y /= normalized;
  }

  const speed = 10;
  const speedX = axis.x * speed;
  const speedY = axis.y * speed;

  const newX = x + speedX;
  const newY = y + speedY;

  useTick(() => {
    const { x: mouseX, y: mouseY } = app.renderer.events.pointer.global;
    const { x: stageX, y: stageY } = stageRef?.levelContainer?.toLocal({
      x: mouseX,
      y: mouseY,
    }) ?? { x: 0, y: 0 };

    // the player always looks at the mouse
    const rotation = Math.atan2(stageY - y, stageX - x);

    room?.send("move", {
      x: newX,
      y: newY,
      rotation,
    });
  });

  return <></>;
}
