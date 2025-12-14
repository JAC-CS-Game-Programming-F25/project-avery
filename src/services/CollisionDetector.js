import Entity from '../entities/Entity.js';
import Map from './Map.js';

/**
 * Handles tile collision using ENTITY HITBOX (offset + size),
 * not sprite dimensions.
 */
export default class CollisionDetector {
	constructor(map) {
		this.map = map;
	}

	checkHorizontalCollisions(entity) {
		const tileSize = this.map.tileSize;

		// Use HITBOX bounds
		const left = entity.hitboxX;
		const right = entity.hitboxRight;
		const top = entity.hitboxY;
		const bottom = entity.hitboxBottom - 1; // -1 so exact edges behave nicely

		const tileTop = Math.floor(top / tileSize);
		const tileBottom = Math.floor(bottom / tileSize);

		if (entity.velocity.x > 0) {
			// Moving RIGHT: test the column we are entering (right edge)
			const tileRight = Math.floor(right / tileSize);

			if (this.isSolidTileInColumn(tileRight, tileTop, tileBottom)) {
				// Push player left so hitbox right sits flush with tile left edge
				const tileLeftEdge = tileRight * tileSize;
				entity.position.x = tileLeftEdge - (entity.hitboxOffset.x + entity.hitboxWidth);
				entity.velocity.x = 0;
			}
		} else if (entity.velocity.x < 0) {
			// Moving LEFT: test the column we are entering (left edge)
			const tileLeft = Math.floor(left / tileSize);

			if (this.isSolidTileInColumn(tileLeft, tileTop, tileBottom)) {
				// Push player right so hitbox left sits flush with tile right edge
				const tileRightEdge = (tileLeft + 1) * tileSize;
				entity.position.x = tileRightEdge - entity.hitboxOffset.x;
				entity.velocity.x = 0;
			}
		}
	}

	checkVerticalCollisions(entity) {
		const tileSize = this.map.tileSize;

		// Use HITBOX bounds
		const left = entity.hitboxX;
		const right = entity.hitboxRight - 1; // -1 so exact edges behave nicely
		const top = entity.hitboxY;
		const bottom = entity.hitboxBottom;

		const tileLeft = Math.floor(left / tileSize);
		const tileRight = Math.floor(right / tileSize);

		// IMPORTANT: do not force isOnGround false here if Map/platform system handles it
		// But if tile collision is your ground source, keep this:
		// entity.isOnGround = false;

		if (entity.velocity.y >= 0) {
			// Falling / grounded: check row below bottom edge
			const tileBottom = Math.floor(bottom / tileSize);

			if (this.isSolidTileInRow(tileBottom, tileLeft, tileRight)) {
				// Snap so hitbox bottom sits on tile top edge
				const tileTopEdge = tileBottom * tileSize;
				entity.position.y = tileTopEdge - (entity.hitboxOffset.y + entity.hitboxHeight);
				entity.velocity.y = 0;
				entity.isOnGround = true;
			}
		} else {
			// Moving UP: check row above top edge
			const tileTop = Math.floor(top / tileSize);

			if (this.isSolidTileInRow(tileTop, tileLeft, tileRight)) {
				// Snap so hitbox top sits under tile bottom edge
				const tileBottomEdge = (tileTop + 1) * tileSize;
				entity.position.y = tileBottomEdge - entity.hitboxOffset.y;
				entity.velocity.y = 0;
			}
		}
	}

	isSolidTileInColumn(x, yStart, yEnd) {
		for (let y = yStart; y <= yEnd; y++) {
			if (this.map.isSolidTileAt(x, y)) return true;
		}
		return false;
	}

	isSolidTileInRow(y, xStart, xEnd) {
		for (let x = xStart; x <= xEnd; x++) {
			if (this.map.isSolidTileAt(x, y)) return true;
		}
		return false;
	}
}