export const CameraSettings = {
	lookahead: 100,
	damping: 300,
};

export function updateCameraSettings() {
	Object.keys(CameraSettings).forEach((key) => {
		const element = document.getElementById(key);
		if (element) {
			CameraSettings[key] = parseFloat(element.value);
			// Save to localStorage
			localStorage.setItem(`cameraSetting_${key}`, CameraSettings[key]);
		}
	});

	// Update displayed values
	Object.keys(CameraSettings).forEach((key) => {
		const valueElement = document.getElementById(`${key}Value`);
		if (valueElement) {
			valueElement.textContent = CameraSettings[key].toFixed(0);
		}
	});
}

// Function to load CameraSettings from localStorage
export function loadCameraSettings() {
	Object.keys(CameraSettings).forEach((key) => {
		const storedValue = localStorage.getItem(`cameraSetting_${key}`);
		if (storedValue !== null) {
			CameraSettings[key] = parseFloat(storedValue);
			// Update slider
			const element = document.getElementById(key);
			if (element) {
				element.value = CameraSettings[key];
			}
		}
	});
	updateCameraSettings(); // Update displayed values
}

// Add event listeners to sliders
document.addEventListener('DOMContentLoaded', () => {
	document.querySelectorAll('.camera input').forEach((input) => {
		input.addEventListener('input', updateCameraSettings);
	});

	// Load settings from localStorage
	loadCameraSettings();
});
