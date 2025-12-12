import Colour from '../../enums/Colour.js';
import SoundName from '../../enums/SoundName.js';
import { context, input, sounds, timer } from '../../globals.js';
import Panel from './Panel.js';
import Input from '../../../lib/Input.js';

export default class Textbox extends Panel {
	/**
	 * A Textbox element is a Panel with text overlaid on top.
	 * The text can be "advanceable" meaning the player can hit
	 * enter or space to advance to the next "page" of text.
	 * If not advanceable, the controlling state will take care
	 * of closing the Textbox.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 * @param {string} text
	 * @param {object} options Font size/colour/family and whether the textbox should be advanceable.
	 */
	constructor(x, y, width, height, text, options = {}) {
		super(x, y, width, height);

		this.fontSize = options.fontSize ?? Panel.FONT_SIZE;
		this.fontColour = options.fontColour ?? Colour.Black;
		this.fontFamily = options.fontFamily ?? Panel.FONT_FAMILY;
		this.isAdvanceable = options.isAdvanceable ?? true;
		this.nextArrowAlpha = 1;
		this.endOfText = false;
		this.isClosed = false;
		this.pages = this.createPages(
			text,
			this.dimensions.x - this.padding * 3
		);

		if (this.isAdvanceable) {
			this.arrowTimer = this.flashAdvanceableArrow();
		}

		this.next();
	}

	update() {
		if (
			input.isKeyPressed(Input.KEYS.ENTER) ||
			input.isKeyPressed(Input.KEYS.SPACE)
		) {
			sounds.play(SoundName.SelectionChoice);

			this.next();
		}
	}

	render() {
		super.render();

		context.save();

		this.renderText();

		if (this.isAdvanceable) {
			this.renderNextArrow();
		}

		context.restore();
	}

	renderText() {
		context.textBaseline = 'top';
		context.font = `${this.fontSize}px ${this.fontFamily}`;
		context.fillStyle = this.fontColour;
		this.pageToDisplay.forEach((line, index) => {
			context.fillText(
				line,
				this.position.x + this.padding,
				this.position.y + index * this.fontSize + this.padding
			);
		});
	}

	renderNextArrow() {
		context.beginPath();
		context.translate(
			this.position.x + this.dimensions.x - 20,
			this.position.y + this.dimensions.y - 15
		);
		context.moveTo(0, 0);
		context.lineTo(10, 0);
		context.lineTo(5, 5);
		context.lineTo(0, 0);
		context.globalAlpha = this.nextArrowAlpha;
		context.fill();
		context.closePath();
	}

	/**
	 * @param {string} text
	 * @param {number} width The width of the textbox.
	 * @returns The paginated text based on the specified width.
	 */
	createPages(text, width) {
		const lines = this.getLines(text, width);
		const linesPerPage = Math.floor(
			(this.dimensions.y - this.padding) / this.fontSize
		);
		const maxPages = Math.ceil(lines.length / linesPerPage);
		const pages = [];

		for (let page = 0; page < maxPages; page++) {
			pages.push([]);

			for (let line = 0; line < linesPerPage; line++) {
				if (lines.length === 0) {
					break;
				}

				pages[page][line] = lines.splice(0, 1);
			}
		}

		return pages;
	}

	next() {
		if (this.endOfText) {
			this.toggle();
			this.arrowTimer.clear();
			this.isClosed = true;
		} else {
			this.nextPage();
		}
	}

	nextPage() {
		this.pageToDisplay = this.pages.splice(0, 1)[0];

		if (this.pages.length === 0) {
			this.endOfText = true;
		}
	}

	/**
	 * @param {string} text
	 * @param {number} maxWidth
	 * @returns The separated text lines based on the given maxWidth.
	 */
	getLines(text, maxWidth) {
		const wordsByLine = text.split('\n'); // Split by new line if manually specified in text.
		const lines = [];

		wordsByLine.forEach((line) => {
			const words = line.replace(/\t+/g, '').split(' '); // Remove any tab characters.

			let currentLine = words[0];

			context.font = `${this.fontSize}px ${this.fontFamily}`;

			for (let i = 1; i < words.length; i++) {
				const word = words[i];
				const width = context.measureText(
					currentLine + ' ' + word
				).width;

				if (width < maxWidth) {
					currentLine += ' ' + word;
				} else {
					lines.push(currentLine);
					currentLine = word;
				}
			}

			lines.push(currentLine);
		});
		return lines;
	}

	flashAdvanceableArrow() {
		const action = () => {
			this.nextArrowAlpha = this.nextArrowAlpha === 1 ? 0 : 1;
		};
		const interval = 0.75;

		return timer.addTask(action, interval);
	}
}