import Fonts from '../lib/Fonts.js';
import Images from '../lib/Images.js';
import Input from '../lib/Input.js';
import Sounds from '../lib/Sounds.js';
import StateMachine from '../lib/StateMachine.js';
import Timer from '../lib/Timer.js';

export const canvas = document.createElement('canvas');
export const context =
	canvas.getContext('2d') || new CanvasRenderingContext2D();
const assetDefinition = await fetch('./config/assets.json').then((response) =>
	response.json()
);

// Replace these values according to how big you want your canvas.
export const TILE_SIZE = 16;
export const CANVAS_WIDTH = TILE_SIZE * 20;
export const CANVAS_HEIGHT = TILE_SIZE * 15;

const resizeCanvas = () => {
	// Get the control panel element to calculate its height
	const controlPanel = document.getElementById('controlPanel');
	const controlPanelHeight = controlPanel ? controlPanel.offsetHeight : 200; // fallback to 200px

	// Calculate available space for canvas (subtract control panel height)
	const availableHeight = window.innerHeight - controlPanelHeight;

	const scaleX = window.innerWidth / CANVAS_WIDTH;
	const scaleY = availableHeight / CANVAS_HEIGHT;
	const scale = Math.min(scaleX, scaleY); // Maintain aspect ratio

	const canvasWidth = CANVAS_WIDTH * scale;
	const canvasHeight = CANVAS_HEIGHT * scale;

	canvas.style.width = `${canvasWidth}px`;
	canvas.style.height = `${canvasHeight}px`;

	// Set control panel width to match canvas width
	if (controlPanel) {
		controlPanel.style.width = `${canvasWidth}px`;
	}
};

// Listen for canvas resize events
window.addEventListener('resize', resizeCanvas);

resizeCanvas(); // Call once to scale initially

export const input = new Input(canvas);
export const images = new Images(context);
export const fonts = new Fonts();
export const stateMachine = new StateMachine();
export const timer = new Timer();
export const sounds = new Sounds();

// Load all the assets from their definitions.
sounds.load(assetDefinition.sounds);
images.load(assetDefinition.images);
fonts.load(assetDefinition.fonts);

// Debug options
export const debugOptions = {
	mapGrid: false,
	cameraCrosshair: false,
	playerCollision: false,
	watchPanel: false,
};

// Function to toggle a debug option
export function toggleDebugOption(option) {
	debugOptions[option] = !debugOptions[option];
	localStorage.setItem(`debug_${option}`, debugOptions[option]);
}

// Function to initialize debug options from localStorage
function initializeDebugOptions() {
	Object.keys(debugOptions).forEach((option) => {
		const storedValue = localStorage.getItem(`debug_${option}`);
		if (storedValue !== null) {
			debugOptions[option] = storedValue === 'true';
		}
	});
}

// Event listener for debug checkboxes
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
