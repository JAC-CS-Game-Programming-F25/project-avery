import Sprite from '../lib/Sprite.js';

export const smallSpriteConfig = {
	idle: [{ x: 24, y: 48, width: 16, height: 24 }],
	lookUp: [{ x: 76, y: 48, width: 16, height: 24 }],
	duck: [{ x: 128, y: 56, width: 16, height: 16 }],
	walk: [
		{ x: 180, y: 48, width: 16, height: 24 },
		{ x: 232, y: 48, width: 16, height: 24 },
		{ x: 284, y: 48, width: 16, height: 24 },
	],
	run: [
		{ x: 336, y: 48, width: 16, height: 24 },
		{ x: 388, y: 48, width: 16, height: 24 },
		{ x: 440, y: 48, width: 16, height: 24 },
	],
	skid: [{ x: 700, y: 48, width: 16, height: 24 }],
	pipe: [{ x: 24, y: 112, width: 16, height: 24 }],
	jump: [{ x: 76, y: 112, width: 16, height: 24 }],
	fall: [{ x: 128, y: 112, width: 16, height: 24 }],
	runJump: [{ x: 180, y: 112, width: 16, height: 24 }],
	spinJump: [
		{ x: 232, y: 48, width: 16, height: 24 },
		{ x: 284, y: 48, width: 16, height: 24 },
		{ x: 336, y: 48, width: 16, height: 24 },
		{ x: 388, y: 48, width: 16, height: 24 },
	],
	slide: [{ x: 440, y: 112, width: 16, height: 24 }],
	kick: [{ x: 492, y: 112, width: 16, height: 24 }],
	swim: [
		{ x: 544, y: 48, width: 16, height: 24 },
		{ x: 596, y: 48, width: 16, height: 24 },
		{ x: 648, y: 48, width: 16, height: 24 },
	],
	victory: [{ x: 700, y: 112, width: 16, height: 24 }],
	death: [{ x: 544, y: 266, width: 16, height: 24 }],
	dust: [
		{ x: 12, y: 3566, width: 8, height: 8 },
		{ x: 32, y: 3566, width: 8, height: 8 },
		{ x: 52, y: 3566, width: 8, height: 8 },
	],
	sparkles: [
		{ x: 307, y: 3566, width: 8, height: 8 },
		{ x: 327, y: 3566, width: 8, height: 8 },
		{ x: 347, y: 3566, width: 8, height: 8 },
	],
	grow: [
		{ x: 596, y: 258, width: 16, height: 32 }, // small
		{ x: 648, y: 258, width: 16, height: 32 }, // middle
		{ x: 596, y: 258, width: 16, height: 32 }, // small
		{ x: 648, y: 258, width: 16, height: 32 }, // middle
		{ x: 596, y: 258, width: 16, height: 32 }, // small
		{ x: 648, y: 258, width: 16, height: 32 }, // middle
		{ x: 700, y: 258, width: 16, height: 32 }, // big
		{ x: 648, y: 258, width: 16, height: 32 }, // middle
		{ x: 700, y: 258, width: 16, height: 32 }, // big
		{ x: 648, y: 258, width: 16, height: 32 }, // middle
		{ x: 700, y: 258, width: 16, height: 32 }, // big
	],
};

export const bigSpriteConfig = {
	idle: [{ x: 24, y: 584, width: 16, height: 32 }],
	lookUp: [{ x: 76, y: 584, width: 16, height: 32 }],
	duck: [{ x: 128, y: 600, width: 16, height: 16 }],
	walk: [
		{ x: 180, y: 584, width: 16, height: 32 },
		{ x: 232, y: 584, width: 16, height: 32 },
		{ x: 284, y: 584, width: 16, height: 32 },
	],
	run: [
		{ x: 336, y: 584, width: 18, height: 32 },
		{ x: 388, y: 584, width: 18, height: 32 },
		{ x: 440, y: 584, width: 18, height: 32 },
	],
	skid: [{ x: 724, y: 584, width: 16, height: 32 }],
	pipe: [{ x: 24, y: 655, width: 16, height: 32 }],
	jump: [{ x: 76, y: 655, width: 16, height: 32 }],
	fall: [{ x: 128, y: 655, width: 16, height: 32 }],
	runJump: [{ x: 180, y: 655, width: 19, height: 32 }],
	spinJump: [
		{ x: 232, y: 584, width: 16, height: 32 },
		{ x: 284, y: 584, width: 16, height: 32 },
		{ x: 336, y: 584, width: 16, height: 32 },
		{ x: 388, y: 584, width: 16, height: 32 },
	],
	slide: [{ x: 440, y: 655, width: 16, height: 32 }],
	kick: [{ x: 492, y: 655, width: 16, height: 32 }],
	swim: [
		{ x: 544, y: 566, width: 20, height: 32 },
		{ x: 596, y: 566, width: 20, height: 32 },
		{ x: 648, y: 566, width: 20, height: 32 },
	],
	victory: [{ x: 700, y: 655, width: 16, height: 32 }],
	death: [{ x: 544, y: 266, width: 16, height: 32 }],
	dust: [
		{ x: 12, y: 3566, width: 8, height: 8 },
		{ x: 32, y: 3566, width: 8, height: 8 },
		{ x: 52, y: 3566, width: 8, height: 8 },
	],
	sparkles: [
		{ x: 307, y: 3566, width: 8, height: 8 },
		{ x: 327, y: 3566, width: 8, height: 8 },
		{ x: 347, y: 3566, width: 8, height: 8 },
	],
};

export const objectSpriteConfig = {
	block: [
		{ x: 48, y: 32, width: 16, height: 16 },
		{ x: 64, y: 32, width: 16, height: 16 },
	],
	platform: [
		{ x: 16, y: 16, width: 16, height: 16 }
	],
};

export const enemySpriteConfig = {
	goomba: [
		{ x: 80, y: 32, width: 16, height: 16 },
		{ x: 96, y: 32, width: 16, height: 16 },
	],
};

export const coinSpriteConfig = {
	coin: [
		{ x: 80, y: 0, width: 16, height: 16 },
		{ x: 96, y: 0, width: 16, height: 16 },
		{ x: 112, y: 0, width: 16, height: 16 },
		{ x: 128, y: 0, width: 16, height: 16 },
	],
};

export const powerUpSpriteConfig = {
	mushroom: [
		{ x: 112, y: 32, width: 16, height: 16 }
	],
};


export function loadPlayerSprites(spriteSheet, spriteConfig) {
	const sprites = {};

	for (const [animationName, frames] of Object.entries(spriteConfig)) {
		sprites[animationName] = frames.map(
			(frame) =>
				new Sprite(
					spriteSheet,
					frame.x,
					frame.y,
					frame.width,
					frame.height
				)
		);
	}

	return sprites;
}
