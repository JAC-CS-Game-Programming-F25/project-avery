import Panel from "./Panel.js";
import { context } from "../globals.js";
import FontName from "../enums/FontName.js";

const MAX_SCREEN_HEIGHT_RATIO = 0.9;
const MIN_PANEL_SCALE = 0.75;
const HUD_SCALE = 0.6;

export default class SympathyPanel extends Panel {
  constructor(player, sympathyManager) {
    super(0, 0, 5.5, 0); 

    this.player = player;
    this.sympathyManager = sympathyManager;

    this.cornerRadius = 8;
    this.candleFlameOffset = 0;
    this.flameFlickerSpeed = 0.003;

    this.pulseTime = 0;
    this.panelScale = 1;
    this.rawHeight = 0;
  }

  update(dt) {
    this.pulseTime += dt;
    this.candleFlameOffset = Math.sin(Date.now() * this.flameFlickerSpeed) * 2;

    const baseHeight = 5;
    const linkHeight = this.sympathyManager.activeLink ? 8 : 0;

    this.rawHeight = baseHeight + linkHeight;

    const pixelHeight = this.rawHeight * this.tileSize;
    const maxHeight = context.canvas.height * MAX_SCREEN_HEIGHT_RATIO;

    this.panelScale = Math.min(1, maxHeight / pixelHeight);
    this.panelScale = Math.max(this.panelScale, MIN_PANEL_SCALE);

    this.dimensions.y = this.rawHeight * this.panelScale;
  }

  render() {
    if (!this.isVisible) return;

    const margin = 16;

    // Scale panel down
    this.scale = HUD_SCALE;

    // Shrink effective dimensions
    const scaledWidth = this.dimensions.x * this.scale;
    const scaledHeight = this.dimensions.y * this.scale;

    // Anchor to top-right, pulled LEFT and UP
    this.position.x = context.canvas.width - scaledWidth - margin - 40;
    this.position.y = context.canvas.height * 0.12;

    // Safety clamp (never leave screen)
    this.position.x = Math.max(margin, this.position.x);
    this.position.y = Math.max(margin, this.position.y);

    context.save();
    context.translate(this.position.x, this.position.y);
    context.scale(this.scale, this.scale);
    context.translate(-this.position.x, -this.position.y);

    this.renderBackground();
    this.renderConcentrationSection();

    if (this.sympathyManager.activeLink) {
      this.renderLinkSection();
    }

    context.restore();
  }

  /* ================= BACKGROUND ================= */

  renderBackground() {
    const { x, y } = this.position;
    const { x: w, y: h } = this.dimensions;

    context.save();

    const gradient = context.createLinearGradient(x, y, x + w, y + h);
    gradient.addColorStop(0, "rgba(25, 30, 45, 0.95)");
    gradient.addColorStop(1, "rgba(15, 18, 30, 0.98)");

    context.fillStyle = gradient;
    this.roundRect(x, y, w, h, this.cornerRadius);
    context.fill();

    context.shadowColor = "rgba(100, 150, 255, 0.3)";
    context.shadowBlur = 20;

    context.strokeStyle = "rgba(255, 200, 100, 0.4)";
    context.lineWidth = 2;
    this.roundRect(x, y, w, h, this.cornerRadius);
    context.stroke();

    context.shadowBlur = 0;
    context.restore();
  }

  /* ================= CONCENTRATION ================= */

  renderConcentrationSection() {
    const centerX = this.position.x + this.dimensions.x / 2;
    const startY = this.position.y + this.padding + 10;

    this.drawHeader("✦ CONCENTRATION ✦", centerX, startY);
    this.renderCandleMeter(centerX, startY + 30);
  }

  renderCandleMeter(centerX, baseY) {
    const pct = this.player.currentConcentration / this.player.maxConcentration;

    const candleWidth = 40;
    const candleHeight = 60;
    const wickHeight = 12;

    context.save();

    const gradient = context.createLinearGradient(
      centerX,
      baseY,
      centerX,
      baseY + candleHeight
    );
    gradient.addColorStop(0, "#e8dcc0");
    gradient.addColorStop(1, "#d4c4a8");

    context.fillStyle = gradient;
    this.roundRect(
      centerX - candleWidth / 2,
      baseY,
      candleWidth,
      candleHeight,
      4
    );
    context.fill();

    context.fillStyle = "#222";
    context.fillRect(centerX - 1, baseY - wickHeight, 2, wickHeight);

    if (pct > 0) {
      const flameHeight = 20 * pct + this.candleFlameOffset;
      const flameY = baseY - wickHeight - flameHeight;

      const flameGradient = context.createRadialGradient(
        centerX,
        flameY + flameHeight * 0.7,
        0,
        centerX,
        flameY + flameHeight * 0.7,
        12
      );
      flameGradient.addColorStop(0, "#ffffcc");
      flameGradient.addColorStop(0.4, "#ffcc00");
      flameGradient.addColorStop(1, "rgba(255,120,0,0)");

      context.fillStyle = flameGradient;
      context.beginPath();
      context.ellipse(
        centerX,
        flameY + flameHeight / 2,
        6,
        flameHeight / 2,
        0,
        0,
        Math.PI * 2
      );
      context.fill();
    }

    context.font = `bold 14px ${FontName.Medieval}`;
    context.fillStyle = "#ffd700";
    context.textAlign = "center";
    context.fillText(
      `${Math.round(pct * 100)}%`,
      centerX,
      baseY + candleHeight + 18
    );

    context.restore();
  }

  /* ================= LINK ================= */

  renderLinkSection() {
    const link = this.sympathyManager.activeLink;
    if (!link) return;

    let y = this.position.y + this.dimensions.y / 2 + 10;

    this.renderDivider(y);
    y += 20;

    this.drawHeader(
      "✦ ACTIVE LINK ✦",
      this.position.x + this.dimensions.x / 2,
      y
    );
    y += 25;

    this.renderSimilarityCircle(
      this.position.x + this.dimensions.x / 2,
      y + 150,
      link.similarity
    );
  }

  renderDivider(y) {
    const x = this.position.x + this.padding;
    const w = this.dimensions.x - this.padding * 2;

    context.save();
    context.strokeStyle = "rgba(255,200,100,0.3)";
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + w, y);
    context.stroke();
    context.restore();
  }

  renderSimilarityCircle(cx, cy, similarity) {
    const r = 36;

    context.save();

    context.strokeStyle = "rgba(0,0,0,0.5)";
    context.lineWidth = 8;
    context.beginPath();
    context.arc(cx, cy, r, 0, Math.PI * 2);
    context.stroke();

    context.strokeStyle = "#4aa3ff";
    context.beginPath();
    context.arc(
      cx,
      cy,
      r,
      -Math.PI / 2,
      -Math.PI / 2 + similarity * Math.PI * 2
    );
    context.stroke();

    context.font = `bold 18px ${FontName.Medieval}`;
    context.fillStyle = "#4aa3ff";
    context.textAlign = "center";
    context.fillText(`${Math.round(similarity * 100)}%`, cx, cy + 6);

    context.restore();
  }

  /* ================= UTIL ================= */

  drawHeader(text, x, y) {
    context.save();
    context.font = `11px ${FontName.Medieval}`;
    context.fillStyle = "rgba(255,200,100,0.7)";
    context.textAlign = "center";
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
