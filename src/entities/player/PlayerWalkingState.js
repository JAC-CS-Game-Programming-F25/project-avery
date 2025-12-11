import PlayerState from './PlayerState.js';
import { input } from '../../globals.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';
import Input from '../../../lib/Input.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import Player from './Player.js';

/**
 * Represents the walking state of the player.
 * @extends PlayerState
 */
export default class PlayerWalkingState extends PlayerState {
	/**
	 * Creates a new PlayerWalkingState instance.
	 * @param {Player} player - The player object.
	 */
	constructor(player) {
		super(player);
		this.isMovingRight = false;
		this.isMovingLeft = false;
	}

	/**
	 * Called when entering the walking state.
	 */
	enter() {
		this.player.isOnGround = true;
		this.player.currentAnimation = this.player.animations.walk;
	}

	/**
	 * Updates the walking state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		super.update(dt);
		this.checkTransitions();
		this.handleInput();
		this.handleHorizontalMovement();
	}

	/**
	 * Handles player input.
	 */
	handleInput() {
		if (input.isKeyHeld(Input.KEYS.A) && !this.isMovingRight) {
			this.isMovingLeft = true;
		} else {
			this.isMovingLeft = false;
		}

		if (input.isKeyHeld(Input.KEYS.D) && !this.isMovingLeft) {
			this.isMovingRight = true;
		} else {
			this.isMovingRight = false;
		}

		if (input.isKeyPressed(Input.KEYS.SPACE)) {
			this.player.stateMachine.change(PlayerStateName.Jumping);
		}
	}

	/**
	 * Checks for state transitions.
	 */
	checkTransitions() {
		if (this.shouldIdle()) {
			this.player.stateMachine.change(PlayerStateName.Idling);
		}

		if (this.shouldSkid()) {
			this.player.facingRight = !this.player.facingRight;
			this.player.stateMachine.change(PlayerStateName.Skidding);
		}

		if (!this.player.isOnGround) {
			if (this.player.velocity.y < 0) {
				this.player.stateMachine.change(PlayerStateName.Jumping);
			} else {
				this.player.stateMachine.change(PlayerStateName.Falling);
			}
		}
	}

	/**
	 * Determines if the player should transition to the skidding state.
	 * @returns {boolean} True if the player should skid, false otherwise.
	 */
	shouldSkid() {
		return (
			this.player.isOnGround &&
			Math.abs(this.player.velocity.x) > PlayerConfig.skidThreshold &&
			((input.isKeyHeld(Input.KEYS.A) && this.player.velocity.x > 0) ||
				(input.isKeyHeld(Input.KEYS.D) && this.player.velocity.x < 0))
		);
	}

	/**
	 * Determines if the player should transition to the idling state.
	 * @returns {boolean} True if the player should idle, false otherwise.
	 */
	shouldIdle() {
		return (
			!this.isMovingLeft &&
			!this.isMovingRight &&
			Math.abs(this.player.velocity.x) < 0.1
		);
	}
}
