import { Bodies, Body, Vector } from "matter-js";
import {
  NetworkedPhysicsObject,
  NetworkedPhysicsObjectState,
  TransformState,
  World,
} from "./World";
import { Schema, type, ArraySchema } from "@colyseus/schema";

import { genId } from "../util";

export class VehicleState
  extends Schema
  implements NetworkedPhysicsObjectState
{
  @type("string") id: string = genId();

  @type(TransformState) transform = new TransformState();

  @type("float32") gunRotation = 0;

  @type({
    array: "string",
  })
  passengers = new ArraySchema<string>();
}

export function vehicleCollider() {
  return Bodies.rectangle(0, 0, 550 * 1.5, 250 * 1.5, {
    density: 0.01,
  });
}

export class Vehicle extends NetworkedPhysicsObject {
  state: VehicleState = new VehicleState();

  static instances = new Map<string, Vehicle>();

  constructor(world: World) {
    super(world);

    this.body = vehicleCollider();
    this.attachToWorld();

    this.world.room.state.vehicles.set(this.state.id, this.state);
    Vehicle.instances.set(this.state.id, this);
  }

  onRemove() {
    super.onRemove();
    this.world.room.state.vehicles.delete(this.state.id);
    Vehicle.instances.delete(this.state.id);
  }

  currentDirection: Vector = Vector.create();
  targetGunRotation: number = 0;

  preUpdate(delta: number): void {
    if (this.state.passengers.length === 0) {
      this.currentDirection.x = 0;
      this.currentDirection.y = 0;
      return;
    }
    // gun rotation
    const targetRunRotation = this.targetGunRotation;
    const currentRunRotation = this.state.gunRotation;
    const GUN_ROTATION_SPEED = 0.003;
    const rawDiff = targetRunRotation - currentRunRotation;
    const diff = Math.atan2(Math.sin(rawDiff), Math.cos(rawDiff));
    this.state.gunRotation +=
      Math.min(Math.abs(diff), GUN_ROTATION_SPEED * delta) * Math.sign(diff);

    // moving the vehicle
    const forward = Vector.dot(
      this.currentDirection,
      Vector.create(Math.cos(this.body.angle), Math.sin(this.body.angle))
    );
    const targetVelocity = Vector.mult(
      Vector.create(Math.cos(this.body.angle), Math.sin(this.body.angle)),
      25 * forward
    );
    const velocityDelta = Vector.sub(targetVelocity, this.body.velocity);
    const maxAcceleration = 1;
    const forceMagnitude = Math.min(
      Vector.magnitude(velocityDelta),
      maxAcceleration
    );
    const force = Vector.mult(Vector.normalise(velocityDelta), forceMagnitude);
    Body.applyForce(this.body, this.body.position, force);

    if (Vector.magnitude(this.currentDirection) > 0.1) {
      const targetRotation = Math.atan2(
        this.currentDirection.y,
        this.currentDirection.x
      );
      const currentRotation = this.body.angle;
      const rawDiffRotation = targetRotation - currentRotation;
      const diffRotation = Math.atan2(
        Math.sin(rawDiffRotation),
        Math.cos(rawDiffRotation)
      );
      const ROTATION_SPEED = 0.001;
      Body.setAngle(
        this.body,
        currentRotation +
          Math.min(Math.abs(diffRotation), ROTATION_SPEED * delta) *
            Math.sign(diffRotation)
      );
    }
  }

  onUpdatePacket({
    x,
    y,
    rotation,
    isShooting,
  }: {
    x: number;
    y: number;
    rotation: number;
    isShooting: boolean;
  }) {
    this.currentDirection.x = x;
    this.currentDirection.y = y;
    this.currentDirection = Vector.normalise(this.currentDirection);

    const targetRunRotation = rotation - this.body.angle;
    this.targetGunRotation = targetRunRotation;
  }
}
