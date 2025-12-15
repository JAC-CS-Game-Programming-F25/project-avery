import State from "../../lib/State.js";
import Debug from "../../lib/Debug.js";
import Map from "../services/Map.js";
import Camera from "../services/Camera.js";
import {
  canvas,
  debugOptions,
  images,
  input,
  sounds,
  stateMachine,
  timer,
} from "../globals.js";
import Player from "../entities/player/Player.js";
import Tile from "../services/Tile.js";
import ImageName from "../enums/ImageName.js";
import MusicName from "../enums/MusicName.js";
import SympathyPanel from "../user-interface/SympathyPanel.js";
import SympathyManager from "../services/SympathyManager.js";
import Input from "../../lib/Input.js";
import GameStateName from "../enums/GameStateName.js";
import Easing from "../../lib/Easing.js";

export default class PlayState extends State {
  constructor(loadedLevels) {
    super();

    this.FALL_OUT_PADDING = -40;

    this.levels = loadedLevels;
    this.levelOrder = Object.keys(loadedLevels);
    this.currentLevelIndex = 0;

    this.mainMusicStarted = false;
    this.justLoadedLevel = false;

    this.isFadingOut = false;
    this.fade = { alpha: 0 };

    const first = this.levels[this.levelOrder[this.currentLevelIndex]];

    this.map = new Map(first.definition);
    this.respawnYThreshold = this.map.height * Tile.SIZE + 100;

    this.player = new Player(first.spawn.x, first.spawn.y, this.map);

    this.camera = new Camera(
      this.player,
      canvas.width,
      canvas.height,
      this.map.width * Tile.SIZE,
      this.map.height * Tile.SIZE
    );

    this.debug = new Debug();

    // Sympathy
    this.sympathyManager = new SympathyManager(this.player);
    this.sympathyPanel = new SympathyPanel(this.player, this.sympathyManager);

    // Background
    this.backgroundImage = images.get(ImageName.Background);
    this.parallaxLayers = [
      { image: this.backgroundImage, speedX: 0.04, speedY: 0.1 },
    ];
  }

  /* ============================================================
   * LEVEL LOADING
   * ============================================================ */
  loadLevelByIndex(index) {
    if (index >= this.levelOrder.length) {
      stateMachine.change(GameStateName.Victory);
      return "victory";
    }
    if (index < 0) return "invalid";

    const level = this.levels[this.levelOrder[index]];
    this.currentLevelIndex = index;

    this.sympathyManager.reset();
    this.map.destroy();

    const freshDefinition = structuredClone(level.definition);
    this.map = new Map(freshDefinition);

    for (const obj of this.map.gameObjects) {
      obj.collisionDetector?.setMap(this.map);
    }

    this.player.reset(level.spawn.x, level.spawn.y);
    this.player.map = this.map;

    for (const state of Object.values(this.player.stateMachine.states)) {
      state.collisionDetector?.setMap(this.map);
    }

    this.camera.setBounds(
      this.map.width * Tile.SIZE,
      this.map.height * Tile.SIZE
    );

    this.respawnYThreshold = this.map.height * Tile.SIZE + 100;
    this.justLoadedLevel = true;

    return "loaded";
  }

  /* ============================================================
   * UPDATE
   * ============================================================ */
  update(dt) {
    timer.update(dt);
    this.debug.update();

    //Escape is used for both pause and break link so this handles it
    if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
      if (this.sympathyManager.hasActiveLink()) {
        this.sympathyManager.breakLink();
        return;
      }
      if (this.sympathyManager.active) {
        this.sympathyManager.exit();
        return;
      }
      this.stateMachine.change(GameStateName.Pause, { playState: this });
      return;
    }

    // Music
    if (sounds.sounds.intro.isEnded() && !this.mainMusicStarted) {
      this.mainMusicStarted = true;
      sounds.play(MusicName.Main);
    }

    // I had a lot of issues with level loading so this handles it more or less smoothly
    if (this.justLoadedLevel) {
      this.map.resolveTileCollisions(this.player);
      this.player.velocity.y = 0;
      this.justLoadedLevel = false;
    }

    if (this.isFadingOut) {
      this.checkDeathFall();
      return;
    }

    // I had a state for this and then it became way too tightly coupled so like yah it just lives here cause it'll never be used without
    this.sympathyManager.update(dt);

    if (this.sympathyManager.active) {
      return;
    }

    // After all the checks and various other things we just  update everything and then handle sympathy
    this.map.update(dt);
    this.camera.update(dt);

    this.player.isOnGround = false;
    this.player.update(dt);

    this.map.resolveGameObjectCollisions(this.player);

    this.checkGoalTrigger();
    this.checkDeathFall();

    if (
      input.isKeyPressed(Input.KEYS.ENTER) &&
      !this.sympathyManager.active &&
      !this.sympathyManager.hasActiveLink()
    ) {
      this.sympathyManager.enter();
    }
  }

  /* ============================================================
   * RENDER
   * ============================================================ */
  render(ctx) {
    //Otherwise background repeats itself
    this.renderSkyGradient(ctx);
    this.renderFallGradient(ctx, this.getFallBlend());

    this.camera.applyTransform(ctx);

    //Every time i removed debug literally every single this broke so here we go
    if (!debugOptions.mapGrid) {
      this.renderParallaxBackground(ctx);
    }

    //Blah blah rendering stuff
    this.map.render(ctx);
    this.player.render(ctx);
    this.sympathyManager.render(ctx);

    //"Linkstate", just dims the screen and stuff
    if (this.sympathyManager.active) {
      ctx.save();
      ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
      ctx.fillRect(
        this.camera.position.x,
        this.camera.position.y,
        canvas.width,
        canvas.height
      );
      ctx.restore();

      this.renderSympathySelection(ctx);
    }

    this.camera.resetTransform(ctx);

    this.sympathyPanel.render();
    this.renderFadeOverlay(ctx);

    if (debugOptions.cameraCrosshair) {
      this.renderCameraGuidelines(ctx);
      this.renderLookahead(ctx);
    }
  }

  //Part of the background
  getFallBlend() {
    const start = this.map.height * Tile.SIZE - canvas.height * 0.5;
    const end = this.respawnYThreshold;

    return Math.max(
      0,
      Math.min(1, (this.player.position.y - start) / (end - start))
    );
  }
  /* ============================================================
   * GOAL / DEATH
   * ============================================================ */
  ///Checking if you interact with a goal object and then pushes you to the next level
  checkGoalTrigger() {
    if (!this.map.triggers) return;

    for (const trigger of this.map.triggers) {
      if (trigger.type !== "Goal") continue;

      const tx = trigger.x;
      const ty = trigger.y - trigger.height;

      const hit =
        this.player.hitboxX < tx + trigger.width &&
        this.player.hitboxX + this.player.hitboxWidth > tx &&
        this.player.hitboxY < ty + trigger.height &&
        this.player.hitboxY + this.player.hitboxHeight > ty;

      if (hit) {
        this.stateMachine.change(GameStateName.LevelTransition, {
          levelIndex: this.currentLevelIndex + 1,
        });
        return;
      }
    }
  }

  ///Checks if you've fallen off the map and handles it
  checkDeathFall() {
    if (this.player.position.y > this.respawnYThreshold) {
      this.triggerDeathReset();
    }
  }

  ///On 'dying' it just resets you to the beginning of the map. NOTE: this is a temporary solution since death will be added but this is a more forgiving feel for a demo and early levels
  triggerDeathReset() {
    if (this.isFadingOut) return;

    this.isFadingOut = true;
    this.fade.alpha = 0;

    this.player.velocity.x = 0;
    this.player.velocity.y = 0;

    this.camera.startShake?.(8, 0.3);

    timer.tween(this.fade, { alpha: 1 }, 0.35, Easing.outCubic, () => {
      const spawn = this.levels[this.levelOrder[this.currentLevelIndex]].spawn;

      this.player.reset(spawn.x, spawn.y);
      this.player.map = this.map;

      timer.tween(this.fade, { alpha: 0 }, 0.35, Easing.inCubic, () => {
        this.isFadingOut = false;
      });
    });
  }

  /* ============================================================
   * RENDER HELPERS
   * ============================================================ */
  renderSympathySelection(ctx) {
    const mgr = this.sympathyManager;
    if (!mgr.active || mgr.viableObjects.length === 0) return;

    ctx.save();
    ctx.lineWidth = 2;

    const current = mgr.viableObjects[mgr.selectionIndex];
    if (current) {
      ctx.strokeStyle = "cyan";
      ctx.strokeRect(
        current.hitboxX,
        current.hitboxY,
        current.hitboxWidth,
        current.hitboxHeight
      );
    }

    if (mgr.firstSelection) {
      ctx.strokeStyle = "yellow";
      ctx.strokeRect(
        mgr.firstSelection.hitboxX,
        mgr.firstSelection.hitboxY,
        mgr.firstSelection.hitboxWidth,
        mgr.firstSelection.hitboxHeight
      );
    }

    ctx.restore();
  }

  renderSkyGradient(ctx) {
    const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
    g.addColorStop(0, "#6ec6ff");
    g.addColorStop(0.6, "#cfe9ff");
    g.addColorStop(1, "#ffffff");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  renderFallGradient(ctx, alpha) {
    if (alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  renderParallaxBackground(ctx) {
    this.parallaxLayers.forEach((layer) => {
      const x = -this.camera.position.x * layer.speedX;
      const y = -this.camera.position.y * layer.speedY;
      layer.image.render(ctx, x, y);
    });
  }

  renderFadeOverlay(ctx) {
    if (this.fade.alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.fade.alpha;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();
  }

  renderLookahead(ctx) {
    const pos = this.camera.getLookaheadPosition();
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    ctx.stroke();
  }

  renderCameraGuidelines(ctx) {
    ctx.setLineDash([5, 5]);
    ctx.strokeStyle = "white";
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
  }
}
