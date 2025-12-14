// SympathyLink.js
import GameObject from "../entities/object/GameObject.js";
import Player from "../entities/player/Player.js";
import Vector from "../../lib/Vector.js";
export default class SympathyLink {
    static BASE_DRAIN = 5;
    static LOWER_SIM_CLAMP = 0.2;
    static UPPER_SIM_CLAMP = 0.95;
        
    constructor(objectA, objectB) {

        this.objectA = objectA;
        this.objectB = objectB;

        this.similarity = this._calculateSimilarity();
        this.lossFactor = 1 - this.similarity;

        this.active = true;
    }

    transferHeat(source, deltaTemp) {
        if (!this.active) return;

        const target =
            source === this.objectA
                ? this.objectB
                : this.objectA;

        const transferred = deltaTemp * this.similarity;

        target.temp += transferred;
    }
    /**
     * This calculates the similarity between the two objects based on their properties, it returns a value between 1 and 0
     */
    _calculateSimilarity() {
        let score = 1;

        //mass
        const massDiff = Math.abs(this.objectA.mass - this.objectB.mass);
        score -= massDiff * 0.01;
        console.log(`massDiff ${massDiff}`)
        //temp
        const tempDiff = Math.abs(this.objectA.temp - this.objectB.temp);
        score -= tempDiff * 0.005;

        // size
        const sizeA = this.objectA.calculateSize();
        const sizeB = this.objectB.calculateSize();
        const sizeDiff = Math.abs(sizeA - sizeB);
        score -= sizeDiff * 0.0001;
        console.log(`score ${score}`)
        console.log(`ObjA ${this.objectA.mass}, ObjB ${this.objectB.mass}`)
        return Math.max(SympathyLink.LOWER_SIM_CLAMP, Math.min(score, SympathyLink.UPPER_SIM_CLAMP));
    }

    /**
     * getter for similarity
     */
    getEfficiency() {
        return this.similarity;
    }

    /**
     * Concentration drain per second.
     * Worse matches drain faster.
     */
    getConcentrationDrainRate() {
        
        return SympathyLink.BASE_DRAIN * (1 / this.getEfficiency());
    }
    
    transferForce(fromObj, force) {
        if (!this.active) return;

        const toObj = (fromObj === this.objectA) ? this.objectB : this.objectA;
        if (!toObj) return;

        // Rule: Force_B = Force_A * (1 - lossFactor) == Force_A * similarity
        const scaled = new Vector(force.x * (1 - this.lossFactor), force.y * (1 - this.lossFactor));

        // Apply to the other object, marked as "from this link" to prevent recursion
        toObj.applyForce(scaled, this);
    }
    /**
     * Called every frame while link is active
     */
    update(player, dt) {
        if (!this.active) return;
        const drain = this.getConcentrationDrainRate() * dt;
        player.consumeConcentration(drain)

        if (!player.canUseSympathy()) {
            this.break();
        }
    }

    /**
     * More or less an exit
     */
    break() {
        if (!this.active) return;
        this.active = false;
    }
}
