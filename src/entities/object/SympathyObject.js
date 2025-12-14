import GameObject from "./GameObject.js";

export default class SympathyObject extends GameObject {
  constructor(config) {
    super(config);

    this.isSympathyCapable = true;
    this.sympathyLinkedItem = null;
    this.link = null;
    this.isSupportingWeight = false;
  }

  breakObject() {
    // preserve base behavior
    super.breakObject();

    // sympathy-specific cleanup
    this.sympathyLinkedItem = null;
    this.link = null;
  }
  canParticipateInSympathy() {
    return true;
  }
    canMoveInDirection(force) {
        console.log(`${this.sympathyLinkedItem !== null }&& ${this.sympathyLinkedItem.wasOnGround} && ${this.wasOnGround}`)
        if (
            // force.y > 0 &&
            (
                this.wasOnGround ||
                (this.sympathyLinkedItem && this.sympathyLinkedItem.wasOnGround)
            )
        ) {
            return { x: force.x, y: 0 };
        }
            console.log("HIT")

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
        console.log(this.canMoveInDirection(force))
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
