import Tile from './Tile.js';

/**
 * Represents a layer in a tile-based game map.
 */
export default class Layer {
	constructor(layerDefinition, sprites) {
		this.tiles = Layer.generateTiles(layerDefinition.data, sprites);
        this.width = layerDefinition.width;
        this.height = layerDefinition.height;
	}

	render(context) {
		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const tile = this.getTile(x, y);
				if (tile) {
					tile.render(context, x, y);   // ← FIX
				}
			}
		}
	}

	isInBounds(x, y) {
		return x >= 0 && x < this.width && y >= 0 && y < this.height;
	}

	getTile(x, y) {
		const tileIndex = x + y * this.width;
		return this.isInBounds(x, y) ? this.tiles[tileIndex] : null;
	}

	setTile(x, y, tile) {
		if (this.isInBounds(x, y)) {
			this.tiles[x + y * this.width] = tile;
		}
	}

	setTileId(x, y, id) {
		if (this.isInBounds(x, y)) {
			this.tiles[x + y * this.width].id = id;
		}
	}

	static generateTiles(layerData, sprites) {
		return layerData.map(tileId =>
			tileId === 0 ? null : new Tile(tileId - 1, sprites)
		);
	}
}
