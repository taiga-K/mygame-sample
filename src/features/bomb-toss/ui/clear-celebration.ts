import { roundedRectPath } from "@/shared/lib/canvas";

import type { GamePhase } from "../model";

const VIEW_WIDTH = 1000;
const VIEW_HEIGHT = 620;

type ParticleShape = "rect" | "circle" | "star";

export type CelebrationParticle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  spin: number;
  shape: ParticleShape;
  life: number;
  maxLife: number;
};

export type CelebrationSession = {
  startedAt: number;
  lastUpdatedAt: number;
  particles: CelebrationParticle[];
};

const CELEBRATION_COLORS = ["#ffd54f", "#ff6b6b", "#4dd0a8", "#5b8cff", "#ff9f43", "#fff176", "#f48fb1"];


const pickColor = () => CELEBRATION_COLORS[Math.floor(Math.random() * CELEBRATION_COLORS.length)] ?? "#ffd54f";

const pickShape = (): ParticleShape => {
  const roll = Math.random();

  if (roll < 0.45) {
    return "rect";
  }

  if (roll < 0.8) {
    return "circle";
  }

  return "star";
};

const createParticle = (
  x: number,
  y: number,
  vx: number,
  vy: number,
  size: number,
): CelebrationParticle => ({
  x,
  y,
  vx,
  vy,
  size,
  color: pickColor(),
  rotation: Math.random() * Math.PI * 2,
  spin: (Math.random() - 0.5) * 9,
  shape: pickShape(),
  life: 0,
  maxLife: 2.2 + Math.random() * 1.8,
});

export const createCelebrationSession = (now: number): CelebrationSession => {
  const particles: CelebrationParticle[] = [];

  for (let index = 0; index < 72; index += 1) {
    particles.push(
      createParticle(
        120 + Math.random() * (VIEW_WIDTH - 240),
        -30 - Math.random() * 120,
        (Math.random() - 0.5) * 220,
        140 + Math.random() * 220,
        4 + Math.random() * 9,
      ),
    );
  }

  for (let index = 0; index < 36; index += 1) {
    const angle = Math.random() * Math.PI * 2;
    const speed = 170 + Math.random() * 260;

    particles.push(
      createParticle(
        VIEW_WIDTH / 2,
        VIEW_HEIGHT / 2 - 18,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - 90,
        5 + Math.random() * 10,
      ),
    );
  }

  return { startedAt: now, lastUpdatedAt: now, particles };
};

const easeOutBack = (progress: number) => {
  const overshoot = 1.45;

  return 1 + (overshoot + 1) * (progress - 1) ** 3 + overshoot * (progress - 1) ** 2;
};

const drawStar = (
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  rotation: number,
) => {
  context.save();
  context.translate(x, y);
  context.rotate(rotation);
  context.beginPath();

  for (let point = 0; point < 5; point += 1) {
    const angle = (point * 4 * Math.PI) / 5 - Math.PI / 2;
    const px = Math.cos(angle) * radius;
    const py = Math.sin(angle) * radius;

    if (point === 0) {
      context.moveTo(px, py);
    } else {
      context.lineTo(px, py);
    }
  }

  context.closePath();
  context.fill();
  context.restore();
};

const drawParticle = (context: CanvasRenderingContext2D, particle: CelebrationParticle) => {
  const alpha = 1 - particle.life / particle.maxLife;

  context.save();
  context.globalAlpha = alpha;
  context.fillStyle = particle.color;

  switch (particle.shape) {
    case "circle":
      context.beginPath();
      context.arc(particle.x, particle.y, particle.size / 2, 0, Math.PI * 2);
      context.fill();
      break;
    case "star":
      drawStar(context, particle.x, particle.y, particle.size, particle.rotation);
      break;
    case "rect":
      context.translate(particle.x, particle.y);
      context.rotate(particle.rotation);
      context.fillRect(-particle.size / 2, -particle.size / 2, particle.size, particle.size * 0.62);
      break;
    default: {
      const exhaustive: never = particle.shape;
      return exhaustive;
    }
  }

  context.restore();
};

const updateParticles = (particles: CelebrationParticle[], dt: number) => {
  for (const particle of particles) {
    particle.life += dt;
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 320 * dt;
    particle.vx *= 0.992;
    particle.rotation += particle.spin * dt;
  }
};

const drawBackdrop = (context: CanvasRenderingContext2D, elapsed: number, phase: GamePhase) => {
  const pulse = 0.5 + Math.sin(elapsed * 4.2) * 0.08;

  context.save();
  context.fillStyle = "rgba(8, 16, 14, 0.52)";
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const glow = context.createRadialGradient(VIEW_WIDTH / 2, VIEW_HEIGHT / 2 - 10, 20, VIEW_WIDTH / 2, VIEW_HEIGHT / 2, 420);
  const glowColor =
    phase === "completed" ? `rgba(255, 214, 90, ${0.34 * pulse})` : `rgba(45, 214, 164, ${0.3 * pulse})`;
  glow.addColorStop(0, glowColor);
  glow.addColorStop(1, "rgba(8, 16, 14, 0)");
  context.fillStyle = glow;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  context.restore();
};

const drawSparkles = (context: CanvasRenderingContext2D, elapsed: number) => {
  const sparklePositions = [
    { x: 250, y: 150 },
    { x: 750, y: 150 },
    { x: 210, y: 430 },
    { x: 790, y: 430 },
    { x: 500, y: 110 },
  ];

  context.save();

  for (const [index, position] of sparklePositions.entries()) {
    const twinkle = 0.35 + Math.sin(elapsed * 6 + index * 1.4) * 0.65;
    context.globalAlpha = twinkle;
    context.fillStyle = "#fff8d6";
    drawStar(context, position.x, position.y, 10 + index * 1.2, elapsed * 1.6 + index);
  }

  context.restore();
};

const drawVictoryPanel = (
  context: CanvasRenderingContext2D,
  phase: GamePhase,
  elapsed: number,
  title: string,
  subtitle: string,
) => {
  const enterProgress = Math.min(elapsed / 0.55, 1);
  const scale = 0.72 + easeOutBack(enterProgress) * 0.28;
  const panelX = 280;
  const panelY = 148;
  const panelWidth = 440;
  const panelHeight = 224;
  const centerX = panelX + panelWidth / 2;
  const centerY = panelY + panelHeight / 2;
  const pulse = 0.5 + Math.sin(elapsed * 5) * 0.5;

  context.save();
  context.translate(centerX, centerY);
  context.scale(scale, scale);
  context.translate(-centerX, -centerY);

  const outerGlow = context.createLinearGradient(panelX, panelY, panelX + panelWidth, panelY + panelHeight);
  outerGlow.addColorStop(0, "#ffe082");
  outerGlow.addColorStop(0.5, phase === "completed" ? "#ffca4d" : "#7cf0c8");
  outerGlow.addColorStop(1, "#ffd54f");
  context.shadowColor = phase === "completed" ? "rgba(255, 200, 64, 0.95)" : "rgba(45, 214, 164, 0.9)";
  context.shadowBlur = 28 + pulse * 16;
  context.lineWidth = 8;
  context.strokeStyle = outerGlow;
  roundedRectPath(context, panelX - 4, panelY - 4, panelWidth + 8, panelHeight + 8, 20);
  context.stroke();

  const panelGradient = context.createLinearGradient(panelX, panelY, panelX, panelY + panelHeight);
  panelGradient.addColorStop(0, "#ffffff");
  panelGradient.addColorStop(0.45, phase === "completed" ? "#fff8e8" : "#f2fff9");
  panelGradient.addColorStop(1, phase === "completed" ? "#ffe7b8" : "#d8f8ec");
  context.shadowBlur = 0;
  context.fillStyle = panelGradient;
  roundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 16);
  context.fill();

  context.strokeStyle = "rgba(23, 32, 31, 0.16)";
  context.lineWidth = 2;
  roundedRectPath(context, panelX, panelY, panelWidth, panelHeight, 16);
  context.stroke();

  const ribbonY = panelY + 34;
  context.fillStyle = phase === "completed" ? "#ffb300" : "#17b890";
  roundedRectPath(context, panelX + 36, ribbonY, panelWidth - 72, 42, 10);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "900 22px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(phase === "completed" ? "COMPLETE" : "STAGE CLEAR", centerX, ribbonY + 29);

  context.fillStyle = phase === "completed" ? "#8a5b00" : "#0f5f4d";
  context.font = "900 48px Inter, system-ui, sans-serif";
  context.fillText(title, centerX, panelY + 126);

  context.fillStyle = "#17201f";
  context.font = "700 20px Inter, system-ui, sans-serif";
  context.fillText(subtitle, centerX, panelY + 168);

  context.font = "700 16px Inter, system-ui, sans-serif";
  context.fillStyle = "rgba(23, 32, 31, 0.72)";
  context.fillText("クリック / Enter で続ける", centerX, panelY + 204);

  const cornerStars = [
    { x: panelX + 28, y: panelY + 24 },
    { x: panelX + panelWidth - 28, y: panelY + 24 },
    { x: panelX + 28, y: panelY + panelHeight - 24 },
    { x: panelX + panelWidth - 28, y: panelY + panelHeight - 24 },
  ];

  context.fillStyle = "#ffd54f";
  for (const [index, star] of cornerStars.entries()) {
    drawStar(context, star.x, star.y, 11, elapsed * 2.2 + index);
  }

  context.restore();
};

const MAX_PARTICLE_STEP = 1 / 30;

export const updateCelebrationSession = (celebration: CelebrationSession, now: number) => {
  const dt = Math.min((now - celebration.lastUpdatedAt) / 1000, MAX_PARTICLE_STEP);
  celebration.lastUpdatedAt = now;
  updateParticles(celebration.particles, dt);
};

export const drawClearCelebration = (
  context: CanvasRenderingContext2D,
  phase: GamePhase,
  celebration: CelebrationSession,
  now: number,
  title: string,
  subtitle: string,
) => {
  const elapsed = (now - celebration.startedAt) / 1000;

  drawBackdrop(context, elapsed, phase);
  drawSparkles(context, elapsed);

  for (const particle of celebration.particles) {
    if (particle.life < particle.maxLife) {
      drawParticle(context, particle);
    }
  }

  drawVictoryPanel(context, phase, elapsed, title, subtitle);
};

export const isCelebrationPhase = (phase: GamePhase) => phase === "cleared" || phase === "completed";
