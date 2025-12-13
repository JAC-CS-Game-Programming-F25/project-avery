import Entity from "../Entity.js";
import Vector from "../../../lib/Vector.js";
import Sprite from "../../../lib/Sprite.js";
import { images } from "../../globals.js";
import ImageName from "../../enums/ImageName.js";

export default class GameObject extends Entity{
    
    constructor(x, y, map, width, height, type, mass, temp, sprites) {
        super(x, y, width, height);

        this.map = map;
        this.type = type;
        this.mass = mass;
        this.temp = temp;
        this.width = width;
        this.height = height;

        this.velocity = new Vector(0, 0);
        this.forces = new Vector(0, 0);
        this.isStatic = false;

        this.sprite = sprites[0]; 
        this.isSympathyCapable = true;
        this.isHighlighted = false;
        this.isSelected = false;

        this.sympathyLink = null;
    }

    update(dt){
        if (this.isStatic) return;

        // F = m * a → a = F / m
        const ax = this.forces.x / this.mass;
        const ay = this.forces.y / this.mass;

        this.velocity.x += ax * dt;
        this.velocity.y += ay * dt;

        this.position.x += this.velocity.x * dt;
        this.position.y += this.velocity.y * dt;

        // clear forces
        this.forces.x = 0;
        this.forces.y = 0;

        if (this.isOnGround) {
            this.velocity.x *= 0.85;
            if (Math.abs(this.velocity.x) < 1) {
                this.velocity.x = 0;
            }
        }
    }

    loadSprite(type) {
        switch (type) {
            case "Crate": {
                const TILE_SIZE = 16;

                const crateTileIndex = 5; // CHANGE THIS

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

            default:
                return null;
        }
    }

    render(ctx) {
        if (!this.sprite) {
            console.warn("NO SPRITE:", this.type);
            return;
        }

        this.sprite.render(
            ctx,
            Math.floor(this.position.x),
            Math.floor(this.position.y)
        );
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
    calculateSize(){
        return this.width*this.height
    }

   applyForce(force, sourceLink = null) {
        this.forces.x += force.x;
        this.forces.y += force.y;

        if (sourceLink) return;

        if (this.sympathyLink && this.sympathyLink.active) {
            this.sympathyLink.transferForce(this, force);
        }
    }
}