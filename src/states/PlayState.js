import State from '../../lib/State.js';
import Debug from '../../lib/Debug.js';
import Map from '../services/Map.js';
import Camera from '../services/Camera.js';
import { canvas, debugOptions, images, sounds, timer } from '../globals.js';
import Player from '../entities/player/Player.js';
import Tile from '../services/Tile.js';
import ImageName from '../enums/ImageName.js';
import MusicName from '../enums/MusicName.js';
import SympathyPanel from '../user-interface/SympathyPanel.js';
import SympathyManager from '../services/SympathyManager.js';
/**
 * Represents the main play state of the game.
 * @extends State
 */
export default class PlayState extends State {
    constructor(mapDefinition) {
        super();

        this.map = new Map(mapDefinition);
        this.player = new Player(50, 150, this.map);
        this.camera = new Camera(
            this.player,
            canvas.width,
            canvas.height,
            this.map.width * Tile.SIZE,
            this.map.height * Tile.SIZE
        );

        this.debug = new Debug();

        // Background image pulled from Images system
        this.backgroundImage = images.get(ImageName.Background);

        // Parallax background layers
        this.parallaxLayers = [
            { image: this.backgroundImage, speedX: 0.04, speedY: 0.1 },
        ];

        this.sympathyManager = new SympathyManager(this.player);
        this.sympathyPanel = new SympathyPanel(
            this.player,
            this.sympathyManager
        );

        sounds.play(MusicName.Overworld);
    }

    update(dt) {
        timer.update(dt);
        this.debug.update();
        this.map.update(dt);
        this.camera.update(dt);

        this.player.update(dt);
        this.map.checkPlatformCollisions(this.player);
        this.sympathyManager.update(dt);

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
            this.debug.unwatch('Goombas');
            this.debug.unwatch('Coins');
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
