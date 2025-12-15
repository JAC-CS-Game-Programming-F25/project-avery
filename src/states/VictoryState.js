import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { canvas, input, timer } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";
import FontName from "../enums/FontName.js";
import Easing from "../../lib/Easing.js";

export default class VictoryState extends State {
  constructor(stateMachine) {
    super();
    this.stateMachine = stateMachine;

    this.fade = { a: 0 };
    this.pulse = 0;
  }

  enter() {
    this.pulse = 0;
    this.fade.a = 0;
    timer.tween(this.fade, { a: 1 }, 0.35, Easing.outCubic);
  }

  update(dt) {
    timer.update(dt);
    this.pulse += dt;

    if (input.isKeyPressed(Input.KEYS.ENTER)) {
      timer.tween(this.fade, { a: 0 }, 0.2, Easing.inCubic, () => {
        this.stateMachine.change(GameStateName.MainMenu);
      });
    }
  }

  render(ctx) {
    const w = canvas.width;
    const h = canvas.height;

    ctx.save();
    ctx.globalAlpha = this.fade.a;

    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(0, 0, w, h);

    const halo = 0.35 + 0.25 * (0.5 + 0.5 * Math.sin(this.pulse * 1.8));
    ctx.save();
    ctx.globalAlpha = 0.9 * halo;
    ctx.fillStyle = "rgba(255, 210, 120, 0.25)";
    ctx.beginPath();
    ctx.arc(w / 2, h / 2 - 20, 180, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    ctx.font = `68px ${FontName.Medieval}`;
    ctx.fillStyle = "#ffd77a";
    ctx.shadowColor = "rgba(255, 210, 120, 0.55)";
    ctx.shadowBlur = 28;
    ctx.fillText("Victory", w / 2, h / 2 - 50);

    ctx.shadowBlur = 0;
    ctx.font = `18px ${FontName.Medieval}`;
    ctx.fillStyle = "rgba(240, 230, 210, 0.75)";
    ctx.fillText("Press Enter to return to the Main Menu", w / 2, h / 2 + 20);

    ctx.restore();
  }

  exit() {}
}
