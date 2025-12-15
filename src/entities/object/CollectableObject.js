import GameObject from "./GameObject.js";

//NOTE: This is a theoretical class, it never actually gets used because I ran out of time but it's designed to work with a few tweaks 
export default class CollectableObject extends GameObject {
    constructor(config) {
        super(config);

        this.isCollectable = true;
        this.collected = false;
        this.value = config.value ?? 1;
    }

    onPlayerCollide(player) {
        if (this.collected) return;

        this.collected = true;
        this.isCollidable = false;

        this.map.removeGameObject(this);

    }
}
