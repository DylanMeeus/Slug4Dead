import Phaser from "phaser";

import {
  SPITTER_INFECTED_PROJECTILE,
  SPITTER_INFECTED_STATS
} from "../constants";
import { resolveVelocityVector, type VelocityVector } from "../trajectory";

const SPITTER_TEXTURE_KEY = "__spitter";

export class SpitterInfected extends Phaser.Physics.Arcade.Sprite {
  private healthPoints: number = SPITTER_INFECTED_STATS.health;
  private nextProjectileTimeMs = 0;
  public readonly damage = SPITTER_INFECTED_STATS.damage;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    SpitterInfected.ensureTexture(scene);
    super(scene, x, y, SPITTER_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(30, 46);
    this.setTint(0x67d6cc);
    this.setCollideWorldBounds(true);
    this.scheduleNextProjectile(scene.time.now);
  }

  public update(): void {
    this.setVelocityX(0);
  }

  public tryFireAt(
    nowMs: number,
    targetX: number,
    targetY: number
  ): VelocityVector | undefined {
    if (nowMs < this.nextProjectileTimeMs) {
      return undefined;
    }

    this.scheduleNextProjectile(nowMs);
    return resolveVelocityVector(
      this.x,
      this.y,
      targetX,
      targetY,
      SPITTER_INFECTED_PROJECTILE.velocity
    );
  }

  public applyDamage(damage: number): number {
    this.healthPoints = Math.max(0, this.healthPoints - damage);
    return this.healthPoints;
  }

  public getHealth(): number {
    return this.healthPoints;
  }

  private scheduleNextProjectile(nowMs: number): void {
    this.nextProjectileTimeMs =
      nowMs +
      Phaser.Math.Between(
        SPITTER_INFECTED_PROJECTILE.minFireDelayMs,
        SPITTER_INFECTED_PROJECTILE.maxFireDelayMs
      );
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(SPITTER_TEXTURE_KEY)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, 30, 46);
    graphics.generateTexture(SPITTER_TEXTURE_KEY, 30, 46);
    graphics.destroy();
  }
}
