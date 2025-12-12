import Entity from "../Entity.js";

export default class GameObject extends Entity{
    
    constructor(x,y,map,height,width,name,mass,temp,){ 
        super(x,y,height,width);
        this.map = map
        this.name = name
        this.width = width
        this.height = height
        this.mass = mass 
        this.temp = temp // I will not take ambient temp in account even though I technically should

    }

    calculateSize(){
        return this.width*this.height
    }

    applyForce(force){
        //tween 
    }
}