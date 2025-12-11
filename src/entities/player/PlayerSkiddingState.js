import PlayerState from './PlayerState.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import { input } from '../../globals.js';
import Input from '../../../lib/Input.js';
import Player from './Player.js';

/**
 * Represents the skidding state of the player.
 * @extends PlayerState
 */
export default class PlayerSkiddingState extends PlayerState {
	/**
	 * Creates a new PlayerSkiddingState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
	}

	/**
	 * Called when entering the skidding state.
	 */
	enter() {
		this.player.currentAnimation = this.player.animations.skid;
	}

	/**
	 * Called when exiting the skidding state.
	 */
	exit() {}

	/**
	 * Updates the skidding state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);
		this.handleInput();
		this.handleSkidding();
		this.checkTransitions();
	}

	/**
	 * Handles player input.
	 */
	handleInput() {
		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}
	}

	handleSkidding() {
		this.slowDown();
		if (Math.abs(this.player.velocity.x) < 0.1) this.player.velocity.x = 0;
	}

	/**
	 * Checks for state transitions.
	 */
	checkTransitions() {
		if (Math.abs(this.player.velocity.x) < 0.1) {
			if (
				input.isKeyHeld(Input.KEYS.A) ||
				input.isKeyHeld(Input.KEYS.D)
			) {
				this.player.stateMachine.change(PlayerStateName.Walking);
			} else {
				this.player.stateMachine.change(PlayerStateName.Idling);
			}
		}
	}
}
