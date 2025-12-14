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

/**
 * ============================================================
 * PLAY STATE
 * ============================================================
 */
export default class PlayState extends State {
  /* ============================================================
   * CONSTRUCTOR / SETUP
   * ============================================================ */
  constructor(loadedLevels) {
    super();

    this.FALL_OUT_PADDING = -40;

    this.levels = loadedLevels;
    this.levelOrder = Object.keys(loadedLevels);
    this.currentLevelIndex = 0;
    this.mainMusicStarted = false;
    this.justLoadedLevel = false;
    // Fade / death juice
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
    if (index < 0 || index >= this.levelOrder.length) return;

    const level = this.levels[this.levelOrder[index]];
    this.currentLevelIndex = index;

    this.sympathyManager.reset();
    this.map.destroy();

    const freshDefinition = structuredClone(level.definition);
    this.map = new Map(freshDefinition);

    for (const obj of this.map.gameObjects) {
      if (obj.collisionDetector) {
        obj.collisionDetector.setMap(this.map);
      }
    }

    this.player.reset(level.spawn.x, level.spawn.y);
    this.player.map = this.map;

    for (const state of Object.values(this.player.stateMachine.states)) {
      if (state.collisionDetector) {
        state.collisionDetector.setMap(this.map);
      }
    }

    this.camera.setBounds(
      this.map.width * Tile.SIZE,
      this.map.height * Tile.SIZE
    );

    this.respawnYThreshold = this.map.height * Tile.SIZE + 100;
    this.justLoadedLevel = true;
  }

  /* ============================================================
   * UPDATE LOOP
   * ============================================================ */
  update(dt) {
    timer.update(dt);
    this.debug.update();

    if (input.isKeyPressed(Input.KEYS.ESCAPE)) {
      if (this.sympathyManager.active || this.sympathyManager.hasActiveLink()) {
        this.sympathyManager.breakLink();
      } else {
        this.stateMachine.change(GameStateName.Pause, { playState: this });
      }
    }
    if (sounds.sounds.intro.isEnded() && !this.mainMusicStarted) {
      this.mainMusicStarted = true;
      sounds.play(MusicName.Main);
    }

    // Resolve spawn collisions
    if (this.justLoadedLevel) {
      this.map.resolveTileCollisions(this.player);
      this.player.velocity.y = 0;
      this.justLoadedLevel = false;
    }

    // Fade takes priority
    if (this.isFadingOut) {
      this.checkDeathFall();
      return;
    }

    // 🔴 SYMPATHY HAS PRIORITY 🔴
    if (this.sympathyManager.active) {
      this.sympathyManager.update(dt);
      return;
    }

    // --- Normal gameplay ---
    this.map.update(dt);
    this.camera.update(dt);

    this.player.isOnGround = false;
    this.player.update(dt);

    this.map.resolveGameObjectCollisions(this.player);
    this.sympathyManager.update(dt);

    this.checkGoalTrigger();
    this.checkDeathFall();

    // Enter Sympathy
    if (
      input.isKeyPressed(Input.KEYS.ENTER) &&
      !this.sympathyManager.active &&
      !this.sympathyManager.hasActiveLink()
    ) {
      this.stateMachine.change(GameStateName.Link, {
        returnState: GameStateName.Play,
      });
    }
  }

  /* ============================================================
   * RENDER LOOP
   * ============================================================ */
  render(context) {
    // 🟦 1. CLEAR + SKY (screen space)
    this.renderSkyGradient(context);

    // 🌌 2. FALL BACKGROUND (screen space)
    this.renderFallGradient(context, this.getFallBlend());

    // 🌍 3. WORLD (camera space)
    this.camera.applyTransform(context);

    if (!debugOptions.mapGrid) {
      this.renderParallaxBackground(context);
    }

    this.map.render(context);
    this.player.render(context);
    this.sympathyManager.render(context);

    this.camera.resetTransform(context);

    // 🧠 4. UI (screen space)
    this.sympathyPanel.render();
    this.renderFadeOverlay(context);

    // 🧪 5. DEBUG
    if (debugOptions.cameraCrosshair) {
      this.renderCameraGuidelines(context);
      this.renderLookahead(context);
    }

    if (debugOptions.watchPanel) {
      this.setDebugPanel();
    } else {
      this.debug.unwatch("Map");
      this.debug.unwatch("Camera");
      this.debug.unwatch("Player");
    }
  }

  /* ============================================================
   * DEATH / FALL JUICE
   * ============================================================ */
  checkDeathFall() {
    if (this.isFadingOut) return;

    if (this.player.position.y > this.respawnYThreshold) {
      this.triggerDeathReset();
    }
  }

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

  getFallBlend() {
    const start = this.map.height * Tile.SIZE - canvas.height * 0.5;
    const end = this.respawnYThreshold;
    return Math.max(
      0,
      Math.min(1, (this.player.position.y - start) / (end - start))
    );
  }

  /* ============================================================
   * BACKGROUNDS
   * ============================================================ */
  renderSkyGradient(context) {
    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#6ec6ff");
    gradient.addColorStop(0.6, "#cfe9ff");
    gradient.addColorStop(1, "#ffffff");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }

  renderFallGradient(context, alpha) {
    if (alpha <= 0) return;

    context.save();
    context.globalAlpha = alpha;

    const gradient = context.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, "#2b1b3d");
    gradient.addColorStop(0.5, "#12081f");
    gradient.addColorStop(1, "#000000");

    context.fillStyle = gradient;
    context.fillRect(0, 0, canvas.width, canvas.height);

    context.restore();
  }

  renderParallaxBackground(context) {
    this.parallaxLayers.forEach((layer) => {
      const parallaxX = -this.camera.position.x * layer.speedX;
      const rawY = -this.camera.position.y * layer.speedY;

      const maxY = 0;
      const minY = canvas.height - layer.image.height;
      const parallaxY = Math.max(minY, Math.min(maxY, rawY));

      const repsX = Math.ceil(canvas.width / layer.image.width) + 1;

      for (let x = 0; x < repsX; x++) {
        const drawX = (parallaxX % layer.image.width) + x * layer.image.width;
        layer.image.render(context, drawX, parallaxY);
      }
    });
  }

  renderFadeOverlay(context) {
    if (this.fade.alpha <= 0) return;

    context.save();
    context.globalAlpha = this.fade.alpha;
    context.fillStyle = "#000";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.restore();
  }

  /* ============================================================
   * GOALS
   * ============================================================ */
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

  /* ============================================================
   * DEBUG
   * ============================================================ */
  renderLookahead(context) {
    const pos = this.camera.getLookaheadPosition();
    context.strokeStyle = "red";
    context.beginPath();
    context.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    context.stroke();
  }

  renderCameraGuidelines(context) {
    context.setLineDash([5, 5]);
    context.strokeStyle = "white";
    context.beginPath();
    context.moveTo(canvas.width / 2, 0);
    context.lineTo(canvas.width / 2, canvas.height);
    context.stroke();
    context.setLineDash([]);
  }

  setDebugPanel() {
    this.debug.watch("Player", {
      position: () =>
        `(${this.player.position.x.toFixed(
          1
        )}, ${this.player.position.y.toFixed(1)})`,
      velocity: () =>
        `(${this.player.velocity.x.toFixed(
          1
        )}, ${this.player.velocity.y.toFixed(1)})`,
      onGround: () => this.player.isOnGround,
    });
  }
  renderSympathyLinks(ctx) {
    this.sympathyManager.render(ctx);
  }

  renderSympathySelection(ctx) {
    const mgr = this.sympathyManager;
    if (!mgr.active || mgr.viableObjects.length === 0) return;

    ctx.save();
    ctx.lineWidth = 2;

    // Current selection
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

    // First selected object
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
}
