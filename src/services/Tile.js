import Sprite from '../../lib/Sprite.js';

/**
 * Represents a single tile in the game world.
 */
export default class Tile {
	static SIZE = 16;

	static COIN = 5;
	static BLOCK = 21;
	static BLANK = 19;
	static STAR = 14;
	static GOOMBA = 23;
	static MUSHROOM = 25;
	static PLATFORM = 55;

	/**
	 * @param {number} id - Index into sprites array
	 * @param {Sprite[]} sprites
	 */
	constructor(id, sprites) {
		this.sprites = sprites;
		this.id = id;
	}

	/**
	 * FIXED — now receives (context, gridX, gridY)
	 */
	render(context, gridX, gridY) {
		const px = gridX * Tile.SIZE;
		const py = gridY * Tile.SIZE;

		this.sprites[this.id].render(context, px, py);
	}
}
