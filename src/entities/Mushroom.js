import Entity from './Entity.js';
import { powerUpSpriteConfig } from '../../config/SpriteConfig.js';
import Sprite from '../../lib/Sprite.js';
import Tile from '../services/Tile.js';
import Graphic from '../../lib/Graphic.js';
import Map from '../services/Map.js';
import { timer } from '../globals.js';

export default class Mushroom extends Entity {
   /**
     * Creates a new Coin instance.
     * @param {number} x - The initial x-coordinate.
     * @param {number} y - The initial y-coordinate.
     * @param {number} width - The width of the Coin.
     * @param {number} height - The height of the Coin.
     * @param {Graphic} spriteSheet - The sprite sheet containing Coin graphics.
     * @param {Map} map - The game map instance.
     */
    constructor(x, y, width, height, spriteSheet,map) {
        super(x, y, width, height);
        this.map = map;
        this.isCollected = false;
        this.isSpawned = false;
        this.speed = 50;
        this.direction = 1; 
        this.gravity = 800; 
        this.verticalSpeed = 0; 

        this.isVisible = true;
        this.lifetimeDuration = 10;
        this.flashInterval = 0.1;

       this.sprites = powerUpSpriteConfig.mushroom.map(
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
    }

    update(dt) {
        if (!this.isSpawned || this.isCollected) {
            return;
        }
        this.updateMovement(dt);
    }

    render(context){
        if (!this.isSpawned || this.isCollected || !this.isVisible) {
            return;
        }
        context.save();
        
        this.currentSprite.render(this.position.x,this.position.y);
        context.restore();

    }
    
    updateMovement(dt) {
		// Apply gravity
		this.verticalSpeed += this.gravity * dt;
		this.position.y += this.verticalSpeed * dt;

		// Move horizontally
		this.position.x += this.direction * this.speed * dt;

		// Check for collisions
		this.checkCollisions();
	}

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

    collected() {
        this.isCollected = true;
    }

    spawn() {
        this.isSpawned = true;
        this.activateLifetime();
    }

	onCollideWithPlayer(player) {
		if (!this.isCollected && this.collidesWith(player)) {
            this.collected();
            
            player.grow();
        }
	}

    async activateLifetime() {
        const visibleDuration = this.lifetimeDuration - 3;

        await timer.wait(visibleDuration);

        const flashTask = () => {
            if (this.isCollected) 
                return;

            timer.addTask(
                () => {
                    this.isVisible = !this.isVisible;
                },
                this.flashInterval,
                3, 
                () => {
                    this.isVisible = false;
                    this.isCollected = true;
                }
            );
        };

        flashTask();
    }
}