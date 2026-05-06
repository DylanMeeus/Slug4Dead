import Phaser from "phaser";

import { Bullet } from "../entities/Bullet";
import { CommonInfected } from "../entities/CommonInfected";
import type { DamageableEnemy } from "../entities/Enemy";
import { EnemyProjectile } from "../entities/EnemyProjectile";
import { Pistol } from "../entities/Pistol";
import { Player } from "../entities/Player";
import { SpitterInfected } from "../entities/SpitterInfected";
import { resolveVelocityVector } from "../trajectory";
import {
  ALPHA_LEVEL,
  CROSSHAIR,
  COMMON_INFECTED_MOVEMENT,
  COMMON_INFECTED_STATS,
  FLOOR_HEIGHT,
  type GameplayState,
  GAMEPLAY_STATES,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  PISTOL_CARD,
  PLAYER_CARD,
  PLAYER_MOVEMENT,
  PLAYER_SIZE,
  SAFE_ZONE_WIDTH,
  SCENE_KEYS,
  SPITTER_INFECTED_PROJECTILE,
  SPITTER_INFECTED_STATS
} from "../constants";

export class AlphaLevelScene extends Phaser.Scene {
  public static readonly key = SCENE_KEYS.alphaLevel;

  private gameplayState: GameplayState = GAMEPLAY_STATES.alive;
  private player?: Player;
  private stateText?: Phaser.GameObjects.Text;
  private floor?: Phaser.GameObjects.Rectangle;
  private safeZone?: Phaser.GameObjects.Rectangle;
  private crosshair?: Phaser.GameObjects.Graphics;
  private readonly enemies: DamageableEnemy[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly enemyProjectiles: EnemyProjectile[] = [];
  private pistol = new Pistol();
  private lastDamageTimeMs = -PLAYER_MOVEMENT.damageCooldownMs;
  private levelComplete = false;

  public constructor() {
    super(AlphaLevelScene.key);
  }

  public create(): void {
    this.gameplayState = GAMEPLAY_STATES.alive;
    this.pistol = new Pistol();
    this.enemies.length = 0;
    this.bullets.length = 0;
    this.enemyProjectiles.length = 0;
    this.lastDamageTimeMs = -PLAYER_MOVEMENT.damageCooldownMs;
    this.levelComplete = false;

    this.cameras.main.setBackgroundColor("#6c8fb0");
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    this.input.setDefaultCursor("none");

    this.add.rectangle(
      LEVEL_WIDTH / 2,
      LEVEL_HEIGHT / 2,
      LEVEL_WIDTH,
      LEVEL_HEIGHT,
      0x6c8fb0
    );

    this.floor = this.add.rectangle(
      LEVEL_WIDTH / 2,
      LEVEL_HEIGHT - FLOOR_HEIGHT / 2,
      LEVEL_WIDTH,
      FLOOR_HEIGHT,
      0x4b3f2f
    );
    this.physics.add.existing(this.floor, true);

    this.safeZone = this.add.rectangle(
      LEVEL_WIDTH - SAFE_ZONE_WIDTH / 2,
      LEVEL_HEIGHT - FLOOR_HEIGHT - 48,
      SAFE_ZONE_WIDTH,
      96,
      0xb8d88a,
      0.5
    );
    this.physics.add.existing(this.safeZone, true);

    const playerStartY = LEVEL_HEIGHT - FLOOR_HEIGHT - PLAYER_SIZE.height / 2;
    this.player = new Player(this, ALPHA_LEVEL.playerSpawnLocation, playerStartY);
    this.player.setTint(0xf6f1d1);

    this.physics.add.collider(this.player, this.floor);
    this.physics.add.overlap(this.player, this.safeZone, () => {
      this.handleSafeZoneReached();
    });

    for (const enemyDefinition of ALPHA_LEVEL.enemies) {
      const enemy = this.createEnemy(
        enemyDefinition.type,
        enemyDefinition.spawnLocation
      );

      this.enemies.push(enemy);
      this.physics.add.collider(enemy, this.floor);
      this.physics.add.overlap(this.player, enemy, () => {
        this.handlePlayerContact(enemy);
      });
    }

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.crosshair = this.add.graphics().setScrollFactor(0);

    this.stateText = this.add
      .text(16, 16, this.getHudText(), {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#10131a",
        backgroundColor: "#f6f1d1",
        padding: { x: 8, y: 6 }
      })
      .setScrollFactor(0);

    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.gameplayState !== GAMEPLAY_STATES.alive || !this.player) {
        return;
      }

      const nowMs = this.time.now;
      if (!this.pistol.tryFire(nowMs)) {
        return;
      }

      this.fireBullet(pointer.worldX, pointer.worldY);
      this.stateText?.setText(this.getHudText());
    });

    this.input.keyboard!.on("keydown-ESC", () => {
      if (this.gameplayState === GAMEPLAY_STATES.dead) {
        this.input.setDefaultCursor("default");
        this.scene.start(SCENE_KEYS.menu);
        return;
      }

      if (this.levelComplete) {
        this.input.setDefaultCursor("default");
        this.scene.start(SCENE_KEYS.menu);
        return;
      }

      if (this.gameplayState === GAMEPLAY_STATES.paused) {
        this.physics.resume();
        this.setGameplayState(GAMEPLAY_STATES.alive);
        return;
      }

      this.physics.pause();
      this.setGameplayState(GAMEPLAY_STATES.paused);
    });
  }

  public update(): void {
    this.pistol.update(this.time.now);
    this.stateText?.setText(this.getHudText());
    this.renderCrosshair();

    if (this.gameplayState !== GAMEPLAY_STATES.alive || !this.player) {
      return;
    }

    this.player.update();
    for (const enemy of this.enemies) {
      enemy.update();

      if (enemy instanceof SpitterInfected) {
        this.tryFireSpitterProjectile(enemy);
      }
    }
    this.cullBullets();
    this.cullEnemyProjectiles();
  }

  private setGameplayState(nextState: GameplayState): void {
    this.gameplayState = nextState;

    if (nextState === GAMEPLAY_STATES.dead && this.player) {
      this.player.setTint(0xc94f4f);
      this.player.setVelocity(0, 0);
      this.physics.pause();
    }

    if (nextState === GAMEPLAY_STATES.paused) {
      this.input.setDefaultCursor("default");
    } else if (nextState === GAMEPLAY_STATES.alive) {
      this.input.setDefaultCursor("none");
    }

    this.stateText?.setText(this.getHudText());
  }

  private getHudText(): string {
    const reloadMs = this.pistol.getReloadTimeRemainingMs(this.time.now);
    const reloadLabel =
      reloadMs > 0 ? `Reloading: ${reloadMs}ms` : "Reloading: ready";

    return [
      `State: ${this.gameplayState}`,
      `Player: ${this.player?.getHealth() ?? PLAYER_CARD.health}hp / velocity ${PLAYER_CARD.velocity}`,
      `Pistol: ${this.pistol.getAmmo()}/${PISTOL_CARD.magSize} / fire rate ${PISTOL_CARD.fireRatePerSecond}/s`,
      reloadLabel,
      `Common infected: ${COMMON_INFECTED_STATS.health}hp / ${COMMON_INFECTED_STATS.damage} damage / velocity ${COMMON_INFECTED_MOVEMENT.speedPixelsPerSecond}px/s`,
      `Spitter: ${SPITTER_INFECTED_STATS.health}hp / ${SPITTER_INFECTED_STATS.damage} damage / projectile ${SPITTER_INFECTED_PROJECTILE.velocity}px/s`,
      `Alpha enemies: ${this.enemies.length}`,
      "Controls: A / D / Space / Mouse 1 / Esc",
      "Esc: pause, resume, or return to menu when dead"
    ].join("\n");
  }

  private handlePlayerContact(enemy: DamageableEnemy): void {
    if (!this.player || this.gameplayState !== GAMEPLAY_STATES.alive) {
      return;
    }

    const nowMs = this.time.now;
    if (nowMs - this.lastDamageTimeMs < PLAYER_MOVEMENT.damageCooldownMs) {
      return;
    }

    this.lastDamageTimeMs = nowMs;
    const remainingHealth = this.player.applyDamage(enemy.damage);
    this.player.setTint(remainingHealth > 0 ? 0xff8f8f : 0xc94f4f);
    this.time.delayedCall(120, () => {
      if (this.player && this.gameplayState === GAMEPLAY_STATES.alive) {
        this.player.setTint(0xf6f1d1);
      }
    });

    if (remainingHealth <= 0) {
      this.setGameplayState(GAMEPLAY_STATES.dead);
    }
  }

  private fireBullet(targetX: number, targetY: number): void {
    if (!this.player) {
      return;
    }

    const velocity = resolveVelocityVector(
      this.player.x,
      this.player.y,
      targetX,
      targetY,
      PISTOL_CARD.velocity
    );
    const magnitude = Math.hypot(velocity.x, velocity.y);
    const spawnOffset =
      magnitude === 0
        ? { x: 20, y: 0 }
        : {
            x: (velocity.x / magnitude) * 20,
            y: (velocity.y / magnitude) * 20
          };

    const bullet = new Bullet(
      this,
      this.player.x + spawnOffset.x,
      this.player.y + spawnOffset.y,
      velocity
    );
    this.bullets.push(bullet);

    for (const enemy of this.enemies) {
      this.physics.add.overlap(bullet, enemy, () => {
        this.handleBulletHit(bullet, enemy);
      });
    }
  }

  private handleBulletHit(bullet: Bullet, enemy: DamageableEnemy): void {
    if (!bullet.active || !enemy.active) {
      return;
    }

    bullet.destroy();
    this.removeBulletReference(bullet);

    if (enemy.applyDamage(bullet.getDamage()) <= 0) {
      enemy.destroy();
      const index = this.enemies.indexOf(enemy);
      if (index >= 0) {
        this.enemies.splice(index, 1);
      }
    }
  }

  private cullBullets(): void {
    for (let index = this.bullets.length - 1; index >= 0; index -= 1) {
      const bullet = this.bullets[index];
      if (!bullet.active || bullet.isOutOfBounds(LEVEL_WIDTH, LEVEL_HEIGHT)) {
        bullet.destroy();
        this.bullets.splice(index, 1);
      }
    }
  }

  private cullEnemyProjectiles(): void {
    for (let index = this.enemyProjectiles.length - 1; index >= 0; index -= 1) {
      const projectile = this.enemyProjectiles[index];
      if (
        !projectile.active ||
        projectile.isOutOfBounds(LEVEL_WIDTH, LEVEL_HEIGHT)
      ) {
        projectile.destroy();
        this.enemyProjectiles.splice(index, 1);
      }
    }
  }

  private renderCrosshair(): void {
    if (!this.crosshair) {
      return;
    }

    this.crosshair.clear();

    if (this.gameplayState !== GAMEPLAY_STATES.alive) {
      return;
    }

    const pointer = this.input.activePointer;
    this.crosshair.lineStyle(2, CROSSHAIR.color, 1);
    this.crosshair.strokeCircle(pointer.x, pointer.y, CROSSHAIR.size);
    this.crosshair.lineBetween(
      pointer.x - CROSSHAIR.size - 4,
      pointer.y,
      pointer.x + CROSSHAIR.size + 4,
      pointer.y
    );
    this.crosshair.lineBetween(
      pointer.x,
      pointer.y - CROSSHAIR.size - 4,
      pointer.x,
      pointer.y + CROSSHAIR.size + 4
    );
  }

  private handleSafeZoneReached(): void {
    if (this.gameplayState !== GAMEPLAY_STATES.alive) {
      return;
    }

    this.levelComplete = true;
    this.physics.pause();
    this.input.setDefaultCursor("default");
    this.stateText?.setText(
      `${this.getHudText()}\nSafe zone reached. Press Esc to return to menu.`
    );
    this.gameplayState = GAMEPLAY_STATES.paused;
  }

  private removeBulletReference(bullet: Bullet): void {
    const index = this.bullets.indexOf(bullet);
    if (index >= 0) {
      this.bullets.splice(index, 1);
    }
  }

  private createEnemy(
    enemyType: (typeof ALPHA_LEVEL.enemies)[number]["type"],
    spawnLocation: number
  ): DamageableEnemy {
    const spawnY = LEVEL_HEIGHT - FLOOR_HEIGHT - 20;

    if (enemyType === "spitter") {
      return new SpitterInfected(this, spawnLocation, spawnY);
    }

    const enemy = new CommonInfected(this, spawnLocation, spawnY);
    enemy.setTint(0x9fe870);
    return enemy;
  }

  private tryFireSpitterProjectile(spitter: SpitterInfected): void {
    if (!this.player) {
      return;
    }

    const velocity = spitter.tryFireAt(
      this.time.now,
      this.player.x,
      this.player.y
    );

    if (!velocity) {
      return;
    }

    const projectile = new EnemyProjectile(this, spitter.x, spitter.y, velocity);
    this.enemyProjectiles.push(projectile);
    this.physics.add.overlap(projectile, this.player, () => {
      this.handleEnemyProjectileHit(projectile);
    });
  }

  private handleEnemyProjectileHit(projectile: EnemyProjectile): void {
    if (
      !this.player ||
      !projectile.active ||
      this.gameplayState !== GAMEPLAY_STATES.alive
    ) {
      return;
    }

    projectile.destroy();
    const index = this.enemyProjectiles.indexOf(projectile);
    if (index >= 0) {
      this.enemyProjectiles.splice(index, 1);
    }

    const remainingHealth = this.player.applyDamage(projectile.getDamage());
    if (remainingHealth <= 0) {
      this.setGameplayState(GAMEPLAY_STATES.dead);
    }
  }
}
