import { images, sounds, timer } from '../../globals.js';
import {
	loadPlayerSprites,
	smallSpriteConfig,
	bigSpriteConfig,
} from '../../../config/SpriteConfig.js';
import Vector from '../../../lib/Vector.js';
import ImageName from '../../enums/ImageName.js';
import Animation from '../../../lib/Animation.js';
import Map from '../../services/Map.js';
import Entity from '../Entity.js';
import StateMachine from '../../../lib/StateMachine.js';
import PlayerStateName from '../../enums/PlayerStateName.js';
import PlayerWalkingState from './PlayerWalkingState.js';
import PlayerJumpingState from './PlayerJumpingState.js';
import PlayerSkiddingState from './PlayerSkiddingState.js';
import PlayerFallingState from './PlayerFallingState.js';
import PlayerIdlingState from './PlayerIdlingState.js';
import SoundName from '../../enums/SoundName.js';
/**
 * Represents the player character in the game.
 * @extends Entity
 */
export default class Player extends Entity {
	/**
	 * Creates a new Player instance.
	 * @param {number} x - The initial x-coordinate.
	 * @param {number} y - The initial y-coordinate.
	 * @param {number} width - The width of the player.
	 * @param {number} height - The height of the player.
	 * @param {Map} map - The game map instance.
	 */
	constructor(x, y, width, height, map) {
		super(x, y, width, height);

		this.initialPosition = new Vector(x, y);
		this.position = new Vector(x, y);
		this.dimensions = new Vector(width, height);
		this.velocity = new Vector(0, 0);
		this.map = map;

		this.facingRight = true;

		this.isBig = false;
		this.isGrowing = false;

		this.isShrinking = false;
		this.isInvincible = false;
		this.isVisible = true; 
		this.invincibilityDuration = 2;
		this.flashInterval = 0.1;
		// Load player sprites
		this.smallSprites = loadPlayerSprites(
			images.get(ImageName.Mario),
			smallSpriteConfig
		);

		this.bigSprites = loadPlayerSprites(
			images.get(ImageName.Mario),
			bigSpriteConfig
		);

		this.growAnimation = new Animation(this.smallSprites.grow, 0.1,1);
		// Create animations for different player states
		this.smallAnimations = {
			idle: new Animation(this.smallSprites.idle),
			walk: new Animation(this.smallSprites.walk, 0.07),
			jump: new Animation(this.smallSprites.jump),
			fall: new Animation(this.smallSprites.fall),
			skid: new Animation(this.smallSprites.skid),
		};

		this.bigAnimations = {
			idle: new Animation(this.bigSprites.idle),
			walk: new Animation(this.bigSprites.walk, 0.07),
			jump: new Animation(this.bigSprites.jump),
			fall: new Animation(this.bigSprites.fall),
			skid: new Animation(this.bigSprites.skid),
		};


		this.animations = this.smallAnimations;

		this.currentAnimation = this.animations.idle;

		// Initialize state machine for player behavior
		this.stateMachine = new StateMachine();

		this.stateMachine.add(
			PlayerStateName.Walking,
			new PlayerWalkingState(this)
		);
		this.stateMachine.add(
			PlayerStateName.Jumping,
			new PlayerJumpingState(this)
		);
		this.stateMachine.add(
			PlayerStateName.Skidding,
			new PlayerSkiddingState(this)
		);
		this.stateMachine.add(
			PlayerStateName.Falling,
			new PlayerFallingState(this)
		);
		this.stateMachine.add(
			PlayerStateName.Idling,
			new PlayerIdlingState(this)
		);

	}

	/**
	 * Updates the player's state.
	 * @param {number} dt - The time passed since the last update.
	 */
	update(dt) {
		
		this.checkGoombaCollision();
		this.checkCoinCollision();

		if (!this.isGrowing){
			this.stateMachine.update(dt);
		} else{
			this.currentAnimation.update(dt);
		}
		this.checkMushroomCollision();
		this.checkPlatformCollision();

		if (this.isBig && this.animations !== this.bigAnimations) {
			this.animations = this.bigAnimations;
			this.updateCurrentAnimation();
		} else if (!this.isBig && this.animations !== this.smallAnimations) {
			this.animations = this.smallAnimations;
			this.updateCurrentAnimation();
		}
	}

	updateCurrentAnimation() {
		const stateName = this.stateMachine.currentState.name;
		
		switch(stateName) {
			case 'idling':
				this.currentAnimation = this.animations.idle;
				break;
			case 'walking':
				this.currentAnimation = this.animations.walk;
				break;
			case 'jumping':
				this.currentAnimation = this.animations.jump;
				break;
			case 'falling':
				this.currentAnimation = this.animations.fall;
				break;
			case 'skidding':
				this.currentAnimation = this.animations.skid;
				break;
			default:
				this.currentAnimation = this.animations.idle;
		}
	}

	/**
	 * Renders the player.
	 * @param {CanvasRenderingContext2D} context - The rendering context.
	 */
	render(context) {
	
		if (this.isVisible) {
			if (this.isGrowing || this.isShrinking) {
				context.save();
				
				if (this.facingRight) {
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
				
				this.currentAnimation.getCurrentFrame().render(0, 0);
				context.restore();
			} else {
				this.stateMachine.render(context);
			}
		}
	}

	/**
	 * Checks for collisions with Goombas.
	 */
	checkGoombaCollision = () => {
		this.map.goombas.forEach((goomba) => {
			if (this.collidesWith(goomba) && !goomba.isDead) {
				goomba.onCollideWithPlayer(this);
			}
		});
	};

	checkCoinCollision = () => {
		this.map.coins.forEach((coin) => {
			if (this.collidesWith(coin) && !coin.isCollected) {
				coin.onCollideWithPlayer(this);
			}
		});
	};
	
	checkMushroomCollision = () => {
		this.map.mushrooms.forEach((mushroom) => {
			if (this.collidesWith(mushroom) && !mushroom.isCollected && mushroom.isSpawned) {
				mushroom.onCollideWithPlayer(this);
			}
		});
	};
	checkPlatformCollision = () => {
		this.map.platforms.forEach((platform) => {
			if (platform.checkCollision(this)) {
				platform.onCollideWithPlayer(this);
			}
			platform.updatePlayerStatus(this);
		});

	};

	async grow(){
		if (this.isGrowing || this.isBig)
			return;

		this.isGrowing = true;
		sounds.play(SoundName.Powerup);

		const bottomY = this.position.y + this.dimensions.y;

		this.dimensions.y = 32;
		this.position.y = bottomY - 32;
		

		this.currentAnimation = this.growAnimation;
		this.growAnimation.refresh();

		const growDuration = this.growAnimation.frames.length * this.growAnimation.interval;
		
		await timer.wait(growDuration);

		this.isBig = true;
		this.isGrowing = false;

		this.animations = this.bigAnimations;
		this.updateCurrentAnimation();
	}

	async hit() {
		if (this.isInvincible) {
			return;
		}

		if (this.isBig) {
			this.isShrinking = true;
			sounds.play(SoundName.Pipe);

			const feetY = this.position.y + this.dimensions.y;
			const alignedFeetY = Math.floor(feetY / 16) * 16;

			this.currentAnimation = this.growAnimation;
			this.growAnimation.refresh();
			
			const growDuration = this.growAnimation.frames.length * this.growAnimation.interval;

			await timer.wait(growDuration)

			this.isBig = false;
			this.isShrinking = false;
			this.dimensions.y = 24;
			
			this.position.y = alignedFeetY - 16;
			
			this.velocity.y = 0;
			this.isOnGround = true;
			
			
			this.activateInvincibility();
		} else {
			this.die();
		}
}

	/**
	 * Handles player death by resetting position.
	 */
	die() {
		this.position.set(this.initialPosition.x, this.initialPosition.y);
	}

	async activateInvincibility() {
		this.isInvincible = true;

		const flashTask = () => {
			timer.addTask(
				() => {
					this.isVisible = !this.isVisible;
				},
				this.flashInterval,
				this.invincibilityDuration
			);
		};
		
		flashTask();
		
	
		await timer.wait(this.invincibilityDuration);
		
		
		this.isInvincible = false;
		this.isVisible = true; 
	}
}
