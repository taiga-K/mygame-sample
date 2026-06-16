import type { Vec } from "@/shared/lib/physics";

import type { ActorBody, ActorKind } from "./types";

type ActorBodyParams = {
  id: string;
  kind: ActorKind;
  pos: Vec;
  radius: number;
  mass?: number;
  restitution?: number;
  color: string;
};

export const createActorBody = ({
  id,
  kind,
  pos,
  radius,
  mass = 1,
  restitution = 0.42,
  color,
}: ActorBodyParams): ActorBody => ({
  id,
  kind,
  pos: { ...pos },
  prevPos: { ...pos },
  vel: { x: 0, y: 0 },
  radius,
  mass,
  restitution,
  color,
  alive: true,
  touchedByBlast: false,
});
