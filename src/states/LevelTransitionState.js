import State from "../../lib/State.js";
import GameStateName from "../enums/GameStateName.js";

export default class LevelTransitionState extends State {
  constructor(playState) {
    super();
    this.playState = playState;

    this.targetLevelIndex = null;
    this.timer = 0;
    this.duration = 0.1;
  }

  enter(params) {
    this.targetLevelIndex = params.levelIndex;
    this.timer = 0;

    this.playState.sympathyManager.reset();
  }

  update(dt) {
    this.timer += dt;

    if (this.timer >= this.duration) {
      const result = this.playState.loadLevelByIndex(this.targetLevelIndex);

      if (result === "victory") return;

      this.stateMachine.change(GameStateName.Play);
      return;
    }
  }

  render(context) {
    const t = Math.min(this.timer / this.duration, 1);

    const alpha =
      t < 0.5
        ? t * 2 
        : (1 - t) * 2; 

    context.save();
    context.globalAlpha = alpha;
    context.fillStyle = "#000";
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.restore();
  }

  exit() {
    this.targetLevelIndex = null;
  }
}
