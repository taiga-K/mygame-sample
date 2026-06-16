import type { Vec } from "./types";

export const add = (a: Vec, b: Vec): Vec => ({ x: a.x + b.x, y: a.y + b.y });

export const sub = (a: Vec, b: Vec): Vec => ({ x: a.x - b.x, y: a.y - b.y });

export const mul = (a: Vec, scalar: number): Vec => ({ x: a.x * scalar, y: a.y * scalar });

export const dot = (a: Vec, b: Vec) => a.x * b.x + a.y * b.y;

export const length = (value: Vec) => Math.hypot(value.x, value.y);

export const normalize = (value: Vec): Vec => {
  const vectorLength = length(value);

  if (vectorLength === 0) {
    return { x: 0, y: 0 };
  }

  return {
    x: value.x / vectorLength,
    y: value.y / vectorLength,
  };
};

export const distance = (a: Vec, b: Vec) => length(sub(a, b));

export const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

export const reflect = (velocity: Vec, normal: Vec, restitution: number): Vec => {
  const impulse = (1 + restitution) * dot(velocity, normal);

  return {
    x: velocity.x - impulse * normal.x,
    y: velocity.y - impulse * normal.y,
  };
};
