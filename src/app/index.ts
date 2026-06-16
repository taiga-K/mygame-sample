import { mountGamePage } from "@/pages/game";

import "./styles/global.css";

export const bootApp = () => {
  const root = document.querySelector<HTMLDivElement>("#app");

  if (!root) {
    throw new Error("App root was not found");
  }

  mountGamePage(root);
};
