import Input from "../../lib/Input.js";
import Player from "../entities/player/Player.js"; 
import { input } from "../globals.js";
import SympathyLink from "./SympathyLink.js";
export default class SympathyManager{
    constructor(player) {
        this.player = player;

        this.active = false;

        this.viableObjects = [];
        this.selectionIndex = 0;

        this.firstSelection = null;
        this.secondSelection = null;

        this.links = [];
    }

    createLink(obj1,obj2){
        if (this.activeLink) return false;
        if (!this.player.canUseSympathy()) return false;

        this.activeLink = new SympathyLink(obj1, obj2);

        obj1.sympathyLink = this.activeLink;
        obj2.sympathyLink = this.activeLink;
        return true;
    }

    breakLink() {
        if (!this.activeLink) return;
        this.activeLink.break();
        this.activeLink = null;
        this.player.link = null
        for (const obj of this.viableObjects) {
            obj.isSelected = false;
        }
        // this.activeLink.objectA.sympathyLink = null;
        // this.activeLink.objectB.sympathyLink = null;
        
        this.exit();
    }

    update(dt) {
       
        if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
            this.breakLink();
        }
        if(this.activeLink){
            this.activeLink.update(this.player,dt)
            if (!this.activeLink.active) 
            {
                this.breakLink() 
                return;
            }
        } else{
            this.regenerateConcentration(dt);
        }
        if (!this.active) return;
        if (this.viableObjects.length === 0) return;

        if (input.isKeyPressed(Input.KEYS.ARROW_RIGHT)) {
            this.selectionIndex =
                (this.selectionIndex + 1) % this.viableObjects.length;
            this.updateHighlight();
        }

        if (input.isKeyPressed(Input.KEYS.ARROW_LEFT)) {
            this.selectionIndex =
                (this.selectionIndex - 1 + this.viableObjects.length) %
                this.viableObjects.length;
            this.updateHighlight()

            console.log(this.selectionIndex)
        }

        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.confirmSelection();
        }

   
    }
    updateHighlight() {
        for (const obj of this.viableObjects) {
            obj.isHighlighted = false;
        }

        const current = this.viableObjects[this.selectionIndex];
        if (current) {
            current.isHighlighted = true;
        }
    }
    confirmSelection() {
        const current = this.viableObjects[this.selectionIndex];
        if (!this.firstSelection) {
            this.firstSelection = current;
            this.firstSelection.isSelected = true;
            return;
        }

        if (current === this.firstSelection) {
            return;
        }

        this.secondSelection = current;
        this.secondSelection.isSelected = true;
        this.createLink(this.firstSelection, this.secondSelection);

        this.exit();
    }

    regenerateConcentration(dt) {
        const REGEN_RATE = 8; 
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
    enter() {
        this.active = true;

        this.viableObjects = this.player.map.gameObjects.filter(
            obj => obj.isSympathyCapable
        );

        this.selectionIndex = 0;
        this.firstSelection = null;
        this.secondSelection = null;
        for (const obj of this.viableObjects) {
            obj.isSelected = false;
        }
        this.updateHighlight();
    }

    exit() {
        this.active = false;
        for (const obj of this.viableObjects) {
            obj.isHighlighted = false;
        }
    }

}