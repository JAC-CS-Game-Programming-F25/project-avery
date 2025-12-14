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
        this.handleInput();
        
    }

    handleInput() {
		if (input.isKeyHeld(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}

		// If the player is pressing A or D, not both, change to the walking state.
		if (input.isKeyHeld(Input.KEYS.A) !== input.isKeyHeld(Input.KEYS.D)) {
			this.player.stateMachine.change(PlayerStateName.Walking);
		}
	}
}
