/**
 * Mario-6
 *
 * Original Lua by: Colton Ogden (cogden@cs50.harvard.edu)
 * Adapted to JS by: Vikram Singh (vikram.singh@johnabbott.qc.ca)
 *
 * Super Mario Bros. was instrumental in the resurgence of video
 * games in the mid-80s, following the infamous crash shortly after the
 * Atari age of the late 70s. The goal is to navigate various levels from
 * a side perspective, where jumping onto enemies inflicts damage and
 * jumping up into blocks typically breaks them or reveals a power-up.
 *
 * Art
 * @see https://www.spriters-resource.com/snes/smarioworld/
 *
 * Sounds & Music
 * @see https://www.sounds-resource.com/snes/supermarioworld/
 */

import GameStateName from './enums/GameStateName.js';
import Game from '../lib/Game.js';
import {
	canvas,
	CANVAS_HEIGHT,
	CANVAS_WIDTH,
	context,
	stateMachine,
} from './globals.js';
import PlayState from './states/PlayState.js';

// Set the dimensions of the play area.
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;
canvas.setAttribute('tabindex', '1'); // Allows the canvas to receive user input.

// Now that the canvas element has been prepared, we can add it to the DOM.
document.body.prepend(canvas);

const mapDefinition = await fetch('./config/tilemap.json').then((response) =>
	response.json()
);

// Add all the states to the state machine.
stateMachine.add(GameStateName.Play, new PlayState(mapDefinition));

stateMachine.change(GameStateName.Play);

const game = new Game(stateMachine, context, canvas.width, canvas.height);

game.start();

// Focus the canvas so that the player doesn't have to click on it.
canvas.focus();
