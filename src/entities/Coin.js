import Entity from './Entity.js';
import Animation from '../../lib/Animation.js';
import { coinSpriteConfig } from '../../config/SpriteConfig.js';
import Sprite from '../../lib/Sprite.js';
import Tile from '../services/Tile.js';
import Graphic from '../../lib/Graphic.js';
import Map from '../services/Map.js';
import Player from './player/Player.js';
import { sounds } from '../globals.js';
import SoundName from '../enums/SoundName.js';

export default class Coin extends Entity {
   /**
	 * Creates a new Coin instance.
	 * @param {number} x - The initial x-coordinate.
	 * @param {number} y - The initial y-coordinate.
	 * @param {number} width - The width of the Coin.
	 * @param {number} height - The height of the Coin.
	 * @param {Graphic} spriteSheet - The sprite sheet containing Coin graphics.
	 */
    constructor(x, y, width, height, spriteSheet) {
        super(x, y, width, height);
     
        this.isCollected = false;
        
        this.spinningAnimation = new Animation(
            coinSpriteConfig.coin.map(
                (frame) =>
                    new Sprite(
                        spriteSheet,
                        frame.x,
                        frame.y,
                        frame.width,
                        frame.height
                    )
            ),
            0.1 // Animation interval
        );   
    }

    update(dt) {
        this.spinningAnimation.update(dt);
    }

    render(context){
        context.save();
        
        this.spinningAnimation.getCurrentFrame().render(this.position.x,this.position.y);
        context.restore();

    }


    onCollideWithPlayer(player) {
        if (!this.isCollected && this.collidesWith(player)) {
            this.isCollected = true;
            sounds.play(SoundName.Coin); // Play coin collection sound
        }
    }
}