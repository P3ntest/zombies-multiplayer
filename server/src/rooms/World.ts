import { Schema, type } from "@colyseus/schema";
import { MyRoom } from "./MyRoom";
import { Body, Composite, Engine, Render } from "matter-js";

export class World {
  engine: Engine = Engine.create({
    gravity: {
      x: 0,
      y: 0,
    },
  });

  objects = new Set<PhysicsObject>();

  constructor(public room: MyRoom) {}

  public tick(delta: number) {
    for (const object of this.objects) object.preUpdate(delta);
    Engine.update(this.engine, delta);
    for (const object of this.objects)
      if (object instanceof NetworkedPhysicsObject) object.syncToState();
  }
}

export abstract class PhysicsObject {
  body: Body;
  isAttachedToWorld = false;

  constructor(public world: World) {}

  preUpdate(delta: number) {}

  onRemove() {
    this.removeFromWorld();
  }

  attachToWorld() {
    if (this.isAttachedToWorld) {
      return;
    }
    this.isAttachedToWorld = true;
    Composite.add(this.world.engine.world, this.body);
    this.world.objects.add(this);
  }
  removeFromWorld() {
    if (!this.isAttachedToWorld) {
      return;
    }
    this.isAttachedToWorld = false;
    Composite.remove(this.world.engine.world, this.body);
    this.world.objects.delete(this);
  }
}

export abstract class NetworkedPhysicsObject extends PhysicsObject {
  syncTransform = {
    position: true,
    velocity: true,
    rotation: true,
    angularVelocity: true,
  };

  state: NetworkedPhysicsObjectState;

  constructor(world: World) {
    super(world);
  }

  attachToWorld(): void {
    this.syncToState();
    super.attachToWorld();
  }

  syncToState() {
    if (this.syncTransform.position) {
      this.state.transform.x = this.body.position.x;
      this.state.transform.y = this.body.position.y;
    }
    if (this.syncTransform.velocity) {
      this.state.transform.velocityX = this.body.velocity.x;
      this.state.transform.velocityY = this.body.velocity.y;
    }
    if (this.syncTransform.rotation) {
      this.state.transform.rotation = this.body.angle;
    }
    if (this.syncTransform.angularVelocity) {
      this.state.transform.angularVelocity = this.body.angularVelocity;
    }
  }
}

export interface NetworkedPhysicsObjectState {
  transform: TransformState;
}

export class TransformState extends Schema {
  @type("float32") x: number = 0;
  @type("float32") y: number = 0;
  @type("float32") velocityX: number = 0;
  @type("float32") velocityY: number = 0;

  @type("float32") rotation: number = 0;
  @type("float32") angularVelocity: number = 0;
}
