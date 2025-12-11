// Graphic.js
export default class Graphic {
    /**
     * Wraps an already-loaded HTMLImageElement.
     * This is used by Sprite.js for rendering cropped regions.
     *
     * @param {HTMLImageElement} image
     */
    constructor(image) {
        this.image = image;
        this.width = image.width;
        this.height = image.height;

        // Create an offscreen canvas to allow pixel cropping
        this.canvas = document.createElement("canvas");
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.context = this.canvas.getContext("2d");
        this.context.drawImage(image, 0, 0);
    }

    /**
     * Draws the full image to the given rendering context.
     */
    render(context, x, y, width = this.width, height = this.height) {
        context.drawImage(this.image, Math.floor(x), Math.floor(y), width, height);
    }
}
