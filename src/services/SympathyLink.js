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

    // Calculate similarity once at creation
    this.similarity = this._calculateSimilarity();

    // Visual-only state (safe for tweening)
    this.visual = {
      strength: 0, // fades in/out
      pulse: 0, // micro animation
    };

    // Animate link appearing
    timer.tween(this.visual, { strength: 1 }, 0.25, Easing.outCubic);
  }

  /* ------------------------------------------------------------------ */
  /*  LOGIC                                                             */
  /* ------------------------------------------------------------------ */

  update(player, dt) {
    if (!this.active) return;

    // Drain player concentration
    console.log(`dt ${dt}`)
    console.log(`Method:  ${this.getConcentrationDrainRate()}`)
    const drain = this.getConcentrationDrainRate() * dt;
    console.log("drain",drain)
    player.consumeConcentration(drain),drain;

    if (!player.canUseSympathy()) {
      this.break();
    }
  }

  break() {
    if (!this.active) return;

    this.active = false;

    // Animate link collapse
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
    // Worse matches drain faster
    console.log(`sim ${this.similarity}`)
    return SympathyLink.BASE_DRAIN * (1 / this.similarity);
  }

  _calculateSimilarity() {
    let score = 1;
    console.log(`score ${score}`)

    // Mass similarity
    const massDiff = Math.abs(this.objectA.mass - this.objectB.mass);
    score -= massDiff * 0.01;
    console.log(`score ${score}`)

    // Temperature similarity
    const tempDiff = Math.abs(this.objectA.temp - this.objectB.temp);
    score -= tempDiff * 0.005;
    console.log(`score ${score}`)

    // Size similarity
    // const sizeDiff = Math.abs(
    //   this.objectA.calculateSize() - this.objectB.calculateSize()
    // );
    // score -= sizeDiff * 0.0001;
    console.log(`score ${score}`)
    return Math.max(
      SympathyLink.LOWER_SIM_CLAMP,
      Math.min(score, SympathyLink.UPPER_SIM_CLAMP)
    );
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

    // Subtle pulse for juice
    const pulse = 1 + Math.sin(performance.now() * 0.008) * 0.15;

    ctx.save();

    ctx.globalAlpha = this.visual.strength;
    ctx.lineWidth = 2.5 * pulse * this.visual.strength;

    // Colour communicates link quality
    ctx.strokeStyle =
      this.similarity > 0.6
        ? "rgba(120, 200, 255, 0.9)" // strong / cold
        : this.similarity > 0.4
        ? "rgba(255, 200, 100, 0.9)" // unstable
        : "rgba(255, 100, 80, 0.9)"; // weak / stressed

    ctx.beginPath();
    ctx.moveTo(ax, ay);
    ctx.lineTo(bx, by);
    ctx.stroke();

    ctx.restore();
  }
}
