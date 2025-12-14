import Entity from "../Entity.js";
import Vector from "../../../lib/Vector.js";
import StateMachine from "../../../lib/StateMachine.js";
import Animation from "../../../lib/Animation.js";

import {
    loadPlayerSprites,
    playerSpriteConfig
} from "../../../config/SpriteConfig.js";

import PlayerStateName from "../../enums/PlayerStateName.js";
import PlayerWalkingState from "./PlayerWalkingState.js";
import PlayerIdlingState from "./PlayerIdlingState.js";
import PlayerJumpingState from "./PlayerJumpingState.js";
import PlayerFallingState from "./PlayerFallingState.js";

export default class Player extends Entity {
    constructor(x, y, map) {
        super(x, y, 64, 64);   
        this.map = map;
        this.scale = 0.5;
        this.facingRight = true;
        this.loaded = false;

        this.sprites = {};
        this.animations = {};
        this.currentAnimation = null;

        this.hitboxSize.set(10, 35);    
        this.hitboxOffset.set(27, 30);  
        //sympathy stuff
        this.maxConcentration = 100;
        this.currentConcentration = this.maxConcentration
        this.link = null;

        this.loadSprites();

        this.stateMachine = new StateMachine();
        this.stateMachine.add(PlayerStateName.Idling, new PlayerIdlingState(this));
        this.stateMachine.add(PlayerStateName.Walking, new PlayerWalkingState(this));
        this.stateMachine.add(PlayerStateName.Jumping, new PlayerJumpingState(this));
        this.stateMachine.add(PlayerStateName.Falling, new PlayerFallingState(this));
    }
    reset(x, y) {
        // Reset position safely
        this.position.set(x, y);

        // Reset motion
        this.velocity.set(0, 0);

        this.isOnGround = false;

        // Reset player-specific state
        this.resetConcentration();
        this.facingRight = true;

        // Reset animation/state
        this.stateMachine.change(PlayerStateName.Idling);
    }

    async loadSprites() {
        this.sprites = await loadPlayerSprites(playerSpriteConfig);

        this.animations = {
            idle: new Animation(this.sprites.idle, 0.12),
            walk: new Animation(this.sprites.walk, 0.08),
            jump: new Animation(this.sprites.jump, 0.12),
            fall: new Animation(this.sprites.jump, 0.12),
        };

        this.currentAnimation = this.animations.idle;
        this.loaded = true;

        this.stateMachine.change(PlayerStateName.Idling);
    }

    update(dt) {
        if (!this.loaded || !this.currentAnimation) return;

        this.stateMachine.update(dt);
        this.currentAnimation.update(dt);

    }

   render(ctx) {
        super.render(ctx)
        if (!this.loaded || !this.currentAnimation) return;

        ctx.save();

        const scale = this.scale;
        const frame = this.currentAnimation.getCurrentFrame();
        const drawW = frame.width * scale;  

        if (this.facingRight) {
            ctx.translate(this.position.x, this.position.y);
            ctx.scale(scale, scale);
            frame.render(ctx, 0, 0);
        } else {
            ctx.translate(this.position.x + drawW, this.position.y);
            ctx.scale(-scale, scale);
            frame.render(ctx, 0, 0);
        }

        ctx.restore();
    }



    setAnimation(name) {
        if (!this.loaded) return;
        this.currentAnimation = this.animations[name] ?? this.animations.idle;
    }

    canUseSympathy(){
        return this.currentConcentration > 0;
    }

    consumeConcentration(amount){
        if (!this.canUseSympathy()) return;
        this.currentConcentration = Math.max(0,this.currentConcentration - amount)
    }
    restoreConcentration(amount){
        this.currentConcentration = Math.min(this.maxConcentration,this.currentConcentration + amount)
    }
    resetConcentration(){
        this.currentConcentration = this.maxConcentration
    }
}