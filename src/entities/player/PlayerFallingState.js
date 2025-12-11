import PlayerState from './PlayerState.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import Player from './Player.js';

/**
 * Represents the falling state of the player.
 * @extends PlayerState
 */
export default class PlayerFallingState extends PlayerState {
	/**
	 * Creates a new PlayerFallingState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
	}

	/**
	 * Called when entering the falling state.
	 */
	enter() {
		this.player.currentAnimation = this.player.animations.fall;
	}

	/**
	 * Updates the falling state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);

		this.handleHorizontalMovement();
		this.checkTransitions();
	}

	/**
	 * Checks for state transitions.
	 */
	checkTransitions() {
		if (this.player.isOnGround) {
			if (Math.abs(this.player.velocity.x) < 0.1) {
				this.player.stateMachine.change(PlayerStateName.Idling);
			} else {
				this.player.stateMachine.change(PlayerStateName.Walking);
			}
		}
	}
}
