import State from '../../../lib/State.js';
import { PlayerConfig } from '../../../config/PlayerConfig.js';
import CollisionDetector from '../../services/CollisionDetector.js';
import { input } from '../../globals.js';
import Input from '../../../lib/Input.js';

export default class PlayerState extends State {
    constructor(player) {
        super();
        this.player = player;
        this.collisionDetector = new CollisionDetector(player.map);
    }

    update(dt) {
        this.applyGravity(dt);
        this.updatePosition(dt);
    }

    applyGravity(dt) {
        if (!this.player.isOnGround) {
            this.player.velocity.y = Math.min(
                this.player.velocity.y + PlayerConfig.gravity * dt,
                PlayerConfig.maxFallSpeed
            );
        }
    }

    updatePosition(dt) {
        this.player.isOnGround = false;

        // Horizontal
        const dx = this.player.velocity.x * dt;
        this.player.position.x += dx;
        this.collisionDetector.checkHorizontalCollisions(this.player);

        // Vertical
        const dy = this.player.velocity.y * dt;
        this.player.position.y += dy;
        this.collisionDetector.checkVerticalCollisions(this.player);
        this.player.map.resolveGameObjectCollisions(this.player);

        const maxX =
            this.player.map.width * 16 -
            (this.player.hitboxOffset.x + this.player.hitboxWidth);

        this.player.position.x = Math.max(
            -this.player.hitboxOffset.x,
            Math.min(Math.round(this.player.position.x), maxX)
        );


        this.player.position.y = Math.round(this.player.position.y);
    }

    handleHorizontalMovement() {
        if (input.isKeyHeld(Input.KEYS.A)) {
            this.player.velocity.x = Math.max(
                this.player.velocity.x - PlayerConfig.acceleration,
                -PlayerConfig.maxSpeed
            );
            this.player.facingRight = false;

        } else if (input.isKeyHeld(Input.KEYS.D)) {
            this.player.velocity.x = Math.min(
                this.player.velocity.x + PlayerConfig.acceleration,
                PlayerConfig.maxSpeed
            );
            this.player.facingRight = true;

        } else {
            // slow down
            if (this.player.velocity.x > 0) {
                this.player.velocity.x = Math.max(0, this.player.velocity.x - PlayerConfig.deceleration);
            } else {
                this.player.velocity.x = Math.min(0, this.player.velocity.x + PlayerConfig.deceleration);
            }
        }

        if (Math.abs(this.player.velocity.x) < 0.01) this.player.velocity.x = 0;
    }
}
