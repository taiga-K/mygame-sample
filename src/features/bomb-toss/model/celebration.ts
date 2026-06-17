import type { Vec } from "@/shared/lib/physics";

export type ConfettiParticle = {
  pos: Vec;
  vel: Vec;
  size: number;
  rotation: number;
  spin: number;
  color: string;
  life: number;
  maxLife: number;
};

const CONFETTI_COLORS = [
  "#17b890",
  "#f3b33d",
  "#ff5a5f",
  "#38bdf8",
  "#ffffff",
  "#5b45d9",
];

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

export const spawnClearConfetti = (width: number, height: number, count = 90): ConfettiParticle[] => {
  const particles: ConfettiParticle[] = [];

  for (let index = 0; index < count; index += 1) {
    const maxLife = randomBetween(2.4, 4.2);
    particles.push({
      pos: {
        x: randomBetween(width * 0.08, width * 0.92),
        y: randomBetween(-80, height * 0.15),
      },
      vel: {
        x: randomBetween(-90, 90),
        y: randomBetween(120, 280),
      },
      size: randomBetween(6, 14),
      rotation: randomBetween(0, Math.PI * 2),
      spin: randomBetween(-8, 8),
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? "#17b890",
      life: 0,
      maxLife,
    });
  }

  return particles;
};

export const updateConfetti = (particles: ConfettiParticle[], dt: number): ConfettiParticle[] => {
  const next: ConfettiParticle[] = [];

  for (const particle of particles) {
    const life = particle.life + dt;

    if (life >= particle.maxLife) {
      continue;
    }

    next.push({
      ...particle,
      life,
      pos: {
        x: particle.pos.x + particle.vel.x * dt,
        y: particle.pos.y + particle.vel.y * dt,
      },
      vel: {
        x: particle.vel.x * 0.992,
        y: particle.vel.y + 180 * dt,
      },
      rotation: particle.rotation + particle.spin * dt,
    });
  }

  return next;
};

export const easeOutBack = (progress: number) => {
  const clamped = Math.min(1, Math.max(0, progress));
  const c1 = 1.70158;
  const c3 = c1 + 1;

  return 1 + c3 * (clamped - 1) ** 3 + c1 * (clamped - 1) ** 2;
};

export const easeOutCubic = (progress: number) => 1 - (1 - Math.min(1, Math.max(0, progress))) ** 3;
