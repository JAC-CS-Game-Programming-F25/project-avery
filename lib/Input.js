/**
 * Manages keyboard and mouse input for a game or application.
 * Listens for key presses, releases, and mouse events on the provided canvas.
 */
export default class Input {
	/**
	 * A constant object mapping key names to their string representations.
	 */
	static KEYS = {
		BACKSPACE: 'Backspace',
		TAB: 'Tab',
		ENTER: 'Enter',
		SHIFT_RIGHT: 'ShiftRight',
		SHIFT_LEFT: 'ShiftLeft',
		CONTROL_RIGHT: 'ControlRight',
		CONTROL_LEFT: 'ControlLeft',
		ALT_RIGHT: 'AltRight',
		ALT_LEFT: 'AltLeft',
		META_RIGHT: 'MetaRight',
		META_LEFT: 'MetaLeft',
		CAPS_LOCK: 'CapsLock',
		ESCAPE: 'Escape',
		SPACE: 'Space',
		PAGE_UP: 'PageUp',
		PAGE_DOWN: 'PageDown',
		END: 'End',
		HOME: 'Home',
		ARROW_LEFT: 'ArrowLeft',
		ARROW_UP: 'ArrowUp',
		ARROW_RIGHT: 'ArrowRight',
		ARROW_DOWN: 'ArrowDown',
		PRINT_SCREEN: 'PrintScreen',
		INSERT: 'Insert',
		DELETE: 'Delete',
		0: 'Digit0',
		1: 'Digit1',
		2: 'Digit2',
		3: 'Digit3',
		4: 'Digit4',
		5: 'Digit5',
		6: 'Digit6',
		7: 'Digit7',
		8: 'Digit8',
		9: 'Digit9',
		A: 'KeyA',
		B: 'KeyB',
		C: 'KeyC',
		D: 'KeyD',
		E: 'KeyE',
		F: 'KeyF',
		G: 'KeyG',
		H: 'KeyH',
		I: 'KeyI',
		J: 'KeyJ',
		K: 'KeyK',
		L: 'KeyL',
		M: 'KeyM',
		N: 'KeyN',
		O: 'KeyO',
		P: 'KeyP',
		Q: 'KeyQ',
		R: 'KeyR',
		S: 'KeyS',
		T: 'KeyT',
		U: 'KeyU',
		V: 'KeyV',
		W: 'KeyW',
		X: 'KeyX',
		Y: 'KeyY',
		Z: 'KeyZ',
		NUMPAD_0: 'Numpad0',
		NUMPAD_1: 'Numpad1',
		NUMPAD_2: 'Numpad2',
		NUMPAD_3: 'Numpad3',
		NUMPAD_4: 'Numpad4',
		NUMPAD_5: 'Numpad5',
		NUMPAD_6: 'Numpad6',
		NUMPAD_7: 'Numpad7',
		NUMPAD_8: 'Numpad8',
		NUMPAD_9: 'Numpad9',
		NUMPAD_ADD: 'NumpadAdd',
		NUMPAD_SUBTRACT: 'NumpadSubtract',
		NUMPAD_MULTIPLY: 'NumpadMultiply',
		NUMPAD_DIVIDE: 'NumpadDivide',
		NUMPAD_DECIMAL: 'NumpadDecimal',
		NUMPAD_ENTER: 'NumpadEnter',
		F1: 'F1',
		F2: 'F2',
		F3: 'F3',
		F4: 'F4',
		F5: 'F5',
		F6: 'F6',
		F7: 'F7',
		F8: 'F8',
		F9: 'F9',
		F10: 'F10',
		F11: 'F11',
		F12: 'F12',
		F13: 'F13',
		F14: 'F14',
		F15: 'F15',
		F16: 'F16',
		F17: 'F17',
		F18: 'F18',
		F19: 'F19',
		F20: 'F20',
		F21: 'F21',
		F22: 'F22',
		F23: 'F23',
		F24: 'F24',
		NUM_LOCK: 'NumLock',
		SCROLL_LOCK: 'ScrollLock',
		COMMA: 'Comma',
		PERIOD: 'Period',
		SEMICOLON: 'Semicolon',
		EQUALS: 'Equals',
		MINUS: 'Minus',
		SLASH: 'Slash',
		BACKSLASH: 'Backslash',
		BRACKET_LEFT: 'BracketLeft',
		BRACKET_RIGHT: 'BracketRight',
		QUOTE: 'Quote',
		BACKQUOTE: 'Backquote',
	};

	/**
	 * A constant object mapping mouse buttons to their numerical values.
	 */
	static MOUSE = { LEFT: 0, MIDDLE: 1, RIGHT: 2 };

	/**
	 * Initializes the Input system and attaches event listeners to the provided canvas.
	 *
	 * @param {HTMLCanvasElement} canvas - The canvas element to capture input from.
	 */
	constructor(canvas) {
		this.canvas = canvas;
		this.keys = {};
		this.keysPressed = {};
		this.mouseButtons = {};
		this.mouse = { x: 0, y: 0 };

		this.initEventListeners();
	}

	initEventListeners() {
		this.canvas.addEventListener('keydown', (event) => {
			if (event.code === 'Space') {
				event.preventDefault(); // Prevent the space bar from scrolling the page.
			}

			if (!this.keys[event.code]) {
				this.keysPressed[event.code] = true;
			}
			this.keys[event.code] = true;
		});

		this.canvas.addEventListener('keyup', (event) => {
			this.keys[event.code] = false;
			delete this.keysPressed[event.code];
		});

		this.canvas.addEventListener('mousemove', (event) => {
			const canvasRectangle = this.canvas.getBoundingClientRect();
			this.mouse.x =
				((event.clientX - canvasRectangle.left) /
					(canvasRectangle.right - canvasRectangle.left)) *
				this.canvas.width;
			this.mouse.y =
				((event.clientY - canvasRectangle.top) /
					(canvasRectangle.bottom - canvasRectangle.top)) *
				this.canvas.height;
		});

		this.canvas.addEventListener('mousedown', (event) => {
			this.mouseButtons[event.button] = true;
		});

		this.canvas.addEventListener('mouseup', (event) => {
			this.mouseButtons[event.button] = false;
		});
	}

	isKeyHeld(key) {
		return this.keys[key] === true;
	}

	isKeyPressed(key) {
		return this.keysPressed[key] === true;
	}

	getMousePosition() {
		return { ...this.mouse };
	}

	isMouseButtonHeld(button) {
		return this.mouseButtons[button] === true;
	}

	isMouseButtonPressed(button) {
		if (this.mouseButtons[button]) {
			this.mouseButtons[button] = false;
			return true;
		}
		return false;
	}

	update() {
		// Clear the keysPressed object after each frame
		this.keysPressed = {};
	}
}
