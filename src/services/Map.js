import Sprite from '../../lib/Sprite.js';
import ImageName from '../enums/ImageName.js';
import Tile from './Tile.js';
import Layer from './Layer.js';
import { debugOptions, images } from '../globals.js';
import GameObject from '../entities/object/GameObject.js'
import { loadObjectSprites, objectSpriteConfig } from '../../config/SpriteConfig.js';
export default class Map {
	static BACKGROUND_LAYER = 0;
    static COLLISION_LAYER = 1;
    static FOREGROUND_LAYER = 2;

	constructor(mapDefinition) {
		
		this.width = mapDefinition.width;
		this.height = mapDefinition.height;
		this.tileSize = mapDefinition.tilewidth;

		const sprites = Sprite.generateSpritesFromSpriteSheet(
			images.get(ImageName.Tiles),
			this.tileSize,
			this.tileSize
		);

		this.tileLayers = [];
		this.objectLayer = null;

		for (const layer of mapDefinition.layers) {
			if (layer.type === 'tilelayer') {
				this.tileLayers.push(new Layer(layer, sprites));
			}

			if (layer.type === 'objectgroup' && layer.name === 'Objects') {
				this.objectLayer = layer;
			}
		}

		this.objectSprites = {
			Crate: loadObjectSprites(
				images.get(ImageName.Tiles),     
				objectSpriteConfig.Crate        
			),
		};
		this.gameObjects = [];

		this.loadObjects();
	}


	loadObjects() {
		if (!this.objectLayer) return;

		for (const obj of this.objectLayer.objects) {
			const sprites = this.objectSprites[obj.type];

			if (!sprites) {
				console.warn(`No sprites for object type: ${obj.type}`);
				continue;
			}

			const gameObject = new GameObject(
				obj.x,
				obj.y - obj.height, // Tiled Y fix
				this,
				obj.width,
				obj.height,
				obj.type,
				1,      // mass
				20,     // temp
				sprites
			);

			this.gameObjects.push(gameObject);
		}
	}


	parseProperties(properties = []) {
		const result = {};
		for (const prop of properties) {
			result[prop.name] = prop.value;
		}
		return result;
	}

	addGameObject(obj) {
		this.gameObjects.push(obj);
	}
	update(dt) {
		for (const obj of this.gameObjects) {
			if (!obj.isStatic) {
				obj.applyForce({ x: 0, y: 980 * obj.mass }); 
			}

			obj.update(dt);
			this.resolveTileCollisions(obj);
		}
	}


	resolveGameObjectCollisions(player) {
		for (const obj of this.gameObjects) {
			if (!player.collidesWith(obj)) continue;

			const dir = player.getCollisionDirection(obj);

			switch (dir) {
				case 1: { // player landed on object
					const penetration =
						player.hitboxBottom - obj.hitboxY;

					player.position.y -= penetration;
					player.velocity.y = 0;
					player.isOnGround = true;

					// TRANSFER FORCE
					obj.applyForce({
						x: 0,
						y: player.mass ? player.mass * 200 : 200
					});
					break;
				}

				case 2: { // player hit object from right
					const penetration =
						obj.hitboxRight - player.hitboxX;

					// Separate player
					player.position.x += penetration;
					player.velocity.x = 0;

					// Push object
					if (!obj.isStatic) {
						const pushStrength = 300; // tune this
						obj.velocity.x = Math.max(
							obj.velocity.x - pushStrength / obj.mass,
							-120 // max push speed
						);
					}
					break;
				}

				case 3: { // player hit object from left
					const penetration =
						player.hitboxRight - obj.hitboxX;

					player.position.x -= penetration;
					player.velocity.x = 0;

					if (!obj.isStatic) {
						const pushStrength = 300;
						obj.velocity.x = Math.min(
							obj.velocity.x + pushStrength / obj.mass,
							120
						);
					}
					break;
				}
			}
		}
	}

	resolveTileCollisions(entity) {
		const tileSize = this.tileSize;

		entity.isOnGround = false;

		// --- Vertical only (for now) ---
		const bottom = entity.hitboxBottom;
		const left = entity.hitboxX;
		const right = entity.hitboxRight;

		const startCol = Math.floor(left / tileSize);
		const endCol = Math.floor((right - 1) / tileSize);
		const row = Math.floor(bottom / tileSize);

		for (let col = startCol; col <= endCol; col++) {
			if (this.isSolidTileAt(col, row)) {
				entity.position.y =
					row * tileSize - entity.hitboxHeight - entity.hitboxOffset.y;

				entity.velocity.y = 0;
				entity.isOnGround = true;
				break;
			}
		}
	}


	/**
	 * FIXED — now passes `context` to layer
	 */
	render(context) {
		 for (const layer of this.tileLayers) {
			layer.render(context);
		}

		for (const obj of this.gameObjects) {
			obj.render(context);
		}
	}

	isSolidTileAt(col, row) {
		const layer = this.tileLayers[Map.COLLISION_LAYER];
		if (!layer) return false;

		const tile = layer.getTile(col, row);
		return tile !== null;
	}
	renderGrid(context) {
		context.save();
		context.strokeStyle = 'rgba(255,255,255,0.2)';
		context.lineWidth = 0.5;

		for (let x = 0; x <= this.width; x++) {
			context.beginPath();
			context.moveTo(x * this.tileSize, 0);
			context.lineTo(x * this.tileSize, this.height * this.tileSize);
			context.stroke();
		}

		for (let y = 0; y <= this.height; y++) {
			context.beginPath();
			context.moveTo(0, y * this.tileSize);
			context.lineTo(this.width * this.tileSize, y * this.tileSize);
			context.stroke();
		}

		context.restore();
	}
}
