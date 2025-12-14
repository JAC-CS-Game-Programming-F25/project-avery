import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { canvas, context, input, sounds } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";
import MusicName from "../enums/MusicName.js";

export default class MainMenuState extends State {
  constructor() {
    super();
    this.options = ["Start Game", "Quit"];
    this.selectedIndex = 0;
  }
  enter(){
    super.enter()
    sounds.play(MusicName.Intro)
  }
  
  update(dt) {
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
      this.stateMachine.change(GameStateName.Play);
    }

    if (choice === "Quit") {
      window.close?.();
    }
  }

  render() {
    context.clearRect(0, 0, canvas.width, canvas.height);

    // Background
    context.fillStyle = "#1b1f3b";
    context.fillRect(0, 0, canvas.width, canvas.height);

    // Title
    context.fillStyle = "#fff";
    context.font = "48px monospace";
    context.textAlign = "center";
    context.fillText("SYMPATHY", canvas.width / 2, 120);

    // Menu options
    context.font = "24px monospace";
    this.options.forEach((opt, i) => {
      context.fillStyle = i === this.selectedIndex ? "#ffd700" : "#ccc";
      context.fillText(opt, canvas.width / 2, 220 + i * 40);
    });
  }
}
