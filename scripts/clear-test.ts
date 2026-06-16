import { LEVELS } from "../src/entities/level";
import {
  createStateForLevel,
  launchBomb,
  setAimTarget,
  updateGame,
} from "../src/features/bomb-toss/model";
import type { TossGameState } from "../src/features/bomb-toss/model";
import type { Vec } from "../src/shared/lib/physics";

type Candidate = {
  angle: number;
  power: number;
  target: Vec;
};

type TrialResult = {
  state: TossGameState;
  candidate: Candidate;
  enemiesLeft: number;
  enemiesCleared: number;
  phase: TossGameState["phase"];
};

const candidates = (thrower: Vec): Candidate[] => {
  const result: Candidate[] = [];

  for (let angle = -68; angle <= -10; angle += 2) {
    for (const power of [92, 112, 132, 152, 160]) {
      const radians = (angle * Math.PI) / 180;
      result.push({
        angle,
        power,
        target: {
          x: thrower.x + Math.cos(radians) * power,
          y: thrower.y + Math.sin(radians) * power,
        },
      });
    }
  }

  return result;
};

const cloneState = (state: TossGameState): TossGameState => structuredClone(state);

const enemiesLeft = (state: TossGameState) =>
  state.actors.filter((actor) => actor.kind === "enemy" && actor.alive).length;

const runShot = (state: TossGameState, candidate: Candidate): TrialResult => {
  const before = enemiesLeft(state);
  const trial = cloneState(state);
  setAimTarget(trial, candidate.target);
  launchBomb(trial);

  let now = trial.lastTime;

  for (let frame = 0; frame < 720; frame += 1) {
    now += 1000 / 60;
    updateGame(trial, now);

    if (trial.phase === "aiming" || trial.phase === "cleared" || trial.phase === "failed") {
      break;
    }
  }

  const after = enemiesLeft(trial);

  return {
    state: trial,
    candidate,
    enemiesLeft: after,
    enemiesCleared: before - after,
    phase: trial.phase,
  };
};

const rankTrial = (trial: TrialResult) => {
  if (trial.phase === "cleared") {
    return 1_000_000 - trial.state.shotsUsed * 10;
  }

  if (trial.phase === "failed") {
    return -1_000_000 + trial.enemiesCleared * 10_000;
  }

  return trial.enemiesCleared * 100_000 - trial.enemiesLeft * 1000;
};

const findBestShot = (state: TossGameState): TrialResult => {
  const options = candidates(state.level.thrower).map((candidate) => runShot(state, candidate));

  return options.reduce((best, current) => (rankTrial(current) > rankTrial(best) ? current : best));
};

const testLevel = (levelIndex: number) => {
  let state = createStateForLevel(levelIndex);
  state.lastTime = 0;
  const shots: Candidate[] = [];

  while (
    state.phase !== "cleared" &&
    state.phase !== "completed" &&
    state.phase !== "failed" &&
    shots.length < state.level.bombs
  ) {
    const best = findBestShot(state);
    shots.push(best.candidate);
    state = best.state;
  }

  return {
    id: LEVELS[levelIndex].id,
    name: LEVELS[levelIndex].name,
    phase: state.phase,
    shots,
    enemiesLeft: enemiesLeft(state),
  };
};

const results = LEVELS.map((_, index) => testLevel(index));
const failed = results.filter((result) => result.phase !== "cleared" && result.phase !== "completed");

for (const result of results) {
  const shotText = result.shots
    .map((shot) => `${shot.angle}deg/${Math.round(shot.power)}`)
    .join(", ");
  console.log(
    `L${result.id} ${result.phase.toUpperCase()} shots=${result.shots.length} enemiesLeft=${result.enemiesLeft} path=[${shotText}]`,
  );
}

if (failed.length > 0) {
  console.error(`Clear test failed: ${failed.map((level) => `L${level.id}`).join(", ")}`);
  process.exitCode = 1;
}
