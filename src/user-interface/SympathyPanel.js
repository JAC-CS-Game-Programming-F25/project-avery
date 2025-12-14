import Panel from "./Panel.js";
import Colour from "../enums/Colour.js";
import { context } from "../globals.js";

export default class SympathyPanel extends Panel {
    constructor(player, sympathyManager) {
        super(
            0.5,   
            0.5,   
            6,     
            1.5,   
            {
                borderColour: Colour.Grey,
                panelColour: Colour.White,
            }
        );

        this.player = player;
        this.sympathyManager = sympathyManager;
    }

    render() {
        if (!this.isVisible) return;

        // super.render();
        this.renderConcentration();
        this.renderLinkInfo();
    }

    renderConcentration() {
        const padding = this.padding;
        const barX = this.position.x + padding - 15;
        const barY = this.position.y + padding;
        const barWidth = this.dimensions.x - padding * 2;
        const barHeight = 10;

        const pct =
            this.player.currentConcentration / this.player.maxConcentration;

        // Background
        context.fillStyle = "#222";
        context.fillRect(barX, barY, barWidth, barHeight);

        // Bar colour
        context.fillStyle =
            pct > 0.6 ? "#4caf50" :
            pct > 0.3 ? "#ff9800" :
                        "#f44336";

        context.fillRect(barX, barY, barWidth * pct, barHeight);

        context.strokeStyle = "#000";
        context.strokeRect(barX, barY, barWidth, barHeight);

        context.fillStyle = "#000";
        context.font = "12px monospace";
        context.fillText(
            `Concentration`,
            barX,
            barY - 6
        );
    }

    renderLinkInfo() {
        const link = this.sympathyManager.activeLink;
        if (!link) return;

        const textX = this.position.x + this.padding + 100;
        const textY = this.position.y + this.padding;

        context.fillStyle = "#000";
        context.font = "12px monospace";

        context.fillText(
            `Link active`,
            textX,
            textY
        );

        context.fillText(
            `Efficiency: ${(link.similarity * 100).toFixed(0)}%`,
            textX,
            textY + 14
        );
    }
}