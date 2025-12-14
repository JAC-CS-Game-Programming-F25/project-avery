import State from "../../lib/State.js";
import Input from "../../lib/Input.js";
import { canvas, input, timer } from "../globals.js";
import GameStateName from "../enums/GameStateName.js";
import Easing from "../../lib/Easing.js";

export default class PauseMenuState extends State {
    constructor() {
        super();

        this.playState = null;

        this.options = [
            "Resume",
            "Restart Level",
            "Main Menu",
        ];

        this.selectedIndex = 0;
        this.fade = { alpha: 0 };
    }

    /* =============================
       STATE LIFECYCLE
       ============================= */
    enter(params) {
        this.playState = params.playState;
        this.selectedIndex = 0;
        this.fade.alpha = 0;

        timer.tween(this.fade, { alpha: 1 }, 0.25, Easing.outCubic);
    }

    exit() {}

    /* =============================
       UPDATE
       ============================= */
    update(dt) {
        timer.update(dt);

        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            this.resume();
            return;
        }

        if (input.isKeyPressed(Input.KEYS.ARROW_UP)) {
            this.selectedIndex =
                (this.selectedIndex - 1 + this.options.length) %
                this.options.length;
        }

        if (input.isKeyPressed(Input.KEYS.ARROW_DOWN)) {
            this.selectedIndex =
                (this.selectedIndex + 1) %
                this.options.length;
        }

        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.confirmSelection();
        }
    }

    /* =============================
       RENDER
       ============================= */
    render(context) {
        if (!this.playState) return;

        // Frozen gameplay
        this.playState.render(context);

        // Dark overlay
        context.save();
        context.globalAlpha = 0.55 * this.fade.alpha;
        context.fillStyle = "#000";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.restore();

        this.renderMenu(context);
    }

    renderMenu(context) {
        const w = 320;
        const h = 220;
        const x = (canvas.width - w) / 2;
        const y = (canvas.height - h) / 2;

        context.save();
        context.globalAlpha = this.fade.alpha;

        context.fillStyle = "#1c2433";
        context.strokeStyle = "#6ec6ff";
        context.lineWidth = 3;
        context.fillRect(x, y, w, h);
        context.strokeRect(x, y, w, h);

        context.fillStyle = "#fff";
        context.font = "28px monospace";
        context.textAlign = "center";
        context.fillText("Paused", x + w / 2, y + 40);

        context.font = "18px monospace";

        this.options.forEach((text, i) => {
            context.fillStyle = i === this.selectedIndex ? "#ffd700" : "#ccc";
            context.fillText(text, x + w / 2, y + 95 + i * 34);
        });

        context.restore();
    }

    /* =============================
       ACTIONS
       ============================= */
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
        timer.tween(this.fade, { alpha: 0 }, 0.2, Easing.inCubic, () => {
            this.stateMachine.change(GameStateName.Play);
        });
    }

    restartLevel() {
        const index = this.playState.currentLevelIndex;

        timer.tween(this.fade, { alpha: 0 }, 0.2, Easing.inCubic, () => {
            this.playState.loadLevelByIndex(index);
            this.stateMachine.change(GameStateName.Play);
        });
    }

    quitToMenu() {
        timer.tween(this.fade, { alpha: 0 }, 0.2, Easing.inCubic, () => {
            this.stateMachine.change(GameStateName.MainMenu);
        });
    }
}
