// config/SpriteConfig.js

import Graphic from "../lib/Graphic.js";
import Sprite from "../lib/Sprite.js";

export const playerSpriteConfig = {
    idle: {
        path: "./assets/images/SpriteSheets/Wizard/Idle.png",
        frameWidth: 128,
        frameHeight: 128,
    },
    walk: {
        path: "./assets/images/SpriteSheets/Wizard/Walk.png",
        frameWidth: 128,
        frameHeight: 128,
    },
    jump: {
        path: "./assets/images/SpriteSheets/Wizard/Jump.png",
        frameWidth: 128,
        frameHeight: 128,
    },
    fall: {
        path: "./assets/images/SpriteSheets/Wizard/Walk.png",
        frameWidth: 128,
        frameHeight: 128,
    }
};

// -----------------------
// PLAYER SPRITE LOADER
// -----------------------
export async function loadPlayerSprites(config) {
    const sprites = {};

    for (const [animName, anim] of Object.entries(config)) {
        const img = await loadImage(anim.path);
        const graphic = new Graphic(img);

        const columns = Math.floor(img.width / anim.frameWidth);
        const rows = Math.floor(img.height / anim.frameHeight);

        const frames = [];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < columns; x++) {
                frames.push(
                    new Sprite(
                        graphic,
                        x * anim.frameWidth,
                        y * anim.frameHeight,
                        anim.frameWidth,
                        anim.frameHeight
                    )
                );
            }
        }

        sprites[animName] = frames;
    }

    return sprites;
}

function loadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}


// -----------------------
// OBJECT + PLATFORM SPRITES
// -----------------------

export const objectSpriteConfig = {
    Crate: [
        { x: 48, y: 0, width: 16, height: 16 },
    ],
    Barrel: [
        { x: 64, y: 0, width: 16, height: 16 }
    ],
    platform: [
        { x: 16, y: 16, width: 16, height: 16 },
    ],
};


/**
 * Loads sprites for objects like blocks, platforms, etc.
 * You MUST wrap parentImage in Graphic() or Sprite.render will crash.
 */
export function loadObjectSprites(graphic, configFrames) {
    const sprites = [];

    for (const frame of configFrames) {
        sprites.push(
            new Sprite(
                graphic,
                frame.x,
                frame.y,
                frame.width,
                frame.height
            )
        );
    }

    console.log("Loaded object sprites:", sprites);
    return sprites;
}

