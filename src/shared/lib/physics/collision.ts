import type { Rect, Vec } from "./types";
import { clamp, length, normalize } from "./vector";

export type CircleRectCollision = {
  normal: Vec;
  depth: number;
  point: Vec;
};

export const circleRectCollision = (
  center: Vec,
  radius: number,
  rect: Rect,
): CircleRectCollision | null => {
  const point = {
    x: clamp(center.x, rect.x, rect.x + rect.width),
    y: clamp(center.y, rect.y, rect.y + rect.height),
  };
  const delta = {
    x: center.x - point.x,
    y: center.y - point.y,
  };
  const deltaLength = length(delta);

  if (deltaLength >= radius) {
    return null;
  }

  if (deltaLength > 0) {
    return {
      normal: normalize(delta),
      depth: radius - deltaLength,
      point,
    };
  }

  const distances = [
    { normal: { x: -1, y: 0 }, value: Math.abs(center.x - rect.x) },
    { normal: { x: 1, y: 0 }, value: Math.abs(rect.x + rect.width - center.x) },
    { normal: { x: 0, y: -1 }, value: Math.abs(center.y - rect.y) },
    { normal: { x: 0, y: 1 }, value: Math.abs(rect.y + rect.height - center.y) },
  ];
  const nearest = distances.reduce((current, candidate) =>
    candidate.value < current.value ? candidate : current,
  );

  return {
    normal: nearest.normal,
    depth: radius,
    point,
  };
};
