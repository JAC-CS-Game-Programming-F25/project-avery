import PlayerState from "./PlayerState.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayerIdlingState extends PlayerState {
    enter() {
        this.player.velocity.x = 0;
        this.player.setAnimation("idle");
    }

    update(dt) {
        super.update(dt);

        // Start walking
        if (input.isKeyHeld(Input.KEYS.A) || input.isKeyHeld(Input.KEYS.D)) {
            this.player.stateMachine.change(PlayerStateName.Walking);
            return;
        }
    }
}
