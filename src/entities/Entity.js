import { getCollisionDirection, isAABBCollision } from '../../lib/Collision.js';
import Vector from '../../lib/Vector.js';
import { debugOptions } from '../globals.js';
/**
 * Represents a game entity with position, dimensions, and velocity.
 */
export default class Entity {
	/**
	 * @param {number} x - Initial x position.
	 * @param {number} y - Initial y position.
	 * @param {number} width - Entity width.
	 * @param {number} height - Entity height.
	 */
	constructor(x = 0, y = 0, width = 0, height = 0) {
		this.position = new Vector(x, y);
		this.dimensions = new Vector(width, height);
		this.velocity = new Vector(0, 0);
		this.isOnGround = false;

		this.hitboxOffset = new Vector(0, 0);
        this.hitboxSize = new Vector(width, height);
	}

	/**
	 * Updates the entity state.
	 * @param {number} dt - Delta time.
	 */
	update(dt) {}

	/**
	 * Renders the entity.
	 * @param {CanvasRenderingContext2D} context - The rendering context.
	 */
	render(context) {
		this.renderHitbox(context, "rgba(0, 255, 0, 0.8)");
	}

	/**
	 * Checks if this entity collides with another entity.
	 * @param {Entity} entity - The other entity to check collision with.
	 * @returns {boolean} True if collision occurs, false otherwise.
	 */
	collidesWith(entity) {
		return isAABBCollision(
			this.hitboxX,
			this.hitboxY,
			this.hitboxWidth,
			this.hitboxHeight,
			entity.hitboxX,
			entity.hitboxY,
			entity.hitboxWidth,
			entity.hitboxHeight
		);
	}


	/**
	 * Gets the collision direction with another entity.
	 * @param {Entity} entity - The other entity to check collision direction with.
	 * @returns {number} The collision direction.
	 */
	getCollisionDirection(entity) {
		return getCollisionDirection(
			this.hitboxX,
			this.hitboxY,
			this.hitboxWidth,
			this.hitboxHeight,
			entity.hitboxX,
			entity.hitboxY,
			entity.hitboxWidth,
			entity.hitboxHeight
		);
	}


	renderHitbox(context, colour = "rgba(255, 0, 0, 0.6)") {
		if (!debugOptions.hitboxes) return;

		const hx = this.position.x + this.hitboxOffset.x;
		const hy = this.position.y + this.hitboxOffset.y;
		const hw = this.hitboxSize.x;
		const hh = this.hitboxSize.y;

		context.save();
		context.strokeStyle = colour;
		context.lineWidth = 1;

		context.strokeRect(
			Math.round(hx),
			Math.round(hy),
			hw,
			hh
		);

		context.restore();
	}

	getHitbox() {
    return {
        x: this.position.x + this.hitboxOffset.x,
        y: this.position.y + this.hitboxOffset.y,
        width: this.hitboxSize.x,
        height: this.hitboxSize.y,
    	};
	}

	get hitboxX() {
    return this.position.x + this.hitboxOffset.x;
	}

	get hitboxY() {
		return this.position.y + this.hitboxOffset.y;
	}

	get hitboxWidth() {
		return this.hitboxSize.x;
	}

	get hitboxHeight() {
		return this.hitboxSize.y;
	}

	get hitboxBottom() {
		return this.hitboxY + this.hitboxHeight;
	}

	get hitboxRight() {
		return this.hitboxX + this.hitboxWidth;
	}


}
