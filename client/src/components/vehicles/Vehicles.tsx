import { Container, Sprite, useTick } from "@pixi/react";
import { useColyseusRoom, useColyseusState } from "../../colyseus";
import {
  vehicleCollider,
  VehicleState,
} from "../../../../server/src/rooms/Vehicle";
import { Texture } from "pixi.js";
import { useUpdate } from "../util/useUpdate";
import { useLerpedRadian, useLerpedVec2 } from "../../lib/useLerped";
import { useHoveringVehicle } from "./hoveringVehicleStore";
import { useEffect } from "react";
import { PlayerCamera } from "../player/PlayerSelf";
import { useBodyRef } from "../../lib/physics/hooks";
import { useSyncSchemaToBody } from "../../lib/physics/utils";

export function Vehicles() {
  const vehicles = useColyseusState((state) => state.vehicles);
  const room = useColyseusRoom();

  useEffect(() => {
    const onKeydown = (e: KeyboardEvent) => {
      // if e pressed
      if (e.key === "e") {
        const vehicle = useHoveringVehicle.getState().hoveringVehicle;
        if (!vehicle) {
          return;
        }
        room.send("mountVehicle", {
          id: useHoveringVehicle.getState().hoveringVehicle,
        });
      } else if (e.key === "Shift") {
        room.send("unmountVehicle", {
          id: useHoveringVehicle.getState().hoveringVehicle,
        });
      }
    };
    window.addEventListener("keydown", onKeydown);
    return () => {
      window.removeEventListener("keydown", onKeydown);
    };
  }, [room]);

  return (
    <Container>
      {Array.from(vehicles.values()).map((vehicle) => (
        <Vehicle key={vehicle.id} vehicle={vehicle} />
      ))}
    </Container>
  );
}

function Vehicle({ vehicle }: { vehicle: VehicleState }) {
  const position = useLerpedVec2(vehicle.transform, 0.2);
  const rotation = useLerpedRadian(vehicle.transform.rotation, 0.5);
  const update = useUpdate();
  const room = useColyseusRoom();
  const amIInVehicle = vehicle.passengers.includes(room.sessionId);
  const body = useBodyRef(vehicleCollider);
  useSyncSchemaToBody(vehicle.transform, body);

  useTick(update);

  const gunRotation = useLerpedRadian(vehicle.gunRotation, 0.5);

  return (
    <>
      {amIInVehicle && <PlayerCamera {...position} zoom={0.2} />}
      <VehicleGraphics
        id={vehicle.id}
        {...position}
        rotation={rotation}
        gunRotation={gunRotation}
      />
    </>
  );
}

function VehicleGraphics({
  x,
  y,
  rotation,
  gunRotation,
  id,
}: {
  x: number;
  y: number;
  rotation: number;
  gunRotation: number;
  id: string;
}) {
  const setHoveringVehicle = useHoveringVehicle(
    (state) => state.setHoveringVehicle
  );

  return (
    <Container
      x={x}
      y={y}
      scale={2 * 1.5}
      rotation={rotation - Math.PI / 2}
      onmouseenter={() => {
        setHoveringVehicle(id);
      }}
      onmouseleave={() => {
        setHoveringVehicle(null);
      }}
      anchor={[0.5, 0.5]}
    >
      <Sprite
        anchor={[0.5, 0.5]}
        texture={Texture.from("vehicles/kv2_body.png")}
      />
      <Sprite
        texture={Texture.from("vehicles/kv2_gun.png")}
        anchor={[0.5, 0.5]}
        rotation={gunRotation}
      />
    </Container>
  );
}
