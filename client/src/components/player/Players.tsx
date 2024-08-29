import { useColyseusRoom, useColyseusState } from "../../colyseus";
import { Container, Sprite, useTick } from "@pixi/react";
import { useLerped, useLerpedRadian, useLerpedVec2 } from "../../lib/useLerped";
import { PlayerSprite } from "./PlayerSprite";
import { PlayerSelf } from "./PlayerSelf";
import Matter, { Body } from "matter-js";
import { useBeforePhysicsUpdate, useBodyRef } from "../../lib/physics/hooks";

import { useCallback, useState } from "react";
import { Texture } from "pixi.js";
import { getMaxHealth } from "../../../../server/src/game/player";
import {
  playerCollider,
  PlayerState,
} from "../../../../server/src/rooms/Player";
import { useSyncSchemaToBody } from "../../lib/physics/utils";

export function Players() {
  const state = useColyseusState();
  const players = state?.players;

  if (!players) {
    return null;
  }

  return (
    <Container>
      {Array.from(players.entries()).map(([id, player]) => (
        <Player key={id} player={player} />
      ))}
    </Container>
  );
}

function Player({ player }: { player: PlayerState }) {
  const sessionId = useColyseusRoom()?.sessionId;
  const isMe = player.sessionId === sessionId;

  if (isMe) {
    return <PlayerSelf player={player} />;
    // return player.healthState == PlayerHealthState.ALIVE ? (
    //   <PlayerSelf player={player} />
    // ) : (
    //   <>
    //     <SpectateControls x={player.x} y={player.y} />
    //     {PlayerHealthState.DEAD && <PlayerGrave x={player.x} y={player.y} />}
    //   </>
    // );
  } else {
    return <OtherAlivePlayer player={player} />;
  }
}

function OtherAlivePlayer({ player }: { player: PlayerState }) {
  const body = useBodyRef(playerCollider);
  const position = useLerpedVec2(body.current.position, 0.2);
  const rotation = useLerpedRadian(player.transform.rotation, 0.5);

  useSyncSchemaToBody(player.transform, body);

  return (
    <PlayerSprite
      currentAnimation={player.currentAnimation}
      name={player.name}
      playerClass={"shotgun"}
      x={position.x}
      y={position.y}
      rotation={rotation}
      health={player.health}
      maxHealth={100}
      velocityX={player.transform.velocityX}
      velocityY={player.transform.velocityY}
    />
  );
}
