import { CameraSettings } from '../../config/CameraConfig.js';
import { PlayerConfig } from '../../config/PlayerConfig.js';
import Vector from '../../lib/Vector.js';

/**
 * Represents a camera that follows the player in a 2D game world.
 * The camera implements smooth following, lookahead, and boundary checking.
 */
export default class Camera {
	/**
	 * Creates a new Camera instance.
	 *
	 * @param {Object} player - The player object that the camera will follow.
	 * @param {number} viewportWidth - The width of the game viewport in pixels.
	 * @param {number} viewportHeight - The height of the game viewport in pixels.
	 * @param {number} worldWidth - The total width of the game world in pixels.
	 * @param {number} worldHeight - The total height of the game world in pixels.
	 */
	constructor(
		player,
		viewportWidth,
		viewportHeight,
		worldWidth,
		worldHeight
	) {
		this.player = player;
		this.viewportWidth = viewportWidth;
		this.viewportHeight = viewportHeight;
		this.worldWidth = worldWidth;
		this.worldHeight = worldHeight;

		// Initialize camera position at the bottom-left corner of the viewport
		this.position = new Vector(0, viewportHeight);

		// Calculate the center of the viewport
		this.center = new Vector(viewportWidth / 2, viewportHeight / 2);

		// Initialize lookahead vector (will be updated based on player movement)
		this.lookahead = new Vector(0, 0);

		// Target vertical lookahead (used for looking up/down)
		this.targetLookaheadY = 0;

		// Track the last Y position where the player was grounded
		this.lastGroundedY = 0;

		// Define a vertical deadzone (half the viewport height)
		// The camera won't move vertically within this zone
		this.verticalDeadzone = viewportHeight / 2;
	}

	/**
	 * Updates the camera's position based on the player's movement.
	 *
	 * @param {number} dt - Delta time, the time passed since the last frame.
	 */
	update(dt) {
		// Calculate the center position of the player
		const playerCenter = new Vector(
			this.player.position.x + this.player.dimensions.x / 2,
			this.player.position.y + this.player.dimensions.y / 2
		);

		let currentDirectionX = 0;
		let isMoving = false;

		// Determine if the player is moving and in which direction
		if (Math.abs(this.player.velocity.x) > 0.1) {
			currentDirectionX = this.player.velocity.x > 0 ? 1 : -1;
			isMoving = true;
		}

		// Calculate the player's speed ratio (current speed / max speed)
		const playerSpeedX = Math.abs(this.player.velocity.x);
		const maxSpeedX = PlayerConfig.maxSpeed;
		const speedRatioX = Math.min(playerSpeedX / maxSpeedX, 1);

		// Calculate target horizontal lookahead based on player's movement
		let targetLookaheadX = isMoving
			? CameraSettings.lookahead * speedRatioX * currentDirectionX
			: 0;

		// Update lastGroundedY when player lands
		if (this.player.isOnGround) {
			this.lastGroundedY = playerCenter.y;
		}

		// Calculate vertical camera adjustment
		let verticalAdjustment = 0;
		if (
			Math.abs(playerCenter.y - this.lastGroundedY) >
			this.verticalDeadzone
		) {
			verticalAdjustment = playerCenter.y - this.lastGroundedY;
		}

		// Calculate target camera position
		const target = new Vector(
			playerCenter.x + targetLookaheadX - this.center.x,
			this.lastGroundedY +
				verticalAdjustment +
				this.targetLookaheadY -
				this.center.y
		);

		if (CameraSettings.damping > 0) {
			// Use exponential smoothing for camera movement if damping is enabled
			const smoothFactor = 1 - Math.exp(-CameraSettings.damping * dt);
			this.position.x += (target.x - this.position.x) * smoothFactor;
			this.position.y += (target.y - this.position.y) * smoothFactor;

			// Apply smoothing to lookahead
			this.lookahead.x +=
				(targetLookaheadX - this.lookahead.x) * smoothFactor;
			this.lookahead.y +=
				(this.targetLookaheadY - this.lookahead.y) * smoothFactor;
		} else {
			// Snap to target positions if damping is zero (instant camera movement)
			this.position.x = target.x;
			this.position.y = target.y;
			this.lookahead.x = targetLookaheadX;
			this.lookahead.y = this.targetLookaheadY;
		}

		// Ensure camera stays within world bounds
		this.position.x = Math.max(
			0,
			Math.min(this.worldWidth - this.viewportWidth, this.position.x)
		);
		this.position.y = Math.max(
			0,
			Math.min(this.worldHeight - this.viewportHeight, this.position.y)
		);

		// Round camera position to prevent sub-pixel rendering
		this.position.x = Math.round(this.position.x);
		this.position.y = Math.round(this.position.y);
	}

	/**
	 * Applies the camera transform to the rendering context.
	 * This method should be called before rendering the game world.
	 *
	 * @param {CanvasRenderingContext2D} context - The rendering context to apply the transform to.
	 */
	applyTransform(context) {
		context.save();
		context.translate(-this.position.x, -this.position.y);
	}

	/**
	 * Resets the camera transform on the rendering context.
	 * This method should be called after rendering the game world.
	 *
	 * @param {CanvasRenderingContext2D} context - The rendering context to reset the transform on.
	 */
	resetTransform(context) {
		context.restore();
	}

	/**
	 * Gets the current lookahead position relative to the viewport center.
	 * This can be used for additional visual effects or UI positioning.
	 *
	 * @returns {Object} An object containing x and y coordinates of the lookahead position.
	 */
	getLookaheadPosition() {
		return {
			x: this.center.x + this.lookahead.x,
			y: this.center.y + this.lookahead.y,
		};
	}
}
