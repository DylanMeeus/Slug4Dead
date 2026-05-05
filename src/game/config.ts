import Phaser from "phaser";

import { LEVEL_HEIGHT, LEVEL_WIDTH } from "./constants";
import { AlphaLevelScene } from "./scenes/AlphaLevelScene";
import { MenuScene } from "./scenes/MenuScene";

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "game",
  width: LEVEL_WIDTH > 960 ? 960 : LEVEL_WIDTH,
  height: LEVEL_HEIGHT,
  backgroundColor: "#1a1f2b",
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 900, x: 0 },
      debug: false
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: [MenuScene, AlphaLevelScene]
};
