export default class LevelManager {
  constructor(game) {
    this.game = game;
    this.currentLevelIndex = 0;
    this.map = null;
  }

  async loadLevel(index) {
    // 1. Tear down old map
    if (this.map) {
      this.map.destroy();
      this.map = null;
    }

    // 2. Load new map
    const level = LEVELS[index];
    this.map = await Map.load(level.mapPath, this.game);

    // 3. Spawn player
    this.map.spawnPlayer(level.spawn);

    this.currentLevelIndex = index;
  }

  nextLevel() {
    this.loadLevel(this.currentLevelIndex + 1);
  }

  update(dt) {
    this.map?.update(dt);
  }

  render(ctx) {
    this.map?.render(ctx);
  }
}
