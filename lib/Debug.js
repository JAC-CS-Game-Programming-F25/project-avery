export default class Debug {
	constructor() {
		this.watchedObjects = {};
		this.panel = null;
	}

	createDebugPanel() {
		const panel = document.createElement('div');
		panel.id = 'debug-panel';
		panel.style.cssText = `
            position: fixed;
            top: 0px;
            left: 0px;
            background-color: rgba(0, 0, 0, 0.7);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            max-height: 90vh;
            overflow-y: auto;
            z-index: 1000;
        `;
		document.body.appendChild(panel);
		return panel;
	}

	watch(name, object) {
		if (!this.panel) {
			this.panel = this.createDebugPanel();
		}

		this.watchedObjects[name] = object;
	}

	unwatch(name) {
		delete this.watchedObjects[name];

		if (Object.entries(this.watchedObjects).length === 0 && this.panel) {
			document.body.removeChild(this.panel);
			this.panel = null;
		}
	}

	update() {
		if (!this.panel) {
			return;
		}

		let content = '';
		for (const [name, object] of Object.entries(this.watchedObjects)) {
			content += `<strong>${name}</strong><br>`;
			for (const [key, value] of Object.entries(object)) {
				const displayValue =
					typeof value === 'function' ? value() : value;
				content += `${key}: ${this.formatValue(displayValue)}<br>`;
			}
			content += '<br>';
		}
		this.panel.innerHTML = content;
	}

	formatValue(value, precision = 0) {
		if (typeof value === 'number') {
			return value.toFixed(precision);
		}
		return value;
	}
}
