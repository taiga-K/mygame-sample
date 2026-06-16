import { getLevelPlatforms, LEVELS } from "@/entities/level";
import type { Platform, PlatformComponent, PlatformSkin } from "@/entities/level";
import { WORLD } from "@/shared/config";
import { roundedRectPath, setupHiDpiCanvas } from "@/shared/lib/canvas";
import { clamp, distance, normalize, sub } from "@/shared/lib/physics";
import type { Vec } from "@/shared/lib/physics";

import { loadSpriteAssets } from "../model";
import {
  createInitialState,
  launchBomb,
  nextLevel,
  restartLevel,
  setAimTarget,
  updateGame,
} from "../model";
import type { ActiveBomb, GamePhase, SpriteAssets, TossGameState } from "../model";

import {
  createCelebrationSession,
  drawClearCelebration,
  isCelebrationPhase,
  updateCelebrationSession,
} from "./clear-celebration";
import type { CelebrationSession } from "./clear-celebration";
import "./game-stage.css";

const VIEW_WIDTH = WORLD.width;
const VIEW_HEIGHT = WORLD.height;

export const createBombTossGame = () => {
  const container = document.createElement("section");
  container.className = "boom-game";

  const canvas = document.createElement("canvas");
  canvas.className = "boom-game__canvas";
  canvas.width = VIEW_WIDTH;
  canvas.height = VIEW_HEIGHT;
  canvas.setAttribute("aria-label", "ブームアーク ゲームキャンバス");

  const loading = document.createElement("div");
  loading.className = "boom-game__loading";
  loading.textContent = "素材を読み込んでいます...";

  container.append(canvas, loading);

  const context = setupHiDpiCanvas(canvas, VIEW_WIDTH, VIEW_HEIGHT);
  let state = createInitialState();
  let assets: SpriteAssets | null = null;
  let animationId = 0;
  let celebration: CelebrationSession | null = null;
  let previousPhase: GamePhase = state.phase;

  const toWorldPoint = (event: PointerEvent): Vec => {
    const rect = canvas.getBoundingClientRect();

    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * VIEW_HEIGHT,
    };
  };

  const resetToLevel = () => {
    state = restartLevel(state);
  };

  canvas.addEventListener("pointerdown", (event) => {
    canvas.setPointerCapture(event.pointerId);
    const point = toWorldPoint(event);

    if (state.phase === "completed") {
      state = createInitialState();
      return;
    }

    if (isInsideRetry(point)) {
      resetToLevel();
      return;
    }

    if (state.phase === "cleared") {
      state = nextLevel(state);
      return;
    }

    if (state.phase === "failed") {
      resetToLevel();
      return;
    }

    state.pointerDown = true;
    setAimTarget(state, point);
  });

  canvas.addEventListener("pointermove", (event) => {
    if (!state.pointerDown) {
      return;
    }

    setAimTarget(state, toWorldPoint(event));
  });

  canvas.addEventListener("pointerup", (event) => {
    if (!state.pointerDown) {
      return;
    }

    state.pointerDown = false;
    setAimTarget(state, toWorldPoint(event));
    launchBomb(state);
  });

  window.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") {
      resetToLevel();
    }

    if (event.key === "Enter" && state.phase === "cleared") {
      state = nextLevel(state);
    }

    if (event.key === "Enter" && state.phase === "completed") {
      state = createInitialState();
    }
  });

  loadSpriteAssets()
    .then((loadedAssets) => {
      assets = loadedAssets;
      loading.remove();
    })
    .catch(() => {
      loading.textContent = "素材の読み込みに失敗しました。再読み込みしてください。";
    });

  const tick = (now: number) => {
    if (assets) {
      updateGame(state, now);

      if (isCelebrationPhase(state.phase) && !isCelebrationPhase(previousPhase)) {
        celebration = createCelebrationSession(now);
      } else if (!isCelebrationPhase(state.phase)) {
        celebration = null;
      } else if (celebration) {
        updateCelebrationSession(celebration, now);
      }

      previousPhase = state.phase;
      render(context, state, assets, now, celebration);
    }

    animationId = requestAnimationFrame(tick);
  };

  animationId = requestAnimationFrame(tick);

  container.addEventListener("DOMNodeRemovedFromDocument", () => {
    cancelAnimationFrame(animationId);
  });

  return container;
};

const render = (
  context: CanvasRenderingContext2D,
  state: TossGameState,
  assets: SpriteAssets,
  now: number,
  celebration: CelebrationSession | null,
) => {
  context.clearRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
  drawBackground(context, state, assets);
  drawHud(context, state);
  drawPlatforms(context, state, assets);
  drawThrower(context, state, assets);
  drawAim(context, state);
  drawActors(context, state, assets);
  drawBomb(context, state.bomb, assets);
  drawExplosion(context, state, assets);
  drawMessage(context, state, now, celebration);
};

const drawBackground = (
  context: CanvasRenderingContext2D,
  state: TossGameState,
  assets: SpriteAssets,
) => {
  const background = assets.stageBackgrounds[state.levelIndex] ?? assets.stageBackgrounds[0];

  context.drawImage(background, 0, 0, VIEW_WIDTH, VIEW_HEIGHT);

  const readabilityWash = context.createLinearGradient(0, 0, 0, VIEW_HEIGHT);
  readabilityWash.addColorStop(0, "rgba(245, 250, 247, 0.18)");
  readabilityWash.addColorStop(0.45, "rgba(245, 250, 247, 0.08)");
  readabilityWash.addColorStop(1, "rgba(235, 249, 242, 0.2)");
  context.fillStyle = readabilityWash;
  context.fillRect(0, 0, VIEW_WIDTH, VIEW_HEIGHT);
};

const drawHud = (context: CanvasRenderingContext2D, state: TossGameState) => {
  context.save();
  context.shadowColor = "rgba(245, 250, 247, 0.92)";
  context.shadowBlur = 8;
  context.fillStyle = "#16201d";
  context.font = "700 28px Inter, system-ui, sans-serif";
  context.fillText("ブームアーク", 34, 45);

  context.font = "700 18px Inter, system-ui, sans-serif";
  context.fillText(`ステージ ${state.level.id}/${LEVELS.length}`, 36, 76);
  context.fillText(`爆弾 ${Math.max(0, state.level.bombs - state.shotsUsed)}`, 250, 76);
  context.restore();

  drawRetryButton(context);
};

const drawRetryButton = (context: CanvasRenderingContext2D) => {
  context.save();
  context.translate(936, 48);
  context.strokeStyle = "#17201f";
  context.lineWidth = 3;
  context.beginPath();
  context.arc(0, 0, 18, 0.2 * Math.PI, 1.75 * Math.PI);
  context.stroke();
  context.beginPath();
  context.moveTo(15, -16);
  context.lineTo(24, -16);
  context.lineTo(20, -7);
  context.closePath();
  context.fillStyle = "#17201f";
  context.fill();
  context.restore();
};

const isInsideRetry = (point: Vec) => distance(point, { x: 936, y: 48 }) <= 34;

const drawPlatforms = (
  context: CanvasRenderingContext2D,
  state: TossGameState,
  assets: SpriteAssets,
) => {
  for (const platform of state.level.terrain) {
    drawPlatformArt(context, platform, getPlatformArtImage(assets, platform.skin));
  }

  for (const platform of getLevelPlatforms(state.level)) {
    drawCollisionSurface(context, platform);
  }
};

const getPlatformArtImage = (assets: SpriteAssets, skin: PlatformSkin) => {
  switch (skin) {
    case "floor-wall-right":
      return assets.platformWallRight;
    case "floor-wall-left":
      return assets.platformWallLeft;
    case "floating-wall":
      return assets.platformWallFloating;
    case "floor":
      return assets.platformFloor;
    default: {
      const exhaustive: never = skin;
      return exhaustive;
    }
  }
};

const drawPlatformArt = (
  context: CanvasRenderingContext2D,
  platform: PlatformComponent,
  image: HTMLImageElement,
) => {
  context.save();
  context.imageSmoothingQuality = "high";
  context.shadowColor = "rgba(8, 14, 13, 0.34)";
  context.shadowBlur = platform.skin === "floor" ? 8 : 12;
  context.shadowOffsetY = 4;
  context.drawImage(image, platform.x, platform.y, platform.width, platform.height);
  context.restore();
};

const drawCollisionSurface = (context: CanvasRenderingContext2D, platform: Platform) => {
  context.save();
  context.fillStyle = "rgba(9, 16, 15, 0.22)";
  roundedRectPath(context, platform.x, platform.y, platform.width, platform.height, 4);
  context.fill();

  context.strokeStyle = "rgba(246, 230, 160, 0.94)";
  context.lineWidth = 3;
  context.beginPath();
  context.moveTo(platform.x + 4, platform.y + 1.5);
  context.lineTo(platform.x + platform.width - 4, platform.y + 1.5);
  context.stroke();

  context.strokeStyle = "rgba(8, 13, 12, 0.72)";
  context.lineWidth = 2;
  roundedRectPath(context, platform.x, platform.y, platform.width, platform.height, 4);
  context.stroke();
  context.restore();
};

const drawThrower = (
  context: CanvasRenderingContext2D,
  state: TossGameState,
  assets: SpriteAssets,
) => {
  const { thrower } = state.level;
  const angle = Math.atan2(state.aimTarget.y - thrower.y, state.aimTarget.x - thrower.x);

  drawImageCentered(context, assets.launcherBase, thrower.x, thrower.y, 82, 82);

  context.save();
  context.translate(thrower.x, thrower.y);
  context.rotate(clamp(angle, -1.25, 0.22));
  drawImageWithPivot(context, assets.launcherBarrel, -27, -56, 104, 104);
  context.restore();
};

const drawAim = (context: CanvasRenderingContext2D, state: TossGameState) => {
  if (state.phase !== "aiming") {
    return;
  }

  const start = state.level.thrower;
  const direction = normalize(sub(state.aimTarget, start));
  const pullDistance = clamp(distance(state.aimTarget, start), 35, WORLD.maxAimDistance);
  const velocity = {
    x: direction.x * pullDistance * WORLD.throwSpeed,
    y: direction.y * pullDistance * WORLD.throwSpeed,
  };
  const points = predictTrajectory(start, velocity, state);

  context.strokeStyle = "#17201f";
  context.lineWidth = 3;
  context.setLineDash([8, 10]);
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) {
      context.moveTo(point.x, point.y);
    } else {
      context.lineTo(point.x, point.y);
    }
  });
  context.stroke();
  context.setLineDash([]);

};

const predictTrajectory = (start: Vec, velocity: Vec, state: TossGameState) => {
  const pos = { ...start };
  const vel = { ...velocity };
  const points: Vec[] = [];

  for (let step = 0; step < 52; step += 1) {
    vel.y += WORLD.gravity * 0.032;
    pos.x += vel.x * 0.032;
    pos.y += vel.y * 0.032;
    points.push({ ...pos });

    const hitPlatform = getLevelPlatforms(state.level).some(
      (platform) =>
        pos.x >= platform.x &&
        pos.x <= platform.x + platform.width &&
        pos.y >= platform.y &&
        pos.y <= platform.y + platform.height,
    );

    if (hitPlatform || pos.y > WORLD.height - 16 || pos.x < 0 || pos.x > WORLD.width) {
      break;
    }
  }

  return points;
};

const drawActors = (
  context: CanvasRenderingContext2D,
  state: TossGameState,
  assets: SpriteAssets,
) => {
  for (const actor of state.actors) {
    if (!actor.alive) {
      continue;
    }

    const image = actor.kind === "enemy" ? assets.enemy : assets.crate;
    const size = actor.radius * (actor.kind === "enemy" ? 2.7 : 2.45);
    drawImageCentered(context, image, actor.pos.x, actor.pos.y, size, size);
  }
};

const drawBomb = (
  context: CanvasRenderingContext2D,
  bomb: ActiveBomb | null,
  assets: SpriteAssets,
) => {
  if (!bomb) {
    return;
  }

  drawImageCentered(context, assets.bomb, bomb.pos.x, bomb.pos.y, 52, 52);
};

const drawExplosion = (
  context: CanvasRenderingContext2D,
  state: TossGameState,
  assets: SpriteAssets,
) => {
  if (!state.explosion) {
    return;
  }

  const progress = clamp(state.explosion.age / 0.55, 0, 1);
  const size = 80 + progress * WORLD.blastRadius * 2.1;

  context.save();
  context.globalAlpha = 1 - progress * 0.72;
  drawImageCentered(context, assets.explosion, state.explosion.pos.x, state.explosion.pos.y, size, size);
  context.restore();
};

const drawMessage = (
  context: CanvasRenderingContext2D,
  state: TossGameState,
  now: number,
  celebration: CelebrationSession | null,
) => {
  if (isCelebrationPhase(state.phase) && celebration) {
    drawClearCelebration(
      context,
      state.phase,
      celebration,
      now,
      getMessageTitle(state),
      getMessageSubtitle(state),
    );
    return;
  }

  if (state.phase !== "failed") {
    return;
  }

  context.save();
  context.fillStyle = "rgba(255, 90, 95, 0.92)";
  roundedRectPath(context, 305, 176, 390, 178, 8);
  context.fill();
  context.fillStyle = "#ffffff";
  context.font = "900 36px Inter, system-ui, sans-serif";
  context.textAlign = "center";
  context.fillText(getMessageTitle(state), 500, 242);
  context.font = "700 18px Inter, system-ui, sans-serif";
  context.fillText(getMessageSubtitle(state), 500, 286);
  context.restore();
  context.textAlign = "left";
};

const getMessageTitle = (state: TossGameState) => {
  switch (state.phase) {
    case "cleared":
      return "ステージクリア！";
    case "completed":
      return "おめでとう！";
    case "failed":
      return "リトライ";
    case "aiming":
    case "flying":
    case "exploding":
    case "settling":
      return "";
    default: {
      const exhaustive: never = state.phase;
      return exhaustive;
    }
  }
};

const getMessageSubtitle = (state: TossGameState) => {
  switch (state.phase) {
    case "cleared":
      return "全員撃破しました";
    case "completed":
      return "全ステージクリア";
    case "failed":
      return "クリックでやり直す";
    case "aiming":
    case "flying":
    case "exploding":
    case "settling":
      return "";
    default: {
      const exhaustive: never = state.phase;
      return exhaustive;
    }
  }
};

const drawImageCentered = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  context.drawImage(image, x - width / 2, y - height / 2, width, height);
};

const drawImageWithPivot = (
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) => {
  context.drawImage(image, x, y, width, height);
};
