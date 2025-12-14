import PlayerState from "./PlayerState.js";
import PlayerStateName from "../../enums/PlayerStateName.js";
import { input } from "../../globals.js";
import Input from "../../../lib/Input.js";

export default class PlayerWalkingState extends PlayerState {
    enter() {
        this.player.setAnimation("walk");
    }

    update(dt) {
        super.update(dt);
        this.handleHorizontalMovement();

        if (!input.isKeyHeld(Input.KEYS.A) && !input.isKeyHeld(Input.KEYS.D)) {
            this.player.stateMachine.change(PlayerStateName.Idling);
        }
        if (input.isKeyHeld(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}
    }
}
