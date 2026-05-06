import Phaser from "phaser";

import { PISTOL_CARD } from "../constants";
import type { VelocityVector } from "../trajectory";

const BULLET_TEXTURE_KEY = "__bullet";

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocity: VelocityVector
  ) {
    Bullet.ensureTexture(scene);
    super(scene, x, y, BULLET_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(10, 4);
    this.setTint(0xfff5cf);
    this.setRotation(velocity.angle);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setSize(10, 4);
    body.setVelocity(velocity.x, velocity.y);
  }

  public isOutOfBounds(worldWidth: number, worldHeight: number): boolean {
    return (
      this.x < 0 ||
      this.x > worldWidth ||
      this.y < 0 ||
      this.y > worldHeight
    );
  }

  public getDamage(): number {
    return PISTOL_CARD.bulletDamage;
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(BULLET_TEXTURE_KEY)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 10, 4);
    graphics.generateTexture(BULLET_TEXTURE_KEY, 10, 4);
    graphics.destroy();
  }
}
