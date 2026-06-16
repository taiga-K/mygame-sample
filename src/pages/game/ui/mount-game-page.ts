import { createGameStage } from "@/widgets/game-stage";

export const mountGamePage = (root: HTMLElement) => {
  root.replaceChildren(createGameStage());
};
