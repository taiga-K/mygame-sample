import { createBombTossGame } from "@/features/bomb-toss";

const FEATURE_REQUEST_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSeg-BndBRAJY-UrAiMHpYS6gQ90xfQ7vuOhvgclJ6gbjcLmyA/viewform?usp=publish-editor";

export const createGameStage = () => {
  const shell = document.createElement("main");
  shell.className = "game-shell";

  const featureRequestLink = document.createElement("a");
  featureRequestLink.className = "game-shell__feedback-link";
  featureRequestLink.href = FEATURE_REQUEST_FORM_URL;
  featureRequestLink.target = "_blank";
  featureRequestLink.rel = "noopener noreferrer";
  featureRequestLink.textContent = "機能リクエスト";

  shell.append(createBombTossGame(), featureRequestLink);

  return shell;
};
