import { useContext, useEffect } from "react";
import { PlayerState } from "../../../server/src/rooms/schema/MyRoomState";
import { useColyseusRoom, useColyseusState } from "../colyseus";
import { Sprite, useApp, useTick } from "@pixi/react";
import { stageContext } from "./stageContext";
import { useAxis } from "../lib/useControls";
import { useLerped, useLerpedRadian } from "../lib/useLerped";
import { PlayerSprite } from "./PlayerSprite";
import { PlayerSelf } from "./PlayerSelf";
import Matter, { Body } from "matter-js";
import { useBodyRef } from "../lib/physics/hooks";

export function Players() {
  const state = useColyseusState();
  const players = state?.players;

  if (!players) {
    return null;
  }

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

  if (isMe) {
    return <PlayerSelf player={player} />;
  } else {
    return <OtherPlayer player={player} />;
  }
}

function OtherPlayer({ player }: { player: PlayerState }) {
  const x = useLerped(player.x, 0.5);
  const y = useLerped(player.y, 0.5);
  const rotation = useLerpedRadian(player.rotation, 0.5);
  const collider = useBodyRef(() => {
    return Matter.Bodies.circle(player.x, player.y, 40);
  });
  useTick(() => {
    Body.setPosition(collider.current, {
      x,
      y,
    });
  });

  return <PlayerSprite x={x} y={y} rotation={rotation} />;
}
