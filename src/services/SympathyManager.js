import Player from "../entities/player/Player.js"; 
import SympathyLink from "./SympathyLink.js";
export default class SympathyManager{
    constructor(player) {
        this.player = player;
        this.activeLink = null;
    }

    createLink(obj1,obj2){
        if (this.activeLink) return false;
        if (!this.player.canUseSympathy()) return false;

        this.activeLink = new SympathyLink(obj1, obj2);
        return true;
    }

    breakLink() {
        if (!this.activeLink) return;
        this.activeLink.break();
        this.activeLink = null;
    }

    update(dt) {
        if (this.activeLink?.active) {
            this.activeLink.update(this.player, dt);

            if (!this.activeLink.active) {
                this.activeLink = null;
            }
        } else {
            this.regenerateConcentration(dt);
        }
    }

    regenerateConcentration(dt) {
        const REGEN_RATE = 8; // tunable
        this.player.restoreConcentration(REGEN_RATE * dt)
    }

    hasActiveLink() {
        return !!this.activeLink;
    }

    applyForce(force) {
        const effectiveForce = force * this.efficiency;
        this.objectA.applyForce(effectiveForce);
        this.objectB.applyForce(effectiveForce * (1 - this.lossFactor));
    }
}