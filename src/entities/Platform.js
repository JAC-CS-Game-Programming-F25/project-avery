import Entity from './Entity.js';
import { objectSpriteConfig } from '../../config/SpriteConfig.js';
import Sprite from '../../lib/Sprite.js';
import Graphic from '../../lib/Graphic.js';
import Map from '../services/Map.js';
import PlayerStateName from '../enums/PlayerStateName.js';
export default class Platform extends Entity {
    /**
     * Creates a new Platform instance.
     * @param {number} x - The initial x-coordinate.
     * @param {number} y - The initial y-coordinate.
     * @param {number} width - The width of the platform.
     * @param {number} height - The height of the platform.
     * @param {Graphic} spriteSheet - The sprite sheet containing platform graphics.
     * @param {Map} map - The game map instance.
     */
    constructor(x, y, width, height, spriteSheet,map) {
        super(x, y, width, height);
        this.map = map;
        
        this.sprites = objectSpriteConfig.platform.map(
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
        this.playerWasOn = false;
    }

    render(context){
        context.save();
        
        this.currentSprite.render(this.position.x,this.position.y);
        context.restore();


    }


    onCollideWithPlayer(player) {
        player.position.y = this.position.y - player.dimensions.y;
        player.velocity.y = 0;
        player.isOnGround = true;
        this.playerWasOn = true;
        
        if (player.stateMachine.currentState.name === PlayerStateName.Falling) {
            player.stateMachine.change(PlayerStateName.Idling);
        }
    }
    
    checkCollision(player) {
        const playerBottom = player.position.y + player.dimensions.y;
        const tolerance = 3; 

        const horizontallyOverlapping =
            player.position.x + player.dimensions.x > this.position.x &&
            player.position.x < this.position.x + this.dimensions.x;

        if (
            horizontallyOverlapping &&
            player.velocity.y >= 0 &&                              
            playerBottom >= this.position.y - tolerance &&         
            playerBottom <= this.position.y + this.dimensions.y     
        ) {
            return true;
        }

        return false;
    }


    updatePlayerStatus(player) {
        const horizontallyOverlapping =
            player.position.x + player.dimensions.x > this.position.x &&
            player.position.x < this.position.x + this.dimensions.x;

        const onPlatformVertically = 
            Math.abs((player.position.y + player.dimensions.y) - this.position.y) < 2;

        if (this.playerWasOn && (!horizontallyOverlapping || !onPlatformVertically)) {
            this.playerWasOn = false;
           
        }
    }
    
}   