import Phaser from "phaser";

import { SPITTER_INFECTED_STATS } from "../constants";
import type { VelocityVector } from "../trajectory";

const ENEMY_PROJECTILE_TEXTURE_KEY = "__enemy_projectile";

export class EnemyProjectile extends Phaser.Physics.Arcade.Sprite {
  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    velocity: VelocityVector
  ) {
    EnemyProjectile.ensureTexture(scene);
    super(scene, x, y, ENEMY_PROJECTILE_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(14, 14);
    this.setTint(0x7ad66d);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setCircle(7);
    body.setVelocity(velocity.x, velocity.y);
  }

  public getDamage(): number {
    return SPITTER_INFECTED_STATS.damage;
  }

  public isOutOfBounds(worldWidth: number, worldHeight: number): boolean {
    return (
      this.x < 0 ||
      this.x > worldWidth ||
      this.y < 0 ||
      this.y > worldHeight
    );
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(ENEMY_PROJECTILE_TEXTURE_KEY)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff);
    graphics.fillCircle(7, 7, 7);
    graphics.generateTexture(ENEMY_PROJECTILE_TEXTURE_KEY, 14, 14);
    graphics.destroy();
  }
}
