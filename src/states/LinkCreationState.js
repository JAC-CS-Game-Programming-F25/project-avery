import Input from "../../lib/Input.js";
import State from "../../lib/State.js";
import MusicName from "../enums/MusicName.js";
import { input, sounds } from "../globals.js";

export default class LinkCreationState extends State {
    constructor(playState) {
        super();
        this.playState = playState;
        this.sympathyManager = playState.sympathyManager;
    }

    enter() {
        console.log("Entered link state")
        sounds.stop(MusicName.Intro);
        sounds.play(MusicName.Link)
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
        this.playState.render(ctx);

        this.playState.renderSympathyLinks(ctx);
    }

    exit() {
        console.log("Exited link state")
        sounds.stop(MusicName.Link);
        sounds.play(MusicName.Intro);
        this.sympathyManager.exit();
    }
}