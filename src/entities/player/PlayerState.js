import Input from '../../../lib/Input.js';
import State from '../../../lib/State.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';
import { debugOptions, input } from '../../globals.js';
import Tile from '../../services/Tile.js';
import CollisionDetector from '../../services/CollisionDetector.js';
import Player from './Player.js';

/**
 * Base class for all player states.
 * @extends State
 */
export default class PlayerState extends State {
	/**
	 * @param {Player} player - The player instance.
	 */
	constructor(player) {
		super();
		this.player = player;
		this.collisionDetector = new CollisionDetector(player.map);
	}

	/**
	 * Updates the player state.
	 * @param {number} dt - Delta time.
	 */
	update(dt) {
		this.applyGravity(dt);
		this.updatePosition(dt);
		this.player.currentAnimation.update(dt);
	}

	/**
	 * Renders the player on the canvas.
	 * This method handles the player's orientation, animation, and optional debug rendering.
	 *
	 * @param {CanvasRenderingContext2D} context - The 2D rendering context of the canvas.
	 */
	render(context) {
		// Call the parent class's render method
		super.render();

		// Save the current canvas state
		context.save();

		// Handle player orientation (facing right or left)
		if (this.player.facingRight) {
			// If facing right, flip the sprite horizontally
			context.scale(-1, 1);
			// Adjust position to account for the flip
			context.translate(
				Math.floor(-this.player.position.x - this.player.dimensions.x),
				Math.floor(this.player.position.y)
			);
		} else {
			// If facing left, just translate to the player's position
			context.translate(
				Math.floor(this.player.position.x),
				Math.floor(this.player.position.y)
			);
		}

		// Render the current frame of the player's animation
		this.player.currentAnimation.getCurrentFrame().render(0, 0);

		// Restore the canvas state to what it was before our changes
		context.restore();

		// If debug mode is enabled, render additional debug information
		if (debugOptions.playerCollision) {
			this.renderDebug(context);
		}
	}

	/**
	 * Renders debug information for the player and surrounding tiles.
	 * This method visualizes the player's bounding box and nearby tiles,
	 * highlighting potential collision areas.
	 *
	 * @param {CanvasRenderingContext2D} context - The rendering context.
	 */
	renderDebug(context) {
		// Calculate the tile coordinates of the area around the player
		const left = Math.floor(this.player.position.x / Tile.SIZE) - 1;
		const top = Math.floor(this.player.position.y / Tile.SIZE) - 1;
		const right =
			Math.floor(
				(this.player.position.x + this.player.dimensions.x) / Tile.SIZE
			) + 1;
		const bottom =
			Math.floor(
				(this.player.position.y + this.player.dimensions.y - 1) /
					Tile.SIZE
			) + 1;

		// Render a semi-transparent yellow rectangle for each tile in the calculated area
		context.fillStyle = 'rgba(255, 255, 0, 0.3)';
		for (let y = top; y <= bottom; y++) {
			for (let x = left; x <= right; x++) {
				context.fillRect(
					x * Tile.SIZE,
					y * Tile.SIZE,
					Tile.SIZE,
					Tile.SIZE
				);
			}
		}

		// Render semi-transparent red rectangles for tiles that the player is colliding with
		context.fillStyle = 'rgba(255, 0, 0, 0.5)';
		this.getCollidingTiles(left, top, right, bottom).forEach((tile) => {
			context.fillRect(
				tile.x * Tile.SIZE,
				tile.y * Tile.SIZE,
				Tile.SIZE,
				Tile.SIZE
			);
		});

		// Render a blue outline around the player's bounding box
		context.strokeStyle = 'blue';
		context.strokeRect(
			this.player.position.x,
			this.player.position.y,
			this.player.dimensions.x,
			this.player.dimensions.y
		);
	}

	/**
	 * Gets the tiles that the player is colliding with.
	 * @param {number} left - Leftmost tile x-coordinate.
	 * @param {number} top - Topmost tile y-coordinate.
	 * @param {number} right - Rightmost tile x-coordinate.
	 * @param {number} bottom - Bottommost tile y-coordinate.
	 * @returns {Array} Array of colliding tile coordinates.
	 */
	getCollidingTiles(left, top, right, bottom) {
		const collidingTiles = [];
		for (let y = top; y <= bottom; y++) {
			for (let x = left; x <= right; x++) {
				if (this.player.map.isSolidTileAt(x, y)) {
					collidingTiles.push({ x, y });
				}
			}
		}
		return collidingTiles;
	}

	/**
	 * Handles horizontal movement of the player.
	 * This method updates the player's horizontal velocity based on input
	 * and applies acceleration, deceleration, and speed limits.
	 */
	handleHorizontalMovement() {
		if (input.isKeyHeld(Input.KEYS.A) && input.isKeyHeld(Input.KEYS.D)) {
			this.slowDown();
		} else if (input.isKeyHeld(Input.KEYS.A)) {
			this.moveLeft();
			this.player.facingRight = false;
		} else if (input.isKeyHeld(Input.KEYS.D)) {
			this.moveRight();
			this.player.facingRight = true;
		} else {
			this.slowDown();
		}

		// Set speed to zero if it's close to zero to stop the player
		if (Math.abs(this.player.velocity.x) < 0.1) this.player.velocity.x = 0;
	}

	moveRight() {
		this.player.velocity.x = Math.min(
			this.player.velocity.x + PlayerConfig.acceleration,
			PlayerConfig.maxSpeed
		);
	}

	moveLeft() {
		this.player.velocity.x = Math.max(
			this.player.velocity.x - PlayerConfig.acceleration,
			-PlayerConfig.maxSpeed
		);
	}

	slowDown() {
		if (this.player.velocity.x > 0) {
			this.player.velocity.x = Math.max(
				0,
				this.player.velocity.x - PlayerConfig.deceleration
			);
		} else if (this.player.velocity.x < 0) {
			this.player.velocity.x = Math.min(
				0,
				this.player.velocity.x + PlayerConfig.deceleration
			);
		}
	}

	/**
	 * Applies gravity to the player.
	 * This method increases the player's vertical velocity when they're not on the ground,
	 * simulating the effect of gravity.
	 *
	 * @param {number} dt - Delta time (time since last update).
	 */
	applyGravity(dt) {
		if (!this.player.isOnGround) {
			// Increase downward velocity, but don't exceed max fall speed
			this.player.velocity.y = Math.min(
				this.player.velocity.y + PlayerConfig.gravity * dt,
				PlayerConfig.maxFallSpeed
			);
		}
	}

	/**
	 * Updates the player's position based on their current velocity.
	 * This method also handles collision detection and keeps the player within the map boundaries.
	 *
	 * @param {number} dt - Delta time (time since last update).
	 */
	updatePosition(dt) {
		this.player.isOnGround = false;
		// Calculate position change
		const dx = this.player.velocity.x * dt;
		const dy = this.player.velocity.y * dt;

		// Update horizontal position and check for collisions
		this.player.position.x += dx;
		this.collisionDetector.checkHorizontalCollisions(this.player);

		// Update vertical position and check for collisions
		this.player.position.y += dy;
		this.collisionDetector.checkVerticalCollisions(this.player);

		// Keep player within horizontal map boundaries
		this.player.position.x = Math.max(
			0,
			Math.min(
				Math.round(this.player.position.x),
				this.player.map.width * Tile.SIZE - this.player.dimensions.x
			)
		);

		// Round vertical position to avoid sub-pixel rendering
		this.player.position.y = Math.round(this.player.position.y);
	}
}
