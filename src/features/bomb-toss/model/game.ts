import { createActorBody } from "@/entities/actor";
import type { ActorBody } from "@/entities/actor";
import { getLevelPlatforms, LEVELS } from "@/entities/level";
import type { LevelDefinition } from "@/entities/level";
import { WORLD } from "@/shared/config";
import {
  add,
  circleRectCollision,
  clamp,
  distance,
  length,
  mul,
  normalize,
  reflect,
  sub,
} from "@/shared/lib/physics";
import type { Vec } from "@/shared/lib/physics";

import type { ActiveBomb, TossGameState } from "./types";

const MAX_STEP = 1 / 30;
const EXPLOSION_DURATION = 0.55;

export const createInitialState = (): TossGameState => createStateForLevel(0);

export const createStateForLevel = (levelIndex: number): TossGameState => {
  const level = LEVELS[levelIndex] ?? LEVELS[0];

  return {
    levelIndex,
    level,
    phase: "aiming",
    actors: createActors(level),
    bomb: null,
    shotsUsed: 0,
    aimTarget: {
      x: level.thrower.x + 130,
      y: level.thrower.y - 120,
    },
    pointerDown: false,
    explosion: null,
    message: "Knock every enemy down",
    lastTime: performance.now(),
    settleAge: 0,
  };
};

export const restartLevel = (state: TossGameState): TossGameState =>
  createStateForLevel(state.levelIndex);

export const nextLevel = (state: TossGameState): TossGameState =>
  createStateForLevel((state.levelIndex + 1) % LEVELS.length);

export const setAimTarget = (state: TossGameState, target: Vec) => {
  if (state.phase !== "aiming") {
    return;
  }

  state.aimTarget = target;
};

export const launchBomb = (state: TossGameState) => {
  if (state.phase !== "aiming" || state.shotsUsed >= state.level.bombs) {
    return;
  }

  const direction = normalize(sub(state.aimTarget, state.level.thrower));
  const pullDistance = clamp(distance(state.aimTarget, state.level.thrower), 35, WORLD.maxAimDistance);
  const power = WORLD.throwSpeed * pullDistance;
  const start = add(state.level.thrower, mul(direction, 28));

  state.bomb = {
    ...createActorBody({
      id: `bomb-${state.shotsUsed + 1}`,
      kind: "bomb",
      pos: start,
      radius: WORLD.bombRadius,
      mass: 0.9,
      restitution: 0.35,
      color: "#141817",
    }),
    vel: mul(direction, power),
    fuse: 1.7,
  };
  state.shotsUsed += 1;
  state.phase = "flying";
  state.settleAge = 0;
  state.message = "Wait for everything to fall";
};

export const updateGame = (state: TossGameState, now: number) => {
  const dt = clamp((now - state.lastTime) / 1000, 0, MAX_STEP);
  state.lastTime = now;

  if (
    state.phase === "cleared" ||
    state.phase === "completed" ||
    state.phase === "failed" ||
    state.phase === "aiming"
  ) {
    return;
  }

  if (state.bomb) {
    stepBody(state.bomb, state.level, dt);
    state.bomb.fuse -= dt;

    if (
      state.bomb.fuse <= 0 ||
      hitAnyActor(state.bomb, state.actors) ||
      state.bomb.pos.y > WORLD.height - 10
    ) {
      explodeBomb(state, state.bomb.pos);
      state.bomb = null;
      state.phase = "exploding";
    }
  }

  state.actors.forEach((actor) => {
    if (actor.alive) {
      stepBody(actor, state.level, dt);
    }
  });
  solveActorCollisions(state.actors);
  resolveFallingActors(state);

  if (state.explosion) {
    state.explosion.age += dt;

    if (state.explosion.age >= EXPLOSION_DURATION) {
      state.explosion = null;
      state.phase = "settling";
      state.settleAge = 0;
    }
  }

  if (state.phase === "settling") {
    state.settleAge += dt;
  }

  if (
    state.phase === "settling" &&
    (isSettled(state) || state.settleAge >= WORLD.maxSettleSeconds)
  ) {
    resolveTurnEnd(state);
  }
};

const createActors = (level: LevelDefinition) =>
  level.objects.map((object) =>
    createActorBody({
      id: object.id,
      kind: object.kind,
      pos: object.pos,
      radius: object.radius,
      mass: object.mass ?? (object.kind === "enemy" ? 1.15 : 0.75),
      restitution: object.kind === "enemy" ? 0.48 : 0.35,
      color: object.color,
    }),
  );

const stepBody = (body: ActorBody, level: LevelDefinition, dt: number) => {
  body.prevPos = { ...body.pos };
  body.vel.y += WORLD.gravity * dt;
  body.vel.x *= 0.998;
  body.vel.y *= 0.999;
  body.pos.x += body.vel.x * dt;
  body.pos.y += body.vel.y * dt;

  for (const platform of getLevelPlatforms(level)) {
    const collision = circleRectCollision(body.pos, body.radius, platform);

    if (!collision) {
      continue;
    }

    body.pos.x += collision.normal.x * collision.depth;
    body.pos.y += collision.normal.y * collision.depth;
    body.vel = reflect(body.vel, collision.normal, body.restitution);

    if (Math.abs(collision.normal.y) > 0.7) {
      body.vel.x *= 0.88;
    }
  }

  if (body.pos.x < body.radius) {
    body.pos.x = body.radius;
    body.vel.x = Math.abs(body.vel.x) * body.restitution;
  }

  if (body.pos.x > WORLD.width - body.radius) {
    body.pos.x = WORLD.width - body.radius;
    body.vel.x = -Math.abs(body.vel.x) * body.restitution;
  }
};

const hitAnyActor = (bomb: ActiveBomb, actors: ActorBody[]) =>
  actors.some((actor) => actor.alive && distance(actor.pos, bomb.pos) < actor.radius + bomb.radius);

const explodeBomb = (state: TossGameState, pos: Vec) => {
  const affected = state.actors.filter(
    (actor) => actor.alive && distance(actor.pos, pos) <= WORLD.blastRadius + actor.radius,
  );

  for (const actor of affected) {
    const away = normalize(sub(actor.pos, pos));
    const dist = Math.max(26, distance(actor.pos, pos));
    const force = ((WORLD.blastRadius + actor.radius - dist) / WORLD.blastRadius) * WORLD.blastPower;
    actor.vel.x += (away.x * force) / actor.mass;
    actor.vel.y += ((away.y - 0.35) * force) / actor.mass;
    actor.touchedByBlast = true;
  }

  state.explosion = {
    pos: { ...pos },
    age: 0,
    affected: affected.length,
  };
};

const solveActorCollisions = (actors: ActorBody[]) => {
  for (let i = 0; i < actors.length; i += 1) {
    for (let j = i + 1; j < actors.length; j += 1) {
      const a = actors[i];
      const b = actors[j];

      if (!a.alive || !b.alive) {
        continue;
      }

      const delta = sub(b.pos, a.pos);
      const dist = length(delta);
      const minDist = a.radius + b.radius;

      if (dist === 0 || dist >= minDist) {
        continue;
      }

      const normal = normalize(delta);
      const depth = minDist - dist;
      const totalMass = a.mass + b.mass;

      a.pos.x -= (normal.x * depth * b.mass) / totalMass;
      a.pos.y -= (normal.y * depth * b.mass) / totalMass;
      b.pos.x += (normal.x * depth * a.mass) / totalMass;
      b.pos.y += (normal.y * depth * a.mass) / totalMass;

      const relative = sub(b.vel, a.vel);
      const velocityAlongNormal = relative.x * normal.x + relative.y * normal.y;

      if (velocityAlongNormal > 0) {
        continue;
      }

      const impulse = (-(1 + 0.55) * velocityAlongNormal) / (1 / a.mass + 1 / b.mass);
      a.vel.x -= (impulse * normal.x) / a.mass;
      a.vel.y -= (impulse * normal.y) / a.mass;
      b.vel.x += (impulse * normal.x) / b.mass;
      b.vel.y += (impulse * normal.y) / b.mass;
    }
  }
};

const resolveFallingActors = (state: TossGameState) => {
  for (const actor of state.actors) {
    if (!actor.alive) {
      continue;
    }

    const fellOut =
      actor.pos.y > WORLD.height + actor.radius ||
      actor.pos.x < -actor.radius * 2 ||
      actor.pos.x > WORLD.width + actor.radius * 2;

    if (!fellOut) {
      continue;
    }

    actor.alive = false;
  }
};

const isSettled = (state: TossGameState) =>
  !state.bomb &&
  state.actors
    .filter((actor) => actor.alive)
    .every((actor) => Math.abs(actor.vel.x) + Math.abs(actor.vel.y) < WORLD.settleSpeed);

const resolveTurnEnd = (state: TossGameState) => {
  const enemiesRemaining = state.actors.some((actor) => actor.kind === "enemy" && actor.alive);

  if (!enemiesRemaining) {
    if (state.levelIndex === LEVELS.length - 1) {
      state.phase = "completed";
      state.message = "Training complete";
      return;
    }

    state.phase = "cleared";
    state.message = "All enemies down";
    return;
  }

  if (state.shotsUsed >= state.level.bombs) {
    state.phase = "failed";
    state.message = "Out of bombs";
    return;
  }

  state.phase = "aiming";
  state.message = "Knock every enemy down";
};
