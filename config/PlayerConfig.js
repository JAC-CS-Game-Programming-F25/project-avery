// PlayerConfig object to hold our adjustable values
export const PlayerConfig = {
	maxSpeed: 300,

	acceleration: 5,
	deceleration: 0.9,
	jumpPower: -500,
	gravity: 1000,
	maxFallSpeed: 2000,
	maxJumpTime: 0.5,
	maxCoyoteTime: 0.1,
	maxJumpBuffer: 0.1,
	doubleJumpEnabled: false,
	skidThreshold: 100,
	slideFriction: 0.95,
	bounceVelocity: -200, // Upward velocity when bouncing off an enemy
};

// Function to update PlayerConfig based on slider values
export function updatePlayerConfig() {
	Object.keys(PlayerConfig).forEach((key) => {
		const element = document.getElementById(key);
		if (element) {
			if (element.type === 'checkbox') {
				PlayerConfig[key] = element.checked;
			} else {
				PlayerConfig[key] = parseFloat(element.value);
			}
			// Save to localStorage
			localStorage.setItem(`playerSetting_${key}`, PlayerConfig[key]);
		}
	});

	// Update displayed values
	Object.keys(PlayerConfig).forEach((key) => {
		const valueElement = document.getElementById(`${key}Value`);
		if (valueElement) {
			if (typeof PlayerConfig[key] === 'boolean') {
				valueElement.textContent = PlayerConfig[key];
			} else {
				valueElement.textContent = PlayerConfig[key].toFixed(3);
			}
		}
	});
}

// Function to load PlayerConfig from localStorage
export function loadPlayerConfig() {
	Object.keys(PlayerConfig).forEach((key) => {
		const storedValue = localStorage.getItem(`playerSetting_${key}`);
		if (storedValue !== null) {
			if (typeof PlayerConfig[key] === 'boolean') {
				PlayerConfig[key] = storedValue === 'true';
			} else {
				PlayerConfig[key] = parseFloat(storedValue);
			}
			// Update slider/checkbox
			const element = document.getElementById(key);
			if (element) {
				if (element.type === 'checkbox') {
					element.checked = PlayerConfig[key];
				} else {
					element.value = PlayerConfig[key];
				}
			}
		}
	});
	updatePlayerConfig(); // Update displayed values
}

// Add event listeners to sliders
document.addEventListener('DOMContentLoaded', () => {
	document
		.querySelectorAll('.movement input, .jump input')
		.forEach((input) => {
			input.addEventListener('input', updatePlayerConfig);
		});

	// Load settings from localStorage
	loadPlayerConfig();
});
