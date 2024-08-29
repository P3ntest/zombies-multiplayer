import { Bodies, Body, Vector } from "matter-js";
import {
  NetworkedPhysicsObject,
  NetworkedPhysicsObjectState,
  TransformState,
  World,
} from "./World";
import { Schema, type } from "@colyseus/schema";
import { Client } from "colyseus";
import { Bullet } from "./Bullet";
import { Vehicle } from "./Vehicle";

export type PlayerUpdatePacket = {
  x: number;
  y: number;
  rotation: number;
  isShooting: boolean;
};

export class PlayerState extends Schema implements NetworkedPhysicsObjectState {
  @type("string") name: string = "Unnamed";
  @type("string") sessionId: string = "";

  @type(TransformState) transform = new TransformState();

  @type("boolean") connected: boolean = true;

  @type("uint32") health: number = 100;

  @type("uint8") currentAnimation = 0;

  @type("string") mountedVehicleId: string = "";
}

export function playerCollider() {
  return Bodies.circle(0, 0, 30);
}

export class Player extends NetworkedPhysicsObject {
  state: PlayerState = new PlayerState();

  constructor(world: World, private client: Client) {
    super(world);

    this.body = playerCollider();
    this.attachToWorld();

    this.syncTransform.angularVelocity = false;

    this.state.sessionId = client.sessionId;

    world.room.state.players.set(client.sessionId, this.state);
  }

  onRemove() {
    super.onRemove();
    this.world.room.state.players.delete(this.client.sessionId);
  }

  currentDirection: Vector = Vector.create();
  currentRotation: number = 0;

  preUpdate(): void {
    if (this.mountedVehicle) {
      Body.setPosition(this.body, {
        x: this.mountedVehicle.state.transform.x,
        y: this.mountedVehicle.state.transform.y,
      });
      return;
    }

    Body.setAngle(this.body, this.currentRotation);
    Body.setAngularSpeed(this.body, 0);

    const targetVelocity = Vector.mult(this.currentDirection, 1.5);
    const delta = Vector.sub(targetVelocity, this.body.velocity);
    const force = Vector.mult(delta, 0.01);
    Body.applyForce(this.body, this.body.position, force);
    this.shootCoolDown--;
  }

  shootCoolDown = 0;

  mountedVehicle: Vehicle | null = null;
  mountedFrom: Vector | null = null;
  mountVehicle(vehicle: Vehicle) {
    if (this.mountedVehicle) this.unmountVehicle();
    this.mountedVehicle = vehicle;
    this.state.mountedVehicleId = vehicle.state.id;
    vehicle.state.passengers.push(this.state.sessionId);

    (this.mountedFrom = Vector.sub(this.body.position, vehicle.body.position)),
      (this.body.isSensor = true);
  }
  unmountVehicle() {
    if (!this.mountedVehicle) return;
    this.mountedVehicle.state.passengers =
      this.mountedVehicle.state.passengers.filter(
        (id) => id !== this.state.sessionId
      );

    Body.setPosition(
      this.body,
      Vector.add(this.mountedFrom, this.mountedVehicle.body.position)
    );

    this.mountedVehicle = null;
    this.state.mountedVehicleId = "";
    this.body.isSensor = false;

    this.syncToState();
  }

  onUpdatePacket(packet: PlayerUpdatePacket) {
    if (this.mountedVehicle) {
      this.mountedVehicle.onUpdatePacket(packet);

      this.currentDirection.x = 0;
      this.currentDirection.y = 0;

      return;
    }

    const { x, y, rotation, isShooting } = packet;

    this.currentDirection.x = x;
    this.currentDirection.y = y;
    // this.currentDirection = Vector.normalise(this.currentDirection);

    this.currentRotation = rotation;

    if (isShooting && this.shootCoolDown <= 0) {
      this.shootCoolDown = 20;

      new Bullet(
        this.world,
        Vector.clone(this.body.position),
        Vector.add(
          Vector.rotate(Vector.create(30, 0), rotation),
          this.body.velocity
        )
      );
    }
  }

  onMessage(type: string | number, message: any) {
    if (type === "update") this.onUpdatePacket(message);
    else if (type === "mountVehicle") {
      const vehicle = Vehicle.instances.get(message.id);
      if (vehicle) this.mountVehicle(vehicle);
    } else if (type === "unmountVehicle") {
      this.unmountVehicle();
    }
  }
}
