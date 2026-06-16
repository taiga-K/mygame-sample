import type { Rect, Vec } from "@/shared/lib/physics";

export type Platform = Rect & {
  id: string;
  sourceId: string;
  role: "floor" | "wall";
  color?: string;
};

export type PlatformSkin = "floor" | "floor-wall-right" | "floor-wall-left" | "floating-wall";

export type PlatformComponent = Rect & {
  id: string;
  skin: PlatformSkin;
  color?: string;
};

export type LevelObjectSeed = {
  id: string;
  kind: "enemy" | "crate";
  pos: Vec;
  radius: number;
  mass?: number;
  color: string;
};

export type LevelDefinition = {
  id: number;
  name: string;
  bombs: number;
  thrower: Vec;
  objects: LevelObjectSeed[];
  terrain: PlatformComponent[];
};
