import Phaser from "phaser";

import spitterSpritesheetUrl from "../../../docs/art/enemies/spitter/spitter-spritesheet.png";
import {
  SPITTER_DISPLAY_SIZE,
  SPITTER_INFECTED_PROJECTILE,
  SPITTER_INFECTED_STATS,
  SPITTER_SPRITESHEET
} from "../constants";
import { resolveVelocityVector, type VelocityVector } from "../trajectory";

const SPITTER_TEXTURE_KEY = "spitter-spritesheet";
const SPITTER_IDLE_ANIMATION_KEY = "spitter-idle";
const SPITTER_SPITTING_ANIMATION_KEY = "spitter-spitting";

export class SpitterInfected extends Phaser.Physics.Arcade.Sprite {
  private healthPoints: number = SPITTER_INFECTED_STATS.health;
  private nextProjectileTimeMs = 0;
  public readonly damage = SPITTER_INFECTED_STATS.damage;

  public static preloadAssets(scene: Phaser.Scene): void {
    if (scene.textures.exists(SPITTER_TEXTURE_KEY)) {
      return;
    }

    scene.load.spritesheet(SPITTER_TEXTURE_KEY, spitterSpritesheetUrl, {
      frameWidth: SPITTER_SPRITESHEET.frameWidth,
      frameHeight: SPITTER_SPRITESHEET.frameHeight
    });
  }

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    SpitterInfected.ensureAnimations(scene);
    super(scene, x, y, SPITTER_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(SPITTER_DISPLAY_SIZE.width, SPITTER_DISPLAY_SIZE.height);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(
      SPITTER_SPRITESHEET.frameWidth,
      SPITTER_SPRITESHEET.frameHeight,
      true
    );

    this.setCollideWorldBounds(true);
    this.play(SPITTER_IDLE_ANIMATION_KEY);
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
    this.playSpittingAnimation();
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

  private playSpittingAnimation(): void {
    this.play(SPITTER_SPITTING_ANIMATION_KEY, true);
    this.once(Phaser.Animations.Events.ANIMATION_COMPLETE, () => {
      if (this.active) {
        this.play(SPITTER_IDLE_ANIMATION_KEY, true);
      }
    });
  }

  private static ensureAnimations(scene: Phaser.Scene): void {
    if (!scene.anims.exists(SPITTER_IDLE_ANIMATION_KEY)) {
      const idle = SPITTER_SPRITESHEET.animations.idle;
      scene.anims.create({
        key: SPITTER_IDLE_ANIMATION_KEY,
        frames: scene.anims.generateFrameNumbers(SPITTER_TEXTURE_KEY, {
          start: idle.startFrame,
          end: idle.endFrame
        }),
        frameRate: idle.frameRate,
        repeat: idle.repeat
      });
    }

    if (!scene.anims.exists(SPITTER_SPITTING_ANIMATION_KEY)) {
      const spitting = SPITTER_SPRITESHEET.animations.spitting;
      scene.anims.create({
        key: SPITTER_SPITTING_ANIMATION_KEY,
        frames: scene.anims.generateFrameNumbers(SPITTER_TEXTURE_KEY, {
          start: spitting.startFrame,
          end: spitting.endFrame
        }),
        frameRate: spitting.frameRate,
        repeat: spitting.repeat
      });
    }
  }
}
