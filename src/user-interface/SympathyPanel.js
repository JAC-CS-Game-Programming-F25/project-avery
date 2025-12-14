import Panel from "./Panel.js";
import Colour from "../enums/Colour.js";
import { context } from "../globals.js";

export default class SympathyPanel extends Panel {
    constructor(player, sympathyManager) {
        super(0.5, 0.5, 7, 3.2);

        this.player = player;
        this.sympathyManager = sympathyManager;

        this.barHeight = 12;
        this.cornerRadius = 6;
    }

    render() {
        if (!this.isVisible) return;

        this.renderBackground();
        this.renderConcentrationBar();
        this.renderLinkInfo();
    }

    // ---------- Background ----------
    renderBackground() {
        const { x, y } = this.position;
        const { x: w, y: h } = this.dimensions;

        context.save();

        context.fillStyle = "rgba(0, 0, 0, 0.55)";
        this.roundRect(x, y, w, h, this.cornerRadius);
        context.fill();

        context.strokeStyle = "rgba(255, 255, 255, 0.15)";
        context.lineWidth = 1;
        this.roundRect(x, y, w, h, this.cornerRadius);
        context.stroke();

        context.restore();
    }

    // ---------- Concentration ----------
    renderConcentrationBar() {
        const padding = this.padding;
        const barX = this.position.x + padding;
        const barY = this.position.y + padding + 8;
        const barWidth = this.dimensions.x - padding * 2;

        const pct =
            this.player.currentConcentration /
            this.player.maxConcentration;

        // Backing
        context.fillStyle = "rgba(0,0,0,0.5)";
        this.roundRect(barX, barY, barWidth, this.barHeight, 4);
        context.fill();

        const gradient = context.createLinearGradient(
            barX,
            0,
            barX + barWidth,
            0
        );

        gradient.addColorStop(0, "#9bdcff");
        gradient.addColorStop(1, "#4aa3ff");

        context.fillStyle = gradient;
        this.roundRect(
            barX,
            barY,
            barWidth * Math.max(0, pct),
            this.barHeight,
            4
        );
        context.fill();

        this.drawText(
            "CONCENTRATION",
            barX,
            barY - 6,
            "11px monospace"
        );
    }

    // ---------- Link ----------
    renderLinkInfo() {
        const link = this.sympathyManager.activeLink;
        if (!link) return;

        let y =
            this.position.y +
            this.padding +
            this.barHeight +
            28;

        const x = this.position.x + this.padding;

        // Header
        this.drawText(
            `LINK ACTIVE — ${(link.similarity * 100).toFixed(0)}%`,
            x,
            y,
            "12px monospace"
        );

        y += 14;

        // Object A
        this.renderObjectBlock("A", link.objectA, x, y);
        y += 46;

        // Object B
        this.renderObjectBlock("B", link.objectB, x, y);
    }

    renderObjectBlock(label, obj, x, y) {
        const blockWidth = this.dimensions.x - this.padding * 2;
        const blockHeight = 40;

        // Backing
        context.fillStyle = "rgba(0,0,0,0.35)";
        this.roundRect(x, y, blockWidth, blockHeight, 4);
        context.fill();

        this.drawText(
            `Object ${label}: ${obj.type}`,
            x + 6,
            y + 12,
            "11px monospace"
        );

        this.drawText(
            `Temp: ${obj.temp.toFixed(1)}°   Stress: ${obj.stress.toFixed(2)}`,
            x + 6,
            y + 24,
            "10px monospace"
        );

        this.drawText(
            `Mass: ${obj.mass}`,
            x + 6,
            y + 36,
            "10px monospace"
        );
    }

    // ---------- Text Utility ----------
    drawText(text, x, y, font) {
        context.save();

        context.font = font;
        context.fillStyle = "#f2f4ff";
        context.shadowColor = "rgba(0,0,0,0.7)";
        context.shadowBlur = 4;
        context.shadowOffsetY = 1;

        context.fillText(text, x, y);

        context.restore();
    }

    roundRect(x, y, w, h, r) {
        context.beginPath();
        context.moveTo(x + r, y);
        context.lineTo(x + w - r, y);
        context.quadraticCurveTo(x + w, y, x + w, y + r);
        context.lineTo(x + w, y + h - r);
        context.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        context.lineTo(x + r, y + h);
        context.quadraticCurveTo(x, y + h, x, y + h - r);
        context.lineTo(x, y + r);
        context.quadraticCurveTo(x, y, x + r, y);
        context.closePath();
    }
}
