import Phaser from "phaser";

import { ALPHA_LEVEL, GAMEPLAY_STATES, GAME_TITLE, SCENE_KEYS } from "../constants";

export class MenuScene extends Phaser.Scene {
  public static readonly key = SCENE_KEYS.menu;

  public constructor() {
    super(MenuScene.key);
  }

  public create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#121722");

    this.add
      .text(width / 2, height / 2 - 90, GAME_TITLE, {
        fontFamily: "monospace",
        fontSize: "44px",
        color: "#f6f1d1"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 - 28, "Pre-Level", {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#9fe870"
      })
      .setOrigin(0.5);

    const alphaLevelText = this.add
      .text(width / 2, height / 2 + 40, `Play ${ALPHA_LEVEL.label}`, {
        fontFamily: "monospace",
        fontSize: "28px",
        color: "#ffffff",
        backgroundColor: "#253047",
        padding: { x: 14, y: 10 }
      })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    this.add
      .text(width / 2, height / 2 + 104, `State: ${GAMEPLAY_STATES.preLevel}`, {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#9ba8c7"
      })
      .setOrigin(0.5);

    alphaLevelText.on("pointerdown", () => {
      this.scene.start(SCENE_KEYS.alphaLevel);
    });
  }
}
