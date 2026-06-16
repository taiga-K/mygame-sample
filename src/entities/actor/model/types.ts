import type { Vec } from "@/shared/lib/physics";

export type ActorKind = "bomb" | "enemy" | "crate";

export type ActorBody = {
  id: string;
  kind: ActorKind;
  pos: Vec;
  prevPos: Vec;
  vel: Vec;
  radius: number;
  mass: number;
  restitution: number;
  color: string;
  alive: boolean;
  touchedByBlast: boolean;
};
