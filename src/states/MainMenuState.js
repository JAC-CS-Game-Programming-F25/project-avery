import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { canvas, context, input, timer, sounds } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";
import MusicName from "../enums/MusicName.js";
import FontName from "../enums/FontName.js";
import Easing from "../../lib/Easing.js";

export default class MainMenuState extends State {
  constructor() {
    super();
    this.options = ["Start Game", "Quit"];
    this.selectedIndex = 0;

    this.fade = { a: 0 };
    this.pulse = 0;
    this.titleWisp = 0;
  }

  enter() {
    super.enter?.();
    this.selectedIndex = 0;
    this.pulse = 0;
    this.titleWisp = 0;

    sounds.play(MusicName.Intro);

    this.fade.a = 0;
    timer.tween(this.fade, { a: 1 }, 0.35, Easing.outCubic);
  }

  exit() {}

  update(dt) {
    timer.update(dt);
    this.pulse += dt;
    this.titleWisp += dt;

    if (input.isKeyPressed(Input.KEYS.ARROW_UP)) {
      this.selectedIndex =
        (this.selectedIndex - 1 + this.options.length) % this.options.length;
    }

    if (input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
      this.selectedIndex = (this.selectedIndex + 1) % this.options.length;
    }

    if (input.isKeyPressed(Input.KEYS.ENTER)) {
      this.confirm();
    }
  }

  confirm() {
    const choice = this.options[this.selectedIndex];

    if (choice === "Start Game") {
      timer.tween(this.fade, { a: 0 }, 0.2, Easing.inCubic, () => {
        this.stateMachine.change(GameStateName.Play);
      });
    }

    if (choice === "Quit") {
      window.close?.();
    }
  }

  render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    const w = canvas.width;
    const h = canvas.height;

    context.save();
    context.globalAlpha = this.fade.a;

    this.#drawBackground(w, h);
    this.#drawTitle(w, h);
    this.#drawMenu(w, h);

    context.restore();
  }

  #drawBackground(w, h) {
    const g = context.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, "#0b1020");
    g.addColorStop(1, "#121a2f");
    context.fillStyle = g;
    context.fillRect(0, 0, w, h);

    context.save();
    context.globalAlpha = 0.08;
    context.fillStyle = "#89a7ff";
    for (let i = 0; i < 12; i++) {
      const t = this.titleWisp * 0.6 + i * 0.7;
      const x = (w * 0.12) + ((Math.sin(t) + 1) * 0.5) * (w * 0.76);
      const y = (h * 0.18) + ((Math.cos(t * 1.2) + 1) * 0.5) * (h * 0.64);
      context.beginPath();
      context.arc(x, y, 3 + (i % 3) * 1.5, 0, Math.PI * 2);
      context.fill();
    }
    context.restore();
  }

  #drawTitle(w, h) {
    const y = Math.floor(h * 0.22);
    const glow = 0.55 + 0.45 * Math.sin(this.pulse * 2.2);

    context.save();

    context.textAlign = "center";
    context.textBaseline = "middle";

    context.font = `28px ${FontName.Medieval}`;
    context.fillStyle = "#f7d77e";
    context.shadowColor = `rgba(255, 210, 120, ${0.35 * glow})`;
    context.shadowBlur = 12;
    context.fillText("SYMPATHY", w / 2, y);

    context.font = `8px ${FontName.Medieval}`;
    context.shadowBlur = 0;
    context.fillStyle = "rgba(240, 230, 210, 0.75)";
    context.fillText("The Art of Binding", w / 2, y + 20);

    context.restore();
  }

  #drawMenu(w, h) {
    const panelW = 180;
    const panelH = 110;
    const x = (w - panelW) / 2;
    const y = Math.floor(h * 0.48);

    this.#panel(x, y, panelW, panelH, 6);

    context.save();
    context.textAlign = "center";
    context.textBaseline = "middle";

    context.font = `8px ${FontName.Medieval}`;
    context.fillStyle = "rgba(240, 230, 210, 0.70)";
    context.fillText("Use ↑ ↓ and Enter", w / 2, y + 18);

    context.font = `12px ${FontName.Medieval}`;

    for (let i = 0; i < this.options.length; i++) {
      const isSel = i === this.selectedIndex;
      const yy = y + 50 + i * 26;

      const a = isSel ? (0.35 + 0.25 * (0.5 + 0.5 * Math.sin(this.pulse * 5))) : 0;
      if (isSel) {
        const hg = context.createLinearGradient(x + 12, 0, x + panelW - 12, 0);
        hg.addColorStop(0, "rgba(0,0,0,0)");
        hg.addColorStop(0.5, `rgba(255, 210, 120, ${a})`);
        hg.addColorStop(1, "rgba(0,0,0,0)");
        context.fillStyle = hg;
        context.fillRect(x + 12, yy - 10, panelW - 24, 20);
      }

      context.fillStyle = isSel ? "#ffd77a" : "rgba(240, 230, 210, 0.55)";
      context.shadowColor = isSel ? "rgba(255, 210, 120, 0.45)" : "transparent";
      context.shadowBlur = isSel ? 8 : 0;

      const prefix = isSel ? "✦ " : "  ";
      const suffix = isSel ? " ✦" : "";
      context.fillText(`${prefix}${this.options[i]}${suffix}`, w / 2, yy);
    }

    context.restore();
  }

  #panel(x, y, w, h, r) {
    context.save();

    const bg = context.createLinearGradient(x, y, x + w, y + h);
    bg.addColorStop(0, "rgba(18, 24, 44, 0.92)");
    bg.addColorStop(1, "rgba(10, 12, 22, 0.96)");
    context.fillStyle = bg;

    this.#roundRect(x, y, w, h, r);
    context.fill();

    context.lineWidth = 1.5;
    context.strokeStyle = "rgba(255, 210, 120, 0.35)";
    context.shadowColor = "rgba(120, 170, 255, 0.18)";
    context.shadowBlur = 10;
    context.stroke();

    context.shadowBlur = 0;
    context.strokeStyle = "rgba(255, 210, 120, 0.55)";
    context.lineWidth = 1.5;
    const cs = 8;

    context.beginPath();
    context.moveTo(x + cs, y);
    context.lineTo(x, y);
    context.lineTo(x, y + cs);
    context.stroke();

    context.beginPath();
    context.moveTo(x + w - cs, y);
    context.lineTo(x + w, y);
    context.lineTo(x + w, y + cs);
    context.stroke();

    context.beginPath();
    context.moveTo(x + cs, y + h);
    context.lineTo(x, y + h);
    context.lineTo(x, y + h - cs);
    context.stroke();

    context.beginPath();
    context.moveTo(x + w - cs, y + h);
    context.lineTo(x + w, y + h);
    context.lineTo(x + w, y + h - cs);
    context.stroke();

    context.restore();
  }

  #roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    context.beginPath();
    context.moveTo(x + rr, y);
    context.arcTo(x + w, y, x + w, y + h, rr);
    context.arcTo(x + w, y + h, x, y + h, rr);
    context.arcTo(x, y + h, x, y, rr);
    context.arcTo(x, y, x + w, y, rr);
    context.closePath();
  }
}