import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import { objectSpriteConfig } from '../../config/SpriteConfig.js';
import Tile from '../services/Tile.js';
import { sounds, timer } from '../globals.js';
import Easing from '../../lib/Easing.js';
import Graphic from '../../lib/Graphic.js';
import SoundName from '../enums/SoundName.js';
import Coin from './Coin.js';
import Mushroom from './Mushroom.js';

/**
 * Represents a block in the game world.
 * @extends Entity
 */
export default class Block extends Entity {
	/**
	 * @param {number} x - The x-coordinate of the block.
	 * @param {number} y - The y-coordinate of the block.
	 * @param {Graphic} spriteSheet - The sprite sheet for the block.
	 * @param {Entity|null} item - The item contained in the block (if any).
	 */
	constructor(x, y, spriteSheet,map,item = null) {
		super(x, y, Tile.SIZE, Tile.SIZE);

		this.spriteSheet = spriteSheet;
		this.sprites = objectSpriteConfig.block.map(
			(frame) =>
				new Sprite(
					spriteSheet,
					frame.x,
					frame.y,
					frame.width,
					frame.height
				)
		);
		this.currentSprite = this.sprites[0];
		this.isHit = false;
		this.item = item;
		this.map = map;
	}

	/**
	 * Renders the block.
	 */
	render() {
		this.currentSprite.render(this.position.x, this.position.y);
	}

	/**
	 * Handles the block being hit.
	 * @returns {Promise<boolean>} A promise that resolves to true if the block was hit, false otherwise.
	 */
	async hit() {
		if (!this.isHit) {
			this.isHit = true;

			sounds.play(SoundName.Bump);

			await timer.tweenAsync(
				this.position,
				{ y: this.position.y - 5 },
				0.1,
				Easing.easeInOutQuad
			);
			await timer.tweenAsync(
				this.position,
				{ y: this.position.y + 5 },
				0.1,
				Easing.easeInOutQuad
			);

			this.currentSprite = this.sprites[1];
			if (this.item) {
				if (this.item instanceof Coin) {
					await this.spawnCoin();
				}
				if (this.item instanceof Mushroom) {
					this.spawnMushroom();
				}
			
			}

			return true;
		}

		return false;
	}

	async spawnCoin(){
		const coin = this.item;
		coin.position.x = this.position.x;
		coin.position.y = this.position.y - coin.dimensions.y;

		this.map.coins.push(coin);
		await timer.tweenAsync(
			coin.position,
			{ y: coin.position.y - 30 },
			0.3,
			Easing.easeOutQuad
		);

		coin.isCollected = true;

		sounds.play(SoundName.Coin);
	}

	spawnMushroom(){
		const mushroom = this.item;
		mushroom.position.x = this.position.x;
		mushroom.position.y = this.position.y - mushroom.dimensions.y;
		mushroom.spawn();

		this.map.mushrooms.push(mushroom);
		sounds.play(SoundName.SproutItem);
	}

}
