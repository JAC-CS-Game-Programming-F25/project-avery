import Entity from './Entity.js';
import Sprite from '../../lib/Sprite.js';
import PlayerStateName from '../enums/PlayerStateName.js';
import { loadObjectSprites, objectSpriteConfig } from "../../config/SpriteConfig.js";

export default class Platform extends Entity {
    constructor(x, y, width, height, spriteSheet) {
        super(x, y, width, height);

        this.sprites = loadObjectSprites(spriteSheet, objectSpriteConfig.platform);


        this.currentSprite = this.sprites[0];
        this.playerWasOn = false;
    }

    render(context) {
        this.currentSprite.render(this.position.x, this.position.y);
    }

    onCollideWithPlayer(player) {
        // Snap player on top
        player.position.y = this.position.y - player.dimensions.y;
        player.velocity.y = 0;
        player.isOnGround = true;

        this.playerWasOn = true;

        // Landing transition
        if (player.stateMachine.currentState.name === PlayerStateName.Falling) {
            player.stateMachine.change(PlayerStateName.Idling);
        }
    }

    checkCollision(player) {
        const playerBottom = player.position.y + player.dimensions.y;
        const tolerance = 8;   // increased for 128px sprite
        
        const horizontallyOverlapping =
            player.position.x + player.dimensions.x > this.position.x &&
            player.position.x < this.position.x + this.dimensions.x;

        const verticallyAligned =
            player.velocity.y >= 0 &&
            playerBottom >= this.position.y - tolerance &&
            playerBottom <= this.position.y + this.dimensions.y;

        return horizontallyOverlapping && verticallyAligned;
    }
}
