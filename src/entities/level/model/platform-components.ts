import type { Rect } from "@/shared/lib/physics";

import type { Platform, PlatformComponent } from "./types";

type ColliderTemplate = Rect & {
  role: Platform["role"];
};

export const createPlatformColliders = (component: PlatformComponent): Platform[] => {
  switch (component.skin) {
    case "floor":
      return [createColliderFromTemplate(component, { role: "floor", x: 0.03, y: 0.235, width: 0.94, height: 0.535 })];
    case "floating-wall":
      return [createColliderFromTemplate(component, { role: "wall", x: 0.235, y: 0.025, width: 0.53, height: 0.94 })];
    case "floor-wall-right":
      return [
        createColliderFromTemplate(component, { role: "floor", x: 0.045, y: 0.7, width: 0.9, height: 0.245 }),
        createColliderFromTemplate(component, { role: "wall", x: 0.785, y: 0.035, width: 0.16, height: 0.91 }),
      ];
    case "floor-wall-left":
      return [
        createColliderFromTemplate(component, { role: "floor", x: 0.055, y: 0.695, width: 0.89, height: 0.25 }),
        createColliderFromTemplate(component, { role: "wall", x: 0.055, y: 0.055, width: 0.145, height: 0.89 }),
      ];
    default: {
      const exhaustive: never = component.skin;
      return exhaustive;
    }
  }
};

export const getLevelPlatforms = (level: { terrain: PlatformComponent[] }) =>
  level.terrain.flatMap((component) => createPlatformColliders(component));

const createColliderFromTemplate = (component: PlatformComponent, template: ColliderTemplate): Platform =>
  createCollider(
    component,
    template.role,
    component.x + component.width * template.x,
    component.y + component.height * template.y,
    component.width * template.width,
    component.height * template.height,
  );

const createCollider = (
  component: PlatformComponent,
  role: Platform["role"],
  x: number,
  y: number,
  width: number,
  height: number,
): Platform => ({
  id: `${component.id}-${role}`,
  sourceId: component.id,
  role,
  x,
  y,
  width,
  height,
  color: component.color,
});
