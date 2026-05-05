import Phaser from "phaser";

import { COMMON_INFECTED_STATS } from "../constants";

const COMMON_INFECTED_TEXTURE_KEY = "__infected";

export class CommonInfected extends Phaser.Physics.Arcade.Sprite {
  public readonly healthPoints = COMMON_INFECTED_STATS.health;
  public readonly damage = COMMON_INFECTED_STATS.damage;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    CommonInfected.ensureTexture(scene);
    super(scene, x, y, COMMON_INFECTED_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(26, 40);
    this.setCollideWorldBounds(true);
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(COMMON_INFECTED_TEXTURE_KEY)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 26, 40);
    graphics.generateTexture(COMMON_INFECTED_TEXTURE_KEY, 26, 40);
    graphics.destroy();
  }
}
