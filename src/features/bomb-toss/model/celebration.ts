import { WORLD } from "@/shared/config";

import type { CelebrationFx, CelebrationParticle, TossGameState } from "./types";

const CELEBRATION_COLORS = ["#17b890", "#f6e6a0", "#ff5a5f", "#ffffff", "#4ecdc4", "#ffd166"];

const createParticle = (index: number): CelebrationParticle => {
  const spread = index / 48;

  return {
    x: spread * WORLD.width + (Math.random() - 0.5) * 80,
    y: -30 - Math.random() * 160,
    vx: (Math.random() - 0.5) * 220,
    vy: 140 + Math.random() * 220,
    rotation: Math.random() * Math.PI * 2,
    spin: (Math.random() - 0.5) * 10,
    color: CELEBRATION_COLORS[index % CELEBRATION_COLORS.length] ?? "#17b890",
    size: 6 + Math.random() * 9,
    shape: (index % 3) as 0 | 1 | 2,
  };
};

export const createCelebration = (): CelebrationFx => ({
  age: 0,
  particles: Array.from({ length: 52 }, (_, index) => createParticle(index)),
});

export const updateCelebration = (state: TossGameState, dt: number) => {
  if (!state.celebration) {
    return;
  }

  state.celebration.age += dt;

  for (const particle of state.celebration.particles) {
    particle.x += particle.vx * dt;
    particle.y += particle.vy * dt;
    particle.vy += 320 * dt;
    particle.vx *= 0.992;
    particle.rotation += particle.spin * dt;
  }
};
