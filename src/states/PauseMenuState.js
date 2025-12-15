import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { canvas, input, timer } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";
import FontName from "../enums/FontName.js";
import Easing from "../../lib/Easing.js";

export default class PauseMenuState extends State {
  constructor() {
    super();
    this.playState = null;

    this.options = ["Resume", "Restart Level", "Main Menu"];
    this.selectedIndex = 0;

    this.fade = { a: 0 };
    this.pulse = 0;
  }

  enter(params) {
    this.playState = params.playState;
    this.selectedIndex = 0;
    this.pulse = 0;

    this.fade.a = 0;
    timer.tween(this.fade, { a: 1 }, 0.22, Easing.outCubic);
  }

  exit() {}

  update(dt) {
    timer.update(dt);
    this.pulse += dt;

    if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
      this.resume();
      return;
    }

    if (input.isKeyPressed(Input.KEYS.ARROW_UP)) {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.options.length) % this.options.length;
    }

    if (input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
    }

    if (input.isKeyPressed(Input.KEYS.ENTER)) {
      this.confirmSelection();
    }
  }

  render(context) {
    if (!this.playState) return;

    this.playState.render(context);

    context.save();
    context.globalAlpha = 0.62 * this.fade.a;
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();

    this.renderMenu(context);
  }

  renderMenu(ctx) {
    const w = 380;
    const h = 250;
    const x = (canvas.width - w) / 2;
    const y = (canvas.height - h) / 2;

    ctx.save();
    ctx.globalAlpha = this.fade.a;

    this.#panel(ctx, x, y, w, h, 12);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `36px ${FontName.Medieval}`;
    ctx.fillStyle = "#ffd77a";
    ctx.shadowColor = "rgba(255, 210, 120, 0.45)";
    ctx.shadowBlur = 18;
    ctx.fillText("Paused", x + w / 2, y + 52);

    ctx.shadowBlur = 0;
    ctx.font = `18px ${FontName.Medieval}`;
    ctx.fillStyle = "rgba(240, 230, 210, 0.65)";
    ctx.fillText("Enter to select • Esc to resume", x + w / 2, y + 86);

    ctx.font = `22px ${FontName.Medieval}`;

    for (let i = 0; i < this.options.length; i++) {
      const isSel = i === this.selectedIndex;
      const yy = y + 132 + i * 38;

      if (isSel) {
        const a = 0.30 + 0.18 * (0.5 + 0.5 * Math.sin(this.pulse * 6));
        const hg = ctx.createLinearGradient(x + 24, 0, x + w - 24, 0);
        hg.addColorStop(0, "rgba(0,0,0,0)");
        hg.addColorStop(0.5, `rgba(255, 210, 120, ${a})`);
        hg.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = hg;
        ctx.fillRect(x + 24, yy - 16, w - 48, 32);
      }

      ctx.fillStyle = isSel ? "#ffd77a" : "rgba(240, 230, 210, 0.55)";
      ctx.shadowColor = isSel ? "rgba(120, 170, 255, 0.22)" : "transparent";
      ctx.shadowBlur = isSel ? 14 : 0;

      const prefix = isSel ? "✦ " : "  ";
      const suffix = isSel ? " ✦" : "";
      ctx.fillText(`${prefix}${this.options[i]}${suffix}`, x + w / 2, yy);
    }

    ctx.restore();
  }

  confirmSelection() {
    switch (this.selectedIndex) {
      case 0:
        this.resume();
        break;
      case 1:
        this.restartLevel();
        break;
      case 2:
        this.quitToMenu();
        break;
    }
  }

  resume() {
    timer.tween(this.fade, { a: 0 }, 0.18, Easing.inCubic, () => {
      this.stateMachine.change(GameStateName.Play);
    });
  }

  restartLevel() {
    const index = this.playState.currentLevelIndex;
    timer.tween(this.fade, { a: 0 }, 0.18, Easing.inCubic, () => {
      this.playState.loadLevelByIndex(index);
      this.stateMachine.change(GameStateName.Play);
    });
  }

  quitToMenu() {
    timer.tween(this.fade, { a: 0 }, 0.18, Easing.inCubic, () => {
      this.stateMachine.change(GameStateName.MainMenu);
    });
  }

  #panel(ctx, x, y, w, h, r) {
    const bg = ctx.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, "rgba(18, 24, 44, 0.94)");
    bg.addColorStop(1, "rgba(10, 12, 22, 0.97)");
    ctx.fillStyle = bg;

    this.#roundRect(ctx, x, y, w, h, r);
    ctx.fill();

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(255, 210, 120, 0.40)";
    ctx.shadowColor = "rgba(120, 170, 255, 0.20)";
    ctx.shadowBlur = 22;
    ctx.stroke();

    ctx.shadowBlur = 0;
  }

  #roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }
}
