import Entity from "../Entity.js";
import Vector from "../../../lib/Vector.js";
import Sprite from "../../../lib/Sprite.js";
import { images } from "../../globals.js";
import ImageName from "../../enums/ImageName.js";

export default class GameObject extends Entity{
    static SAFE_TEMP_MIN = -30;
    static SAFE_TEMP_MAX = 60;
    static STRESS_BUILD_RATE = 0.09;   // slow
    static STRESS_RECOVERY_RATE = 0.04;
    static BREAK_STRESS = 1.0;

    constructor({x, y, map, width, height, type, mass, temp, sprites}) {
        super(x, y, width, height);
        const COLD = -10;
        const HOT = 40;
        const DANGER = 60;

        this.map = map;
        this.type = type;
        this.mass = mass;
        this.temp = temp;
        this.width = width;
        this.height = height;
        this.velocity = new Vector(0, 0);
        this.forces = new Vector(0, 0);
        this.isStatic = false;
        this.stress = 0;
        this.sprite = sprites[0]; 
        this.isSympathyCapable = true;
        this.isHighlighted = false;
        this.isSelected = false;
        this.isBroken = false;
        this.sympathyLinkedItem = null;
        this.link = null;
        this.wasOnGround = false;
        this.isCollidable = true;
        console.log(this)
    }

    update(dt){
        if (this.isStatic || this.isBroken) return;

        const drag = this.getSympathyDragFactor();
        const stressFactor = 1 + this.stress * 3; // tune later
        const ax = this.forces.x / (this.mass * drag * stressFactor);

        const ay = this.forces.y / this.mass;

        this.velocity.x += ax * dt;
        if (ay > 0 && this.isVerticallyLocked()) {
            this.velocity.y = 0;
        } else {
            this.velocity.y += ay * dt;
        }
        if (this.isVerticallyLocked() && this.velocity.y > 0) {
            this.velocity.y = 0;
        }
        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // clear forces
        this.forces.x = 0;
        this.forces.y = 0;

        if (this.isOnGround || this.isVerticallyLocked()) {
            this.velocity.x *= 0.85;
            if (Math.abs(this.velocity.x) < 1) {
                this.velocity.x = 0;
            }
        }
        this.wasOnGround = this.isOnGround;
        this.applyThermalStress(dt);
        this.temp = Math.max(-100, Math.min(this.temp, 100));
        this.checkBreak();
        console.log(this.temp)
    }
    getTempColor() {
        if (this.temp <= -10) {
            return 'rgba(80, 150, 255, 0.35)'; // cold blue
        }
        if (this.temp >= 60) {
            return 'rgba(255, 50, 50, 0.4)'; // danger red
        }
        if (this.temp >= 40) {
            return 'rgba(255, 150, 50, 0.3)'; // hot orange
        }
        return null;
    }
    applyThermalStress(dt) {
        if (
            this.temp < GameObject.SAFE_TEMP_MIN ||
            this.temp > GameObject.SAFE_TEMP_MAX
        ) {
            this.stress += GameObject.STRESS_BUILD_RATE * dt;
        } else {
            this.stress -= GameObject.STRESS_RECOVERY_RATE * dt;
        }

        this.stress = Math.max(0, Math.min(this.stress, 1));
    }

    loadSprite(type) {
        switch (type) {
            case "Crate": {
                const TILE_SIZE = 16;

                const crateTileIndex = 5;

                const tilesetGraphic = images.get(ImageName.Tiles);

                const tilesPerRow = tilesetGraphic.width / TILE_SIZE;

                const sx = (crateTileIndex % tilesPerRow) * TILE_SIZE;
                const sy = Math.floor(crateTileIndex / tilesPerRow) * TILE_SIZE;

                return new Sprite(
                    tilesetGraphic,
                    sx,
                    sy,
                    TILE_SIZE,
                    TILE_SIZE
                );
            }
            case "Barrel": {
                const TILE_SIZE = 16;

                const barrelTileIndex = 6;

                const tilesetGraphic = images.get(ImageName.Tiles);

                const tilesPerRow = tilesetGraphic.width / TILE_SIZE;

                const sx = (barrelTileIndex % tilesPerRow) * TILE_SIZE;
                const sy = Math.floor(barrelTileIndex / tilesPerRow) * TILE_SIZE;

                return new Sprite(
                    tilesetGraphic,
                    sx,
                    sy,
                    TILE_SIZE,
                    TILE_SIZE
                );
            }

            default:
                return null;
        }
    }
    getStressLevel() {
        if (this.stress < 0.3) return 0;
        if (this.stress < 0.6) return 1;
        if (this.stress < 0.85) return 2;
        return 3;
    }

    getStressShake() {
        if (this.stress < 0.6) return { x: 0, y: 0 };

        const intensity = this.stress * 1.5;
        return {
            x: (Math.random() - 0.5) * intensity,
            y: (Math.random() - 0.5) * intensity
        };
    }

    render(ctx) {
        if (!this.sprite || this.isBroken) return;


        const shake = this.getStressShake();
        const tempColor = this.getTempColor();

        ctx.save();

        // ---- TEMP TINT ----
        if (tempColor) {
            ctx.fillStyle = tempColor;
        }

        this.sprite.render(
            ctx,
            Math.floor(this.position.x + shake.x),
            Math.floor(this.position.y + shake.y)
        );

        // Overlay tint AFTER sprite
        if (tempColor) {
            ctx.globalCompositeOperation = 'source-atop';
            ctx.fillRect(
                Math.floor(this.position.x),
                Math.floor(this.position.y),
                this.width,
                this.height
            );
            ctx.globalCompositeOperation = 'source-over';
        }

        ctx.restore();
        const level = this.getStressLevel();

        ctx.save();

        // --- VISUAL EFFECTS ---
        if (level >= 1) {
            ctx.globalAlpha = 1 - this.stress * 0.25;
        }

        if (level >= 2) {
            ctx.filter = `hue-rotate(-20deg) saturate(1.2)`;
        }

        if (level >= 3) {
            if (Math.floor(performance.now() / 150) % 2 === 0) {
                ctx.filter = `brightness(1.4) contrast(1.4)`;
            }
        }
        if (this.stress > 0.6) {
            ctx.strokeStyle = `rgba(0,0,0,${this.stress})`;
            ctx.strokeRect(
                this.position.x + 3,
                this.position.y + 3,
                this.width - 6,
                this.height - 6
            );
        }
        this.sprite.render(
            ctx,
            Math.floor(this.position.x + shake.x),
            Math.floor(this.position.y + shake.y)
        );

        ctx.restore();

        // --- Selection / Highlight ---
        if (this.isHighlighted || this.isSelected) {
            ctx.save();
            ctx.strokeStyle = "rgba(100, 200, 255, 0.9)";
            ctx.lineWidth = 2;
            ctx.strokeRect(
                this.position.x - 1,
                this.position.y - 1,
                this.dimensions.x + 2,
                this.dimensions.y + 2
            );
            ctx.restore();
        }
    }
    checkBreak() {
        if (this.isBroken) return;

        if (this.stress >= GameObject.BREAK_STRESS) {
            this.breakObject();
        }
    }
    breakObject() {
        this.isBroken = true;
        this.isStatic = true;
        this.isCollidable = false;

        this.velocity.x = 0;
        this.velocity.y = 0;
        this.forces.x = 0;
        this.forces.y = 0;

        // Kill sympathy safely
        if (this.link) {
            this.link.break();
        }

        this.sympathyLinkedItem = null;
        this.link = null;
    }

    calculateSize(){
        return this.width*this.height
    }

    canMoveInDirection(force) {
        if (
            force.y > 0 &&
            (
                this.wasOnGround ||
                (this.sympathyLinkedItem && this.sympathyLinkedItem.wasOnGround)
            )
        ) {
            return { x: force.x, y: 0 };
        }

        return force;
    }
    applyForce(force) {
        if(this.sympathyLinkedItem){
            this.sympathyLinkedItem.applySympathyForce(force)
        }
        
        this.forces.x += force.x;
        this.forces.y += force.y;
    }

    applySympathyForce(force){
        const clamped = this.canMoveInDirection(force);
        this.forces.x += clamped.x;
        this.forces.y += clamped.y;
    }

    isVerticallyLocked() {
        return (
            this.sympathyLinkedItem &&
            (
                this.wasOnGround ||
                this.sympathyLinkedItem.wasOnGround
            )
        );
    }
    getSympathyDragFactor() {
        if (!this.sympathyLinkedItem) return 1;

        const stressPenalty = (this.stress + this.sympathyLinkedItem.stress) * 0.5;

        return 1 + (1 - this.link.similarity) + stressPenalty;
    }
}