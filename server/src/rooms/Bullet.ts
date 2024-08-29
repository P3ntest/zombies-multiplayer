import { Bodies, Body, Vector } from "matter-js";
import { NetworkedPhysicsObject, TransformState, World } from "./World";
import { Schema, type } from "@colyseus/schema";
import { genId } from "../util";

export class BulletState extends Schema {
  @type("string") id: string = genId();
  @type(TransformState) transform = new TransformState();
}

export class Bullet extends NetworkedPhysicsObject {
  state: BulletState = new BulletState();

  constructor(world: World, private origin: Vector, private velocity: Vector) {
    super(world);

    this.body = Bodies.circle(this.origin.x, this.origin.y, 5, {
      isSensor: true,
    });
    this.attachToWorld();

    // this.syncTransform.angularVelocity = false;
    // this.syncTransform.velocity = false;
    // this.syncTransform.rotation = false;

    this.world.room.state.bullets.set(this.state.id, this.state);
  }

  lifeTime = 0;
  preUpdate(): void {
    this.lifeTime++;
    if (this.lifeTime > 100) this.onRemove();
    else Body.setVelocity(this.body, this.velocity);
  }

  onRemove(): void {
    super.onRemove();
    this.world.room.state.bullets.delete(this.state.id);
  }
}
