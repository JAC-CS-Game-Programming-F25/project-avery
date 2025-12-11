import PlayerState from './PlayerState.js';
import Input from '../../../lib/Input.js';
import { input } from '../../globals.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import Player from './Player.js';

/**
 * Represents the idling state of the player.
 * @extends PlayerState
 */
export default class PlayerIdlingState extends PlayerState {
	/**
	 * Creates a new PlayerIdlingState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
	}

	/**
	 * Called when entering the idling state.
	 */
	enter() {
		// this.player.velocity.x = 0;
		this.player.velocity.y = 0;
		this.player.currentAnimation = this.player.animations.idle;
	}

	/**
	 * Updates the idling state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);
		this.handleHorizontalMovement();
		this.handleInput();
		this.checkFalling();
	}

	checkFalling() {
		if (!this.player.isOnGround) {
			this.player.stateMachine.change(PlayerStateName.Falling);
    }
}
	/**
	 * Handles player input.
	 */
	handleInput() {
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}

		// If the player is pressing A or D, not both, change to the walking state.
		if (input.isKeyHeld(Input.KEYS.A) !== input.isKeyHeld(Input.KEYS.D)) {
			this.player.stateMachine.change(PlayerStateName.Walking);
		}
	}
}
