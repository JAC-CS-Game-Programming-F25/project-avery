// Images.js
import Graphic from "./Graphic.js";

export default class Images {
    constructor() {
        this.images = {};
    }

    async load(imageDefinitions) {
        const loadPromises = imageDefinitions.map(def => this.loadSingle(def));
        await Promise.all(loadPromises);
    }

    async loadSingle(def) {
        const img = await this.loadImage(def.path);

        // Wrap the fully loaded HTMLImageElement in Graphic
        this.images[def.name] = new Graphic(img);
    }

    loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = (err) => reject(err);
            img.src = src;
        });
    }

    get(name) {
        return this.images[name];
    }

    render(name, ctx, x, y, width = null, height = null) {
        const graphic = this.get(name);
        if (!graphic) return;

        graphic.render(ctx, x, y, width ?? graphic.width, height ?? graphic.height);
    }
}
