export class PhysicsTicker {
  running: boolean = false;
  tick: number = 0;
  lastTick: number = 0;

  constructor(private physicsUpdate: (delta: number) => void) {}

  start() {
    this.running = true;
    this.tick = 0;
    this.lastTick = Date.now();
    this.loop();
  }

  stop() {
    this.running = false;
  }

  loop() {
    if (!this.running) {
      return;
    }

    const now = Date.now();
    const delta = now - this.lastTick;
    this.lastTick = now;

    this.tick += delta;

    this.update(delta);

    requestAnimationFrame(() => this.loop());
  }

  beforeHandlers = new Set<() => void>();
  afterHandlers = new Set<() => void>();

  addBeforeHandler(handler: () => void) {
    this.beforeHandlers.add(handler);
  }

  removeBeforeHandler(handler: () => void) {
    this.beforeHandlers.delete(handler);
  }

  addAfterHandler(handler: () => void) {
    this.afterHandlers.add(handler);
  }

  removeAfterHandler(handler: () => void) {
    this.afterHandlers.delete(handler);
  }

  update(delta: number) {
    this.beforeHandlers.forEach((handler) => handler());
    this.physicsUpdate(delta);
    this.afterHandlers.forEach((handler) => handler());
  }
}
