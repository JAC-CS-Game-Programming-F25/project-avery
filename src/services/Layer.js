import Tile from './Tile.js';

/**
 * Represents a layer in a tile-based game map.
 * Each layer consists of a grid of tiles that can be rendered and manipulated.
 */
export default class Layer {
	/**
	 * Creates a new Layer instance.
	 *
	 * @param {Object} layerDefinition - The definition of the layer, typically from a map editor.
	 * @param {Array} layerDefinition.data - The tile data for the layer.
	 * @param {number} layerDefinition.width - The width of the layer in tiles.
	 * @param {number} layerDefinition.height - The height of the layer in tiles.
	 * @param {Array} sprites - The sprite objects used to render the tiles.
	 */
	constructor(layerDefinition, sprites) {
		this.tiles = Layer.generateTiles(layerDefinition.data, sprites);
		this.width = layerDefinition.width;
		this.height = layerDefinition.height;
	}

	/**
	 * Renders all tiles in the layer.
	 * Iterates through each tile position and calls the render method on existing tiles.
	 */
	render() {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				// The optional chaining (?.) ensures we only call render if the tile exists
				
				this.getTile(x, y)?.render(x, y);
			}
		}
	}

	/**
	 * Checks if the given coordinates are within the layer's bounds.
	 *
	 * @param {number} x - The x-coordinate to check.
	 * @param {number} y - The y-coordinate to check.
	 * @returns {boolean} True if the coordinates are within bounds, false otherwise.
	 */
	isInBounds(x, y) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	/**
	 * Retrieves the tile at the specified coordinates.
	 *
	 * @param {number} x - The x-coordinate of the tile.
	 * @param {number} y - The y-coordinate of the tile.
	 * @returns {Tile|null} The tile at the specified position, or null if out of bounds.
	 */
	getTile(x, y) {
		const tileIndex = x + y * this.width;
		return this.isInBounds(x, y) ? this.tiles[tileIndex] : null;
	}

	/**
	 * Sets a tile at the specified coordinates.
	 *
	 * @param {number} x - The x-coordinate to set the tile at.
	 * @param {number} y - The y-coordinate to set the tile at.
	 * @param {Tile} tile - The tile to set.
	 */
	setTile(x, y, tile) {
		if (this.isInBounds(x, y)) {
			this.tiles[x + y * this.width] = tile;
		}
	}

	/**
	 * Sets the ID of a tile at the specified coordinates.
	 *
	 * @param {number} x - The x-coordinate of the tile.
	 * @param {number} y - The y-coordinate of the tile.
	 * @param {number} id - The new ID to set for the tile.
	 */
	setTileId(x, y, id) {
		
		if (this.isInBounds(x, y)) {
			this.tiles[x + y * this.width].id = id;
		} 
	}

	/**
	 * Generates an array of Tile objects from layer data.
	 *
	 * @param {Array} layerData - The tile data for the layer.
	 * @param {Array} sprites - The sprite objects used to render the tiles.
	 * @returns {Array} An array of Tile objects.
	 */
	static generateTiles(layerData, sprites) {
		const tiles = [];

		layerData.forEach((tileId) => {
			// Create a new Tile object if tileId is not 0, otherwise push null
			// Note: We subtract 1 from tileId to convert from 1-based to 0-based indexing
			const tile = tileId === 0 ? null : new Tile(tileId - 1, sprites);
			tiles.push(tile);
		});

		return tiles;
	}
}
