import Sprite from '../../lib/Sprite.js';

/**
 * Represents a single tile in the game world.
 */
export default class Tile {
	/**
	 * The size of a tile in pixels.
	 * @type {number}
	 */
	static SIZE = 16;

	/**
	 * The ID for a coin tile.
	 * @type {number}
	 */
	static COIN = 5;

	/**
	 * The ID for a block tile.
	 * @type {number}
	 */
	static BLOCK = 21;

	/**
	 * The ID for a blank (empty) tile.
	 * @type {number}
	 */
	static BLANK = 19;

	/**
	 * The ID for a star tile.
	 * @type {number}
	 */
	static STAR = 14;

	/**
	 * The ID for a Goomba tile.
	 * @type {number}
	 */
	static GOOMBA = 23;

	/**
	 * The ID for a mushroom tile.
	 * @type {number}
	 */
	static MUSHROOM = 25;

	/**
	 * The ID for a platform tile.
	 * @type {number}
	 */
	static PLATFORM = 55;

	/**
	 * Creates a new Tile instance.
	 * @param {number} id - The ID of the tile, corresponding to its sprite in the spritesheet.
	 * @param {Sprite[]} sprites - An array of Sprite objects representing all possible tile sprites.
	 */
	constructor(id, sprites) {
		this.sprites = sprites;
		this.id = id;
	}

	/**
	 * Renders the tile at the specified grid coordinates.
	 * @param {number} x - The x-coordinate in the tile grid (not pixels).
	 * @param {number} y - The y-coordinate in the tile grid (not pixels).
	 */
	render(x, y) {
		// Multiply by Tile.SIZE to convert grid coordinates to pixel coordinates
		this.sprites[this.id].render(x * Tile.SIZE, y * Tile.SIZE);
	}
}
