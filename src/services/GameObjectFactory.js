import SympathyObject from "../entities/object/SympathyObject.js";
import CollectableObject from "../entities/object/CollectableObject.js";

export default class GameObjectFactory {
  static create({ objDef, map, sprites, properties = {} }) {
    if (!sprites || sprites.length === 0) return null;

    const baseConfig = {
      x: objDef.x,
      y: objDef.y - objDef.height, // Tiled Y fix
      width: objDef.width,
      height: objDef.height,
      map,
      mass: Number(properties.Weight ?? 1),
      temp: Number(properties.Temp ?? 20),
      sprite: sprites[0], // ✅ single sprite
      type: objDef.type,
    };

    switch (objDef.type) {
      case "Collectable":
        return new CollectableObject({
          ...baseConfig,
          value: Number(properties.Value ?? 1),
        });

      // Default: everything is sympathy-capable
      default:
        return new SympathyObject(baseConfig);
    }
  }
}
