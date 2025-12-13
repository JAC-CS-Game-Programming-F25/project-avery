import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import { input } from "../globals.js";

export default class LinkCreationState extends State {
    constructor(playState) {
        super();
        this.playState = playState;
        this.sympathyManager = playState.sympathyManager;
    }

    enter() {
        console.log("Entered link state")
        this.sympathyManager.enter();
    }

    update(dt) {
        // ❄️ world is frozen
        this.sympathyManager.update(dt);

        if (!this.sympathyManager.active) {
            this.playState.stateMachine.change('play');
        }

    }
 
    render(ctx) {
        // Render frozen world
        this.playState.render(ctx);

        // Overlay sympathy UI
        this.playState.renderSympathySelection(ctx);
        this.playState.renderSympathyLinks(ctx);
    }

    exit() {
        console.log("Exited link state")

        this.sympathyManager.exit();
    }
}
