import GameObject from "./GameObject.js";

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

        player.addScore?.(this.value);
    }
}
