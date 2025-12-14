import Sprite from '../../lib/Sprite.js';
import ImageName from '../enums/ImageName.js';
import Tile from './Tile.js';
import Layer from './Layer.js';
import { debugOptions, images } from '../globals.js';
import GameObject from '../entities/object/GameObject.js'
import { loadObjectSprites, objectSpriteConfig } from '../../config/SpriteConfig.js';
import Vector from '../../lib/Vector.js';
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
        this.collisionLayer = null;

		this.objectLayer = null;
		this.tempZones = [];
		for (const layer of mapDefinition.layers) {
			if (layer.type === 'tilelayer') {
                const tileLayer = new Layer(layer, sprites);

                if (layer.name === 'Collision') {
                    this.collisionLayer = tileLayer;
                } else {
                    this.tileLayers.push(tileLayer); // visual / foreground only
                }
            }


			if (layer.type === 'objectgroup' && layer.name === 'Objects') {
				this.objectLayer = layer;
			}
			if (layer.type === 'objectgroup' && layer.name === 'TempZones') {
				this.tempZones = layer.objects;
			}
		}

		this.objectSprites = {
			Crate: loadObjectSprites(
				images.get(ImageName.Tiles),     
				objectSpriteConfig.Crate        
			),
			Barrel: 
			loadObjectSprites(
				images.get(ImageName.Tiles),     
				objectSpriteConfig.Barrel        
			),
		};
		this.gameObjects = [];
	
		this.loadObjects();
	}

	applyAmbientTemp(obj, dt) {
		const AMBIENT = 20;
		const RATE = 3;

		obj.temp += (AMBIENT - obj.temp) * RATE * dt * 0.01;
	}	
	applyTemperatureZones(dt) {
		for (const obj of this.gameObjects) {
			for (const zone of this.tempZones) {
				if (!this.objectInsideZone(obj, zone)) continue;

				const props = this.parseProperties(zone.properties);
				const deltaPerSecond = Number(props.TempDelta ?? 0);

				if (deltaPerSecond === 0) continue;

				const appliedDelta = deltaPerSecond * dt;

				// Apply to object inside zone
				obj.temp += appliedDelta;

				// Sympathy transfer
				if (obj.link) {
					obj.link.transferHeat(obj, appliedDelta);
				}
			}
		}
	}


	objectInsideZone(obj, zone) {
		return (
			obj.position.x < zone.x + zone.width &&
			obj.position.x + obj.width > zone.x &&
			obj.position.y < zone.y + zone.height &&
			obj.position.y + obj.height > zone.y
		);
	}

	loadObjects() {
		if (!this.objectLayer) return;

		for (const obj of this.objectLayer.objects) {
			const sprites = this.objectSprites[obj.type];

			if (!sprites) {
				alert(`No sprites for object type: ${obj.type}`);
				continue;
			}
 			const props = this.parseProperties(obj.properties);
			
			const gameObject = new GameObject({
				x: obj.x,
				y: obj.y - obj.height, 
				map: this,
				width: obj.width,
				height: obj.height,
				type: obj.type,
				mass: Number(props.Weight),      
				temp: 20,     
				sprites: sprites,}
				
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
		this.resolveObjectObjectCollisions();
		this.resolveObjectObjectSideCollisions();
		this.applyTemperatureZones(dt);
        this.removeBrokenObjects();


	}

	renderTempZones(ctx) {
		if (!this.tempZones) return;

		for (const zone of this.tempZones) {
			const props = this.parseProperties(zone.properties);
			const delta = Number(props.TempDelta ?? 0);

			if (delta === 0) continue;

			ctx.save();

			// Heat vs cold
			ctx.fillStyle =
				delta > 0
					? 'rgba(255, 120, 40, 0.25)'   // heat zone
					: 'rgba(80, 150, 255, 0.25)'; // cold zone

			ctx.fillRect(zone.x, zone.y, zone.width, zone.height);

			// Subtle animated shimmer
			ctx.strokeStyle =
				delta > 0
					? 'rgba(255, 180, 80, 0.6)'
					: 'rgba(120, 180, 255, 0.6)';

			ctx.lineWidth = 1;
			ctx.strokeRect(zone.x, zone.y, zone.width, zone.height);

			ctx.restore();
		}
	}

	resolveGameObjectCollisions(player) {
		const pushStrength = 10000; 

		for (const obj of this.gameObjects) {
			if (!obj.isCollidable) continue;
			if (!player.collidesWith(obj)) continue;

			const dir = player.getCollisionDirection(obj);

			switch (dir) {
				case 1: { 
					const penetration =
						player.hitboxBottom - obj.hitboxY;

					player.position.y -= penetration;
					player.velocity.y = 0;
					player.isOnGround = true;

					obj.applyForce({
						x: 0,
						y: player.mass ? player.mass * 200 : 200
					});
					if (player.velocity.y >= 0) {
						player.isOnGround = true;
					}
					break;
				}

				case 2: { // player hit object from right
					const penetration =
						obj.hitboxRight - player.hitboxX;

					// Separate player
					player.position.x += penetration;
					player.velocity.x = 0;

					if (!obj.isStatic) {
						obj.applyForce(new Vector(-pushStrength, 0));

					}
					break;
				}

				case 3: { // player hit object from left
					const penetration =
						player.hitboxRight - obj.hitboxX;

					player.position.x -= penetration;
					player.velocity.x = 0;

					if (!obj.isStatic) {
						obj.applyForce(new Vector(pushStrength, 0));

					}
					break;
				}
			}
		}
	}

	resolveTileCollisions(entity) {
		const tileSize = this.tileSize;

		// entity.isOnGround = false;

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

		this.renderTempZones(context);

		for (const obj of this.gameObjects) {
			obj.render(context);
		}
	}
    isSolidTileAt(col, row) {
        if (!this.collisionLayer) return false;

        const tile = this.collisionLayer.getTile(col, row);
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

	resolveObjectObjectCollisions() {
		for (let i = 0; i < this.gameObjects.length; i++) {
			const a = this.gameObjects[i];
			if (a.isStatic) continue;

			for (let j = 0; j < this.gameObjects.length; j++) {
				if (i === j) continue;

				const b = this.gameObjects[j];

				// Only resolve if A is falling onto B
				if (a.velocity.y <= 0) continue;

				if (!a.collidesWith(b)) continue;

				// Check that A is above B
				const penetration = a.hitboxBottom - b.hitboxY;
				if (penetration <= 0) continue;

				// Snap A onto B
				a.position.y -= penetration;
				a.velocity.y = 0;
				a.isOnGround = true;
			}
		}
	}

    resolveObjectObjectSideCollisions() {
		for (let i = 0; i < this.gameObjects.length; i++) {
			const a = this.gameObjects[i];
			if (a.isStatic) continue;
			if (Math.abs(a.velocity.x) < 0.01) continue;
			for (let j = 0; j < this.gameObjects.length; j++) {
				if (i === j) continue;

				const b = this.gameObjects[j];
				if (!a.collidesWith(b)) continue;

				// Vertical overlap check
				const verticalOverlap =
					a.hitboxBottom > b.hitboxY &&
					a.hitboxY < b.hitboxBottom;

				if (!verticalOverlap) continue;

				const overlapLeft = a.hitboxRight - b.hitboxX;
				const overlapRight = b.hitboxRight - a.hitboxX;

				let pushDir = 0;
				let penetration = 0;

				if (overlapLeft < overlapRight) {
					pushDir = -1;
					penetration = overlapLeft;
				} else {
					pushDir = 1;
					penetration = overlapRight;
				}

				// Snap A out of B
				a.position.x -= penetration * pushDir;

				// --- NEW LOGIC ---
				if (!b.isStatic) {
					// Transfer motion instead of stopping
					const transfer = a.velocity.x;

					b.velocity.x += transfer * 0.9; // loss factor
					a.velocity.x *= 0.1;            // resistance
				} else {
					// Solid object: stop A
					a.velocity.x = 0;
				}
			}
		}
	}

    destroy() {
        // Clear dynamic objects
        this.gameObjects.length = 0;

        // Clear zones & layers
        this.tempZones.length = 0;
        this.tileLayers.length = 0;

        // Remove references
        this.objectLayer = null;

        // Defensive: prevent accidental reuse
        this.width = 0;
        this.height = 0;
    }

    removeBrokenObjects() {
        this.gameObjects = this.gameObjects.filter(obj => {
            if (!obj.isBroken) return true;

            // Clean sympathy link if present
            if (obj.link) {
                obj.link.destroy?.();
                obj.link = null;
            }

            return false;
        });
    }


}
