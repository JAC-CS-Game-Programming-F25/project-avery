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
        player.position.y =
            this.position.y - player.hitboxOffset.y - player.hitboxHeight;

        player.velocity.y = 0;
        player.isOnGround = true;
    }

    checkCollision(player) {
        const tolerance = 6;

        const playerBottom = player.hitboxBottom;
        const playerTop = player.hitboxY;

        const horizontallyOverlapping =
            player.hitboxRight > this.position.x &&
            player.hitboxX < this.position.x + this.dimensions.x;

        const verticallyAligned =
            player.velocity.y >= 0 &&
            playerBottom >= this.position.y &&
            playerBottom <= this.position.y + tolerance;

        return horizontallyOverlapping && verticallyAligned;
    }
}
