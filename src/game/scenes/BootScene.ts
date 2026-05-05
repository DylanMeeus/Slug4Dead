import Phaser from "phaser";

import { GAME_TITLE, HELLO_WORLD_LABEL } from "../constants";

export class BootScene extends Phaser.Scene {
  public static readonly key = "boot";

  public constructor() {
    super(BootScene.key);
  }

  public create(): void {
    const { width, height } = this.scale;

    this.cameras.main.setBackgroundColor("#1a1f2b");

    this.add
      .text(width / 2, height / 2 - 28, GAME_TITLE, {
        fontFamily: "monospace",
        fontSize: "40px",
        color: "#f6f1d1"
      })
      .setOrigin(0.5);

    this.add
      .text(width / 2, height / 2 + 24, HELLO_WORLD_LABEL, {
        fontFamily: "monospace",
        fontSize: "20px",
        color: "#9fe870"
      })
      .setOrigin(0.5);
  }
}
