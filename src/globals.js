// globals.js
import Fonts from '../lib/Fonts.js';
import Images from '../lib/Images.js';
import Input from '../lib/Input.js';
import Sounds from '../lib/Sounds.js';
import StateMachine from '../lib/StateMachine.js';
import Timer from '../lib/Timer.js';

//
// ------------------------------------------------------------
// CANVAS SETUP
// ------------------------------------------------------------
//
export const canvas = document.createElement('canvas');
export const context = canvas.getContext('2d');
document.body.appendChild(canvas);

const assetDefinition = await fetch('./config/assets.json')
    .then((res) => res.json());

export const TILE_SIZE = 16;
export const CANVAS_WIDTH = TILE_SIZE * 20;
export const CANVAS_HEIGHT = TILE_SIZE * 15;

//
// ------------------------------------------------------------
// CANVAS AUTO-RESIZE TO FIT WINDOW + CONTROL PANEL
// ------------------------------------------------------------
//
const resizeCanvas = () => {
    const controlPanel = document.getElementById('controlPanel');
    const controlPanelHeight = controlPanel ? controlPanel.offsetHeight : 200;

    const availableHeight = window.innerHeight - controlPanelHeight;

    const scaleX = window.innerWidth / CANVAS_WIDTH;
    const scaleY = availableHeight / CANVAS_HEIGHT;
    const scale = Math.min(scaleX, scaleY);

    const canvasWidth = CANVAS_WIDTH * scale;
    const canvasHeight = CANVAS_HEIGHT * scale;

    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    if (controlPanel) {
        controlPanel.style.width = `${canvasWidth}px`;
    }
};

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

//
// ------------------------------------------------------------
// GLOBAL SYSTEMS
// ------------------------------------------------------------
//
export const input = new Input(canvas);

// IMPORTANT: Images() NO LONGER RECEIVES THE canvas context
export const images = new Images();

export const fonts = new Fonts();
export const stateMachine = new StateMachine();
export const timer = new Timer();
export const sounds = new Sounds();

//
// ------------------------------------------------------------
// REQUIRED — YOU MUST WAIT FOR ALL ASSETS TO LOAD
// ------------------------------------------------------------
//
await sounds.load(assetDefinition.sounds);
await images.load(assetDefinition.images);
await fonts.load(assetDefinition.fonts);

//
// ------------------------------------------------------------
// DEBUG OPTIONS
// ------------------------------------------------------------
//
export const debugOptions = {
    mapGrid: false,
    cameraCrosshair: false,
    playerCollision: false,
    watchPanel: false,
    hitboxes: true,
};

export function toggleDebugOption(option) {
    debugOptions[option] = !debugOptions[option];
    localStorage.setItem(`debug_${option}`, debugOptions[option]);
}

function initializeDebugOptions() {
    Object.keys(debugOptions).forEach((option) => {
        const storedValue = localStorage.getItem(`debug_${option}`);
        if (storedValue !== null) {
            debugOptions[option] = storedValue === 'true';
        }
    });
}

initializeDebugOptions();

const debugCheckboxes = document.querySelectorAll(
    '#controlPanel .debug input[type="checkbox"]'
);

debugCheckboxes.forEach((checkbox) => {
    checkbox.checked = debugOptions[checkbox.name];

    checkbox.addEventListener('change', () => {
        toggleDebugOption(checkbox.name);
    });
});
