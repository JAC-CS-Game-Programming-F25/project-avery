import Entity from "../Entity.js";
import Vector from "../../../lib/Vector.js";
import CollisionDetector from "../../services/CollisionDetector.js";

export default class GameObject extends Entity {
  static SAFE_TEMP_MIN = -30;
  static SAFE_TEMP_MAX = 60;
  static STRESS_BUILD_RATE = 0.09;
  static STRESS_RECOVERY_RATE = 0.04;
  static BREAK_STRESS = 1.0;

  constructor({ x, y, map, width, height, type, mass, temp, sprite }) {
    super(x, y, width, height);

    // Important stuff
    this.map = map;
    this.type = type;

    // Sympathy stuff
    this.mass = Math.max(0.1, mass);
    this.velocity = new Vector(0, 0);
    this.forces = new Vector(0, 0);
    this.isStatic = false;
    this.isCollidable = true;
    this.wasOnGround = false;

    // Temp
    this.temp = temp ?? 20;
    this.stress = 0;
    this.isBroken = false;

    // Sprite
    this.sprite = sprite;

    this.collisionDetector = new CollisionDetector(map);

    // For respawn
    this.spawnPosition = new Vector(x, y);

    this.isSympathyCapable = false;
    this.isCollectable = false;
  }
  canParticipateInSympathy() {
    return false;
  }
  /* ============================================================
   * UPDATE
   * ============================================================ */
  update(dt) {
    if (this.isStatic || this.isBroken) return;

    const ax = this.forces.x / this.mass;
    const ay = this.forces.y / this.mass;

    this.velocity.x += ax * dt;
    this.velocity.y += ay * dt;

    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    this.forces.x = 0;
    this.forces.y = 0;

    if (this.isOnGround) {
      this.velocity.x *= 0.85;
      if (Math.abs(this.velocity.x) < 1) this.velocity.x = 0;
    }

    this.wasOnGround = this.isOnGround;
    console.log(this.temp)
    this.applyThermalStress(dt);
    this.checkBreak();
  }

  /* ============================================================
   * THERMAL / STRESS
   * ============================================================ */
  applyThermalStress(dt) {
    if (
      this.temp < GameObject.SAFE_TEMP_MIN ||
      this.temp > GameObject.SAFE_TEMP_MAX
    ) {
      this.stress += GameObject.STRESS_BUILD_RATE * dt;
    } else {
      this.stress -= GameObject.STRESS_RECOVERY_RATE * dt;
    }

    this.stress = Math.max(0, Math.min(this.stress, 1));
  }

  checkBreak() {
    if (!this.isBroken && this.stress >= GameObject.BREAK_STRESS) {
      this.breakObject();
    }
  }

  breakObject() {
    this.isBroken = true;
    this.isStatic = true;
    this.isCollidable = false;

    this.velocity.x = 0;
    this.velocity.y = 0;
    this.forces.x = 0;
    this.forces.y = 0;
  }

  /* ============================================================
   * RENDERING
   * ============================================================ */
  render(ctx) {
    if (!this.sprite || this.isBroken) return;

    const shake = this.getStressShake();

    ctx.save();
    this.sprite.render(
      ctx,
      Math.floor(this.position.x + shake.x),
      Math.floor(this.position.y + shake.y)
    );
    ctx.restore();
    if (this.isHighlighted || this.isSelected) {
      ctx.save();

      ctx.strokeStyle = this.isSelected ? "yellow" : "cyan";

      ctx.lineWidth = 2;
      ctx.strokeRect(
        this.hitboxX,
        this.hitboxY,
        this.hitboxWidth,
        this.hitboxHeight
      );

      ctx.restore();
    }
  }

  getStressShake() {
    if (this.stress < 0.6) return { x: 0, y: 0 };

    const intensity = this.stress * 1.5;
    return {
      x: (Math.random() - 0.5) * intensity,
      y: (Math.random() - 0.5) * intensity,
    };
  }

  /* ============================================================
   * PHYSICS HELPERS
   * ============================================================ */
  applyForce(force) {
    this.forces.x += force.x;
    this.forces.y += force.y;
  }

  calculateSize() {
    return (this.height * this.width) ?? 1;
  }

  resetToSpawn() {
    this.position.x = this.spawnPosition.x;
    this.position.y = this.spawnPosition.y;
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.forces.x = 0;
    this.forces.y = 0;
    this.temp = 20;
    this.stress = 0;
    this.isBroken = false;
  }
}
