import Entity from './Entity.js';
import Animation from '../../lib/Animation.js';
import { enemySpriteConfig } from '../../config/SpriteConfig.js';
import Sprite from '../../lib/Sprite.js';
import Tile from '../services/Tile.js';
import Graphic from '../../lib/Graphic.js';
import Map from '../services/Map.js';
import Player from './player/Player.js';
import { sounds } from '../globals.js';
import SoundName from '../enums/SoundName.js';

/**
 * Represents a Goomba enemy in the game.
 * @extends Entity
 */
export default class Goomba extends Entity {
	/**
	 * Creates a new Goomba instance.
	 * @param {number} x - The initial x-coordinate.
	 * @param {number} y - The initial y-coordinate.
	 * @param {number} width - The width of the Goomba.
	 * @param {number} height - The height of the Goomba.
	 * @param {Graphic} spriteSheet - The sprite sheet containing Goomba graphics.
	 * @param {Map} map - The game map instance.
	 */
	constructor(x, y, width, height, spriteSheet, map) {
		super(x, y, width, height);
		this.map = map;
		this.speed = 30; // Pixels per second
		this.direction = 1; // 1 for right, -1 for left
		this.gravity = 800;
		this.verticalSpeed = 0;
		this.isDead = false;
		this.deathTimer = 0;
		this.deathDuration = 5; // Time in seconds for death animation

		// Create walk animation
		this.walkAnimation = new Animation(
			enemySpriteConfig.goomba.map(
				(frame) =>
					new Sprite(
						spriteSheet,
						frame.x,
						frame.y,
						frame.width,
						frame.height
					)
			),
			0.2 // Animation interval
		);
 
		// Create death sprite (upside down Goomba)
		this.deathSprite = new Sprite(
			spriteSheet,
			enemySpriteConfig.goomba[0].x,
			enemySpriteConfig.goomba[0].y,
			enemySpriteConfig.goomba[0].width,
			enemySpriteConfig.goomba[0].height
		);
	}

	/**
	 * Updates the Goomba's state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		this.updateMovement(dt);
		this.walkAnimation.update(dt);
	}

	/**
	 * Updates the Goomba's movement.
	 * @param {number} dt - The time passed since the last update.
	 */
	updateMovement(dt) {
		// Apply gravity
		this.verticalSpeed += this.gravity * dt;
		this.position.y += this.verticalSpeed * dt;

		// Move horizontally
		this.position.x += this.direction * this.speed * dt;

		// Check for collisions
		this.checkCollisions();
	}

	/**
	 * Checks for collisions with the environment.
	 */
	checkCollisions() {
		// Check ground collision
		if (this.onGround()) {
			this.position.y =
				Math.floor(this.position.y / Tile.SIZE) * Tile.SIZE;
			this.verticalSpeed = 0;
		}

		// Check wall collision
		if (this.isCollidingWithWall()) {
			this.direction *= -1; // Reverse direction
		}
	}

	/**
	 * Checks if the Goomba is on the ground.
	 * @returns {boolean} True if the Goomba is on the ground, false otherwise.
	 */
	onGround() {
		const bottomTile = Math.floor(
			(this.position.y + this.dimensions.y) / Tile.SIZE
		);
		const leftTile = Math.floor(this.position.x / Tile.SIZE);
		const rightTile = Math.floor(
			(this.position.x + this.dimensions.x - 1) / Tile.SIZE
		);

		return (
			this.map.isSolidTileAt(leftTile, bottomTile) ||
			this.map.isSolidTileAt(rightTile, bottomTile)
		);
	}

	/**
	 * Checks if the Goomba is colliding with a wall.
	 * @returns {boolean} True if the Goomba is colliding with a wall, false otherwise.
	 */
	isCollidingWithWall() {
		const topTile = Math.floor(this.position.y / Tile.SIZE);
		const bottomTile = Math.floor(
			(this.position.y + this.dimensions.y - 1) / Tile.SIZE
		);
		const sideTile = Math.floor(
			(this.position.x + (this.direction > 0 ? this.dimensions.x : 0)) /
				Tile.SIZE
		);

		return (
			this.map.isSolidTileAt(sideTile, topTile) ||
			this.map.isSolidTileAt(sideTile, bottomTile)
		);
	}

	/**
	 * Marks the Goomba as dead.
	 */
	die() {
		this.isDead = true;
	}

	/**
	 * Renders the Goomba.
	 * @param {CanvasRenderingContext2D} context - The rendering context.
	 */
	render(context) {
		context.save();

		if (this.direction === 1) {
			context.scale(-1, 1);
			context.translate(
				Math.floor(-this.position.x - this.dimensions.x),
				Math.floor(this.position.y)
			);
		} else {
			context.translate(
				Math.floor(this.position.x),
				Math.floor(this.position.y)
			);
		}

		this.walkAnimation.getCurrentFrame().render(0, 0);

		context.restore();
	}

	/**
	 * Handles collision with the player.
	 * @param {Player} player - The player instance.
	 */
	onCollideWithPlayer(player) {
		const goombaTopQuarter = this.position.y + this.dimensions.y * 0.25;
		const playerBottomQuarter =
			player.position.y + player.dimensions.y * 0.9;

		if (playerBottomQuarter <= goombaTopQuarter) {
			// Player's bottom 10% is hitting Goomba's top 25%
			this.die();
			sounds.play(SoundName.Stomp);
		} else if (!this.isDead) {
			// Goomba hits the player
			player.hit();
		}
	}
}
