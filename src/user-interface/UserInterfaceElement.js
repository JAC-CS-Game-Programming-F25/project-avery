import Vector from "../../lib/Vector.js";
import FontName from "../enums/FontName.js";
import Tile from "../services/Tile.js";
export default class UserInterfaceElement {
	static FONT_SIZE = Tile.SIZE * 0.65;
	static FONT_FAMILY = FontName.PowerRed;

	/**
	 * The base UI element that all interface elements should extend.
	 *
	 * @param {number} x
	 * @param {number} y
	 * @param {number} width
	 * @param {number} height
	 */
	constructor(x, y, width, height) {
		this.position = new Vector(x * Tile.SIZE, y * Tile.SIZE);
		this.dimensions = new Vector(width * Tile.SIZE, height * Tile.SIZE);
	}
}