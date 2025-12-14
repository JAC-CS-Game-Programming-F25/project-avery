import State from '../../lib/State.js';
import Debug from '../../lib/Debug.js';
import Map from '../services/Map.js';
import Camera from '../services/Camera.js';
import { canvas, debugOptions, images, input, sounds, timer } from '../globals.js';
import Player from '../entities/player/Player.js';
import Tile from '../services/Tile.js';
import ImageName from '../enums/ImageName.js';
import MusicName from '../enums/MusicName.js';
import SympathyPanel from '../user-interface/SympathyPanel.js';
import SympathyManager from '../services/SympathyManager.js';
import Input from '../../lib/Input.js';
import GameStateName from '../enums/GameStateName.js'
/**
 * Represents the main play state of the game.
 * @extends State
 */
export default class PlayState extends State {
    constructor(loadedLevels) {
        super();

        this.levels = loadedLevels;
        this.levelOrder = Object.keys(loadedLevels);
        this.currentLevelIndex = 0;

        const first = this.levels[this.levelOrder[this.currentLevelIndex]];

        this.map = new Map(first.definition);
        this.player = new Player(first.spawn.x, first.spawn.y, this.map);

        this.camera = new Camera(
            this.player,
            canvas.width,
            canvas.height,
            this.map.width * Tile.SIZE,
            this.map.height * Tile.SIZE
        );
        this.debug = new Debug();

        this.sympathyManager = new SympathyManager(this.player);
        this.sympathyPanel = new SympathyPanel(this.player, this.sympathyManager);
        this.backgroundImage = images.get(ImageName.Background);
        this.parallaxLayers = [
            { image: this.backgroundImage, speedX: 0.04, speedY: 0.1 },
        ];

    }

    loadLevelByIndex(index) {
        if (index < 0 || index >= this.levelOrder.length) return;

        const level = this.levels[this.levelOrder[index]];
        this.currentLevelIndex = index;

        // Cleanup
        this.sympathyManager.reset();
        this.map.destroy();

        // Load new
        this.map = new Map(level.definition);

        this.player.reset(level.spawn.x, level.spawn.y);
        this.player.map = this.map;

        this.camera.setBounds(
            this.map.width * Tile.SIZE,
            this.map.height * Tile.SIZE
        );
    }
    update(dt) {
        timer.update(dt);
        this.debug.update();
        
        if (sounds.sounds.intro.isEnded() && !this.mainMusicStarted){
            this.mainMusicStarted = true;
            sounds.play(MusicName.Main)
        }
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

        if (input.isKeyPressed(Input.KEYS.ENTER)) {
            this.stateMachine.change(GameStateName.Link, {
                returnState: GameStateName.Play
            });
        }
        if (input.isKeyPressed(Input.KEYS.N)) {
            console.log(
                '[Level] Switching to next level:',
                this.levelOrder[this.currentLevelIndex + 1]
            );
            this.loadLevelByIndex(this.currentLevelIndex + 1);
        }

        if (input.isKeyPressed(Input.KEYS.P)) {
            console.log(
                '[Level] Switching to previous level:',
                this.levelOrder[this.currentLevelIndex - 1]
            );
            this.loadLevelByIndex(this.currentLevelIndex - 1);
        }
 
    }

    render(context) {
        this.camera.applyTransform(context);

        if (!debugOptions.mapGrid) {
            this.renderParallaxBackground(context);
        }

        this.map.render(context);
        this.player.render(context);

        this.camera.resetTransform(context);

        this.sympathyPanel.render();

        if (debugOptions.cameraCrosshair) {
            this.renderCameraGuidelines(context);
            this.renderLookahead(context);
        }

        if (debugOptions.watchPanel) {
            this.setDebugPanel();
        } else {
            this.debug.unwatch('Map');
            this.debug.unwatch('Camera');
            this.debug.unwatch('Player');
        }
    }

    enter() {}
    exit() {}

    /**
     * Parallax background — FIXED to use `render(context, x, y)`
     */
    renderParallaxBackground(context) {
        this.parallaxLayers.forEach((layer) => {
            const parallaxX = -this.camera.position.x * layer.speedX;
            const parallaxY = -this.camera.position.y * layer.speedY;

            const repetitionsX = Math.ceil(canvas.width / layer.image.width) + 1;
            const repetitionsY = Math.ceil(canvas.height / layer.image.height) + 1;

            for (let y = 0; y < repetitionsY; y++) {
                for (let x = 0; x < repetitionsX; x++) {
                    const drawX = (parallaxX % layer.image.width) + x * layer.image.width;
                    const drawY = (parallaxY % layer.image.height) + y * layer.image.height;

                    // ✔ FIX — call Graphic.render() correctly
                    layer.image.render(context, drawX, drawY);
                }
            }
        });
    }

    renderSympathySelection(ctx) {
        const mgr = this.sympathyManager;
        if (!mgr.active || mgr.viableObjects.length === 0) return;

        ctx.save();
        ctx.lineWidth = 2;

        // Current selection
        const current = mgr.viableObjects[mgr.selectionIndex];
        ctx.strokeStyle = 'cyan';
        ctx.strokeRect(
            current.hitboxX,
            current.hitboxY,
            current.hitboxWidth,
            current.hitboxHeight
        );

        // First selected object (if any)
        if (mgr.firstSelection) {
            ctx.strokeStyle = 'yellow';
            ctx.strokeRect(
                mgr.firstSelection.hitboxX,
                mgr.firstSelection.hitboxY,
                mgr.firstSelection.hitboxWidth,
                mgr.firstSelection.hitboxHeight
            );
        }

        ctx.restore();
    }
    renderSympathyLinks(ctx) {
        const links = this.sympathyManager.links;
        if (!links || links.length === 0) return;

        ctx.save();
        ctx.strokeStyle = 'rgba(150, 200, 255, 0.7)';
        ctx.lineWidth = 2;

        for (const link of links) {
            const a = link.a;
            const b = link.b;

            ctx.beginPath();
            ctx.moveTo(
                a.position.x + a.dimensions.x / 2,
                a.position.y + a.dimensions.y / 2
            );
            ctx.lineTo(
                b.position.x + b.dimensions.x / 2,
                b.position.y + b.dimensions.y / 2
            );
            ctx.stroke();
        }

        ctx.restore();
    }

        renderLookahead(context) {
        const lookaheadPos = this.camera.getLookaheadPosition();
        const size = 10;

        context.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        context.lineWidth = 2;

        context.beginPath();
        context.moveTo(lookaheadPos.x - size, lookaheadPos.y);
        context.lineTo(lookaheadPos.x + size, lookaheadPos.y);
        context.moveTo(lookaheadPos.x, lookaheadPos.y - size);
        context.lineTo(lookaheadPos.x, lookaheadPos.y + size);
        context.stroke();

        context.beginPath();
        context.arc(lookaheadPos.x, lookaheadPos.y, size / 2, 0, Math.PI * 2);
        context.stroke();
    }

    renderCameraGuidelines(context) {
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;

        context.setLineDash([5, 5]);
        context.lineWidth = 1;
        context.strokeStyle = 'rgba(255, 255, 255, 0.9)';

        context.beginPath();
        context.moveTo(centerX, 0);
        context.lineTo(centerX, canvas.height);
        context.stroke();

        context.beginPath();
        context.moveTo(0, centerY);
        context.lineTo(canvas.width, centerY);
        context.stroke();

        context.setLineDash([]);
    }

    setDebugPanel() {
        this.debug.watch('Map', {
            width: () => this.map.width,
            height: () => this.map.height,
        });

        this.debug.watch('Camera', {
            position: () =>
                `(${this.camera.position.x.toFixed(2)}, ${this.camera.position.y.toFixed(2)})`,
            lookahead: () =>
                `(${this.camera.lookahead.x.toFixed(2)}, ${this.camera.lookahead.y.toFixed(2)})`,
        });

        this.debug.watch('Player', {
            position: () =>
                `(${this.player.position.x.toFixed(2)}, ${this.player.position.y.toFixed(2)})`,
            velocity: () =>
                `(${this.player.velocity.x.toFixed(2)}, ${this.player.velocity.y.toFixed(2)})`,
            isOnGround: () => this.player.isOnGround,
            isBig: () => this.player.isBig,
            state: () => this.player.stateMachine.currentState.name,
        });
    }
}
