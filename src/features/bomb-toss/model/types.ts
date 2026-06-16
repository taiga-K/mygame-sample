import type { ActorBody } from "@/entities/actor";
import type { LevelDefinition } from "@/entities/level";
import type { Vec } from "@/shared/lib/physics";

export type GamePhase = "aiming" | "flying" | "exploding" | "settling" | "cleared" | "completed" | "failed";

export type SpriteAssets = {
  enemy: HTMLImageElement;
  bomb: HTMLImageElement;
  crate: HTMLImageElement;
  launcherBase: HTMLImageElement;
  launcherBarrel: HTMLImageElement;
  platformFloor: HTMLImageElement;
  platformWallRight: HTMLImageElement;
  platformWallLeft: HTMLImageElement;
  platformWallFloating: HTMLImageElement;
  stageBackgrounds: HTMLImageElement[];
  explosion: HTMLImageElement;
};

export type ActiveBomb = ActorBody & {
  fuse: number;
};

export type ExplosionFx = {
  pos: Vec;
  age: number;
  affected: number;
};

export type TossGameState = {
  levelIndex: number;
  level: LevelDefinition;
  phase: GamePhase;
  actors: ActorBody[];
  bomb: ActiveBomb | null;
  shotsUsed: number;
  aimTarget: Vec;
  pointerDown: boolean;
  explosion: ExplosionFx | null;
  message: string;
  lastTime: number;
  settleAge: number;
};
