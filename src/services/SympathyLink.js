// SympathyLink.js
import Vector from "../../lib/Vector.js";
import { timer } from "../globals.js";
import Easing from "../../lib/Easing.js";

export default class SympathyLink {
  static BASE_DRAIN = 5;
  static LOWER_SIM_CLAMP = 0.2;
  static UPPER_SIM_CLAMP = 0.95;

  constructor(objectA, objectB) {
    this.objectA = objectA;
    this.objectB = objectB;

    this.active = true;

    this.similarity = this._calculateSimilarity();

    this.visual = {
      strength: 0, 
      pulse: 0,
    };

    timer.tween(this.visual, { strength: 1 }, 0.25, Easing.outCubic);
  }

  /* ------------------------------------------------------------------ */
  /*  LOGIC                                                             */
  /* ------------------------------------------------------------------ */

  update(player, dt) {
    if (!this.active) return;

    // Drain player concentration
    const drain = this.getConcentrationDrainRate() * dt;
    player.consumeConcentration(drain), drain;

    if (!player.canUseSympathy()) {
      this.break();
    }
  }

  break() {
    if (!this.active) return;

    this.active = false;

    timer.tween(this.visual, { strength: 0 }, 0.15, Easing.inCubic);
  }

  /* ------------------------------------------------------------------ */
  /*  TRANSFERS                                                         */
  /* ------------------------------------------------------------------ */

  transferHeat(source, deltaTemp) {
    if (!this.active) return;

    const target = source === this.objectA ? this.objectB : this.objectA;

    target.temp += deltaTemp * this.similarity;
  }

  transferForce(fromObj, force) {
    if (!this.active) return;

    const toObj = fromObj === this.objectA ? this.objectB : this.objectA;

    if (!toObj) return;

    const scaled = new Vector(
      force.x * this.similarity,
      force.y * this.similarity
    );

    toObj.applyForce(scaled, this);
  }

  /* ------------------------------------------------------------------ */
  /*  METRICS                                                           */
  /* ------------------------------------------------------------------ */

  getEfficiency() {
    return this.similarity;
  }

  getConcentrationDrainRate() {
    console.log(`sim ${this.similarity}`);
    return SympathyLink.BASE_DRAIN * (1 / this.similarity);
  }

  _calculateSimilarity() {
    const clamp01 = (v) => Math.max(0, Math.min(1, v));

    const massA = Math.max(0.001, this.objectA.mass);
    const massB = Math.max(0.001, this.objectB.mass);

    const massRatio = Math.min(massA, massB) / Math.max(massA, massB);
    const massScore = clamp01(massRatio);

    const tempA = this.objectA.temp ?? 20;
    const tempB = this.objectB.temp ?? 20;

    const tempDiff = Math.abs(tempA - tempB);
    const MAX_TEMP_DIFF = 60;

    const tempScore = clamp01(1 - tempDiff / MAX_TEMP_DIFF);

    const sizeA = Math.max(
      1,
      this.objectA.dimensions.x * this.objectA.dimensions.y
    );
    const sizeB = Math.max(
      1,
      this.objectB.dimensions.x * this.objectB.dimensions.y
    );

    const sizeRatio = Math.min(sizeA, sizeB) / Math.max(sizeA, sizeB);
    const sizeScore = clamp01(sizeRatio);

    const WEIGHTS = {
      mass: 0.5,
      temp: 0.35,
      size: 0.15,
    };

    let similarity =
      massScore * WEIGHTS.mass +
      tempScore * WEIGHTS.temp +
      sizeScore * WEIGHTS.size;

    similarity = Math.max(
      SympathyLink.LOWER_SIM_CLAMP,
      Math.min(similarity, SympathyLink.UPPER_SIM_CLAMP)
    );

    return similarity;
  }

  /* ------------------------------------------------------------------ */
  /*  RENDER                                                            */
  /* ------------------------------------------------------------------ */

  render(ctx) {
    if (!this.active && this.visual.strength <= 0.01) return;

    const a = this.objectA;
    const b = this.objectB;

    const ax = a.position.x + a.dimensions.x / 2;
    const ay = a.position.y + a.dimensions.y / 2;
    const bx = b.position.x + b.dimensions.x / 2;
    const by = b.position.y + b.dimensions.y / 2;

    const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.15;

    ctx.save();

    ctx.globalAlpha = this.visual.strength;
    ctx.lineWidth = 2.5 * pulse * this.visual.strength;

    ctx.strokeStyle =
      this.similarity > 0.6
        ? "rgba(120, 200, 255, 0.9)" 
        : this.similarity > 0.4
        ? "rgba(255, 200, 100, 0.9)" 
        : "rgba(255, 100, 80, 0.9)"; 

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.restore();
  }
}
