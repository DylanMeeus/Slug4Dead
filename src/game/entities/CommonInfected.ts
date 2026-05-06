import Phaser from "phaser";

import {
  COMMON_INFECTED_MOVEMENT,
  COMMON_INFECTED_STATS
} from "../constants";

const COMMON_INFECTED_TEXTURE_KEY = "__infected";

export class CommonInfected extends Phaser.Physics.Arcade.Sprite {
  private healthPoints: number = COMMON_INFECTED_STATS.health;
  private readonly patrolOriginX: number;
  private readonly patrolDistance: number;
  private patrolDirection: 1 | -1;
  public readonly damage = COMMON_INFECTED_STATS.damage;

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    CommonInfected.ensureTexture(scene);
    super(scene, x, y, COMMON_INFECTED_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(26, 40);
    this.setCollideWorldBounds(true);

    this.patrolOriginX = x;
    this.patrolDistance = Phaser.Math.Between(
      COMMON_INFECTED_MOVEMENT.minPatrolDistance,
      COMMON_INFECTED_MOVEMENT.maxPatrolDistance
    );
    this.patrolDirection = Math.random() > 0.5 ? 1 : -1;
    this.setVelocityX(
      this.patrolDirection * COMMON_INFECTED_MOVEMENT.speedPixelsPerSecond
    );
  }

  public update(): void {
    const leftLimit = this.patrolOriginX - this.patrolDistance;
    const rightLimit = this.patrolOriginX + this.patrolDistance;

    if (this.x <= leftLimit) {
      this.patrolDirection = 1;
    } else if (this.x >= rightLimit) {
      this.patrolDirection = -1;
    }

    this.setFlipX(this.patrolDirection < 0);
    this.setVelocityX(
      this.patrolDirection * COMMON_INFECTED_MOVEMENT.speedPixelsPerSecond
    );
  }

  public applyDamage(damage: number): number {
    this.healthPoints = Math.max(0, this.healthPoints - damage);
    return this.healthPoints;
  }

  public getHealth(): number {
    return this.healthPoints;
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
