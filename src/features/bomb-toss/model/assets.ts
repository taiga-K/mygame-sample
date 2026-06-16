import type { SpriteAssets } from "./types";

const ASSET_URLS = {
  enemy: "./assets/enemy.png",
  bomb: "./assets/bomb.png",
  crate: "./assets/crate.png",
  launcherBase: "./assets/launcher-base.png",
  launcherBarrel: "./assets/launcher-barrel.png",
  platformFloor: "./assets/platform-floor.png",
  platformWallRight: "./assets/platform-wall-right.png",
  platformWallLeft: "./assets/platform-wall-left.png",
  platformWallFloating: "./assets/platform-wall-floating.png",
  explosion: "./assets/explosion.png",
} as const;

const BACKGROUND_URLS = [
  "./assets/stage-bg-1.png",
  "./assets/stage-bg-2.png",
  "./assets/stage-bg-3.png",
  "./assets/stage-bg-4.png",
  "./assets/stage-bg-5.png",
] as const;

const loadImage = (src: string) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.decoding = "async";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    image.src = src;
  });

export const loadSpriteAssets = async (): Promise<SpriteAssets> => ({
  enemy: await loadImage(ASSET_URLS.enemy),
  bomb: await loadImage(ASSET_URLS.bomb),
  crate: await loadImage(ASSET_URLS.crate),
  launcherBase: await loadImage(ASSET_URLS.launcherBase),
  launcherBarrel: await loadImage(ASSET_URLS.launcherBarrel),
  platformFloor: await loadImage(ASSET_URLS.platformFloor),
  platformWallRight: await loadImage(ASSET_URLS.platformWallRight),
  platformWallLeft: await loadImage(ASSET_URLS.platformWallLeft),
  platformWallFloating: await loadImage(ASSET_URLS.platformWallFloating),
  stageBackgrounds: await Promise.all(BACKGROUND_URLS.map((url) => loadImage(url))),
  explosion: await loadImage(ASSET_URLS.explosion),
});
