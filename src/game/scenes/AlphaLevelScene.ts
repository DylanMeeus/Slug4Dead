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
  CAMPAIGNS,
  CROSSHAIR,
  COMMON_INFECTED_MOVEMENT,
  COMMON_INFECTED_STATS,
  FLOOR_HEIGHT,
  type CampaignDefinition,
  type GameplayState,
  GAMEPLAY_STATES,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  type LevelDefinition,
  PISTOL_CARD,
  PLAYER_CARD,
  PLAYER_MOVEMENT,
  PLAYER_SIZE,
  SAFE_ZONE_WIDTH,
  SCENE_KEYS,
  SPITTER_INFECTED_PROJECTILE,
  SPITTER_INFECTED_STATS,
  SPITTER_DISPLAY_SIZE,
  type SurvivorName,
  isSurvivorName,
  SURVIVORS
} from "../constants";

type AlphaLevelStartData = {
  campaignKey?: string;
  levelIndex?: number;
  survivorName?: string;
};

export class AlphaLevelScene extends Phaser.Scene {
  public static readonly key = SCENE_KEYS.alphaLevel;

  private gameplayState: GameplayState = GAMEPLAY_STATES.alive;
  private currentCampaign: CampaignDefinition = CAMPAIGNS[0];
  private currentLevel: LevelDefinition = ALPHA_LEVEL;
  private currentLevelIndex = 0;
  private currentSurvivor: SurvivorName = SURVIVORS[0];
  private player?: Player;
  private stateText?: Phaser.GameObjects.Text;
  private floor?: Phaser.GameObjects.Rectangle;
  private safeZone?: Phaser.GameObjects.Rectangle;
  private crosshair?: Phaser.GameObjects.Graphics;
  private readonly overlayObjects: Phaser.GameObjects.GameObject[] = [];
  private readonly enemies: DamageableEnemy[] = [];
  private readonly bullets: Bullet[] = [];
  private readonly enemyProjectiles: EnemyProjectile[] = [];
  private pistol = new Pistol();
  private lastDamageTimeMs = -PLAYER_MOVEMENT.damageCooldownMs;
  private shotsFired = 0;
  private enemiesKilled = 0;
  private levelStartedAtMs = 0;

  public constructor() {
    super(AlphaLevelScene.key);
  }

  public preload(): void {
    SpitterInfected.preloadAssets(this);
  }

  public create(data: AlphaLevelStartData = {}): void {
    this.currentCampaign =
      CAMPAIGNS.find((campaign) => campaign.key === data.campaignKey) ??
      CAMPAIGNS[0];
    this.currentLevelIndex = Phaser.Math.Clamp(
      data.levelIndex ?? 0,
      0,
      this.currentCampaign.levels.length - 1
    );
    this.currentLevel = this.currentCampaign.levels[this.currentLevelIndex];
    this.currentSurvivor =
      data.survivorName && isSurvivorName(data.survivorName)
        ? data.survivorName
        : SURVIVORS[0];
    this.gameplayState = GAMEPLAY_STATES.alive;
    this.pistol = new Pistol();
    this.enemies.length = 0;
    this.bullets.length = 0;
    this.enemyProjectiles.length = 0;
    this.clearOverlay();
    this.lastDamageTimeMs = -PLAYER_MOVEMENT.damageCooldownMs;
    this.shotsFired = 0;
    this.enemiesKilled = 0;
    this.levelStartedAtMs = this.time.now;

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
    this.player = new Player(
      this,
      this.currentLevel.playerSpawnLocation,
      playerStartY
    );
    this.player.setTint(0xf6f1d1);

    this.physics.add.collider(this.player, this.floor);
    this.physics.add.overlap(this.player, this.safeZone, () => {
      this.handleSafeZoneReached();
    });

    for (const enemyDefinition of this.currentLevel.enemies) {
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

      this.shotsFired += 1;
      this.fireBullet(pointer.worldX, pointer.worldY);
      this.stateText?.setText(this.getHudText());
    });

    this.input.keyboard!.on("keydown-ESC", () => {
      if (this.gameplayState === GAMEPLAY_STATES.dead) {
        return;
      }

      if (this.gameplayState === GAMEPLAY_STATES.levelCompleted) {
        return;
      }

      if (this.gameplayState === GAMEPLAY_STATES.paused) {
        this.physics.resume();
        this.clearOverlay();
        this.setGameplayState(GAMEPLAY_STATES.alive);
        return;
      }

      this.physics.pause();
      this.setGameplayState(GAMEPLAY_STATES.paused);
      this.showPauseOverlay();
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
      this.input.setDefaultCursor("default");
      this.showDeadOverlay();
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
      `Level: ${this.currentLevel.name}`,
      `Survivor: ${this.currentSurvivor}`,
      `State: ${this.gameplayState}`,
      `Player: ${this.player?.getHealth() ?? PLAYER_CARD.health}hp / velocity ${PLAYER_CARD.velocity}`,
      `Pistol: ${this.pistol.getAmmo()}/${PISTOL_CARD.magSize} / fire rate ${PISTOL_CARD.fireRatePerSecond}/s`,
      reloadLabel,
      `Common infected: ${COMMON_INFECTED_STATS.health}hp / ${COMMON_INFECTED_STATS.damage} damage / velocity ${COMMON_INFECTED_MOVEMENT.speedPixelsPerSecond}px/s`,
      `Spitter: ${SPITTER_INFECTED_STATS.health}hp / ${SPITTER_INFECTED_STATS.damage} damage / projectile ${SPITTER_INFECTED_PROJECTILE.velocity}px/s`,
      `Alpha enemies: ${this.enemies.length}`,
      `Shots: ${this.shotsFired} / Kills: ${this.enemiesKilled}`,
      "Controls: A / D / Space / Mouse 1 / Esc",
      "Esc: pause or resume"
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
      this.enemiesKilled += 1;
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

    this.physics.pause();
    this.input.setDefaultCursor("default");
    this.setGameplayState(GAMEPLAY_STATES.levelCompleted);
    this.showVictoryOverlay();
  }

  private removeBulletReference(bullet: Bullet): void {
    const index = this.bullets.indexOf(bullet);
    if (index >= 0) {
      this.bullets.splice(index, 1);
    }
  }

  private createEnemy(
    enemyType: LevelDefinition["enemies"][number]["type"],
    spawnLocation: number
  ): DamageableEnemy {
    if (enemyType === "spitter") {
      const spawnY =
        LEVEL_HEIGHT - FLOOR_HEIGHT - SPITTER_DISPLAY_SIZE.height / 2;
      return new SpitterInfected(this, spawnLocation, spawnY);
    }

    const spawnY = LEVEL_HEIGHT - FLOOR_HEIGHT - 20;
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

  private getElapsedSeconds(): number {
    return Math.max(
      0,
      Math.floor((this.time.now - this.levelStartedAtMs) / 1000)
    );
  }

  private showPauseOverlay(): void {
    this.clearOverlay();
    this.addOverlayTitle("Paused", "Resume or quit the current level.");
    this.addOverlayButton("Resume", LEVEL_HEIGHT / 2 + 18, () => {
      this.physics.resume();
      this.clearOverlay();
      this.setGameplayState(GAMEPLAY_STATES.alive);
    });
    this.addOverlayButton("Quit", LEVEL_HEIGHT / 2 + 72, () => {
      this.input.setDefaultCursor("default");
      this.scene.start(SCENE_KEYS.menu);
    });
  }

  private showDeadOverlay(): void {
    this.clearOverlay();
    this.addOverlayTitle("Game Over", "Restart the level or quit.");
    this.addOverlayButton("Restart Level", LEVEL_HEIGHT / 2 + 18, () => {
      this.restartCurrentLevel();
    });
    this.addOverlayButton("Quit", LEVEL_HEIGHT / 2 + 72, () => {
      this.input.setDefaultCursor("default");
      this.scene.start(SCENE_KEYS.menu);
    });
  }

  private showVictoryOverlay(): void {
    this.clearOverlay();
    const nextLevel = this.currentCampaign.levels[this.currentLevelIndex + 1];
    const title = nextLevel ? "Level Complete" : "Campaign Win";
    const actionLabel = nextLevel ? "Continue" : "Main Menu";

    this.addOverlayTitle(
      title,
      [
        `Shots fired: ${this.shotsFired}`,
        `Enemies killed: ${this.enemiesKilled}`,
        `Time: ${this.getElapsedSeconds()}s`
      ].join("\n")
    );
    this.addOverlayButton(actionLabel, LEVEL_HEIGHT / 2 + 92, () => {
      if (!nextLevel) {
        this.input.setDefaultCursor("default");
        this.scene.start(SCENE_KEYS.menu);
        return;
      }

      this.scene.start(SCENE_KEYS.alphaLevel, {
        campaignKey: this.currentCampaign.key,
        levelIndex: this.currentLevelIndex + 1,
        survivorName: this.currentSurvivor
      });
    });
  }

  private addOverlayTitle(title: string, body: string): void {
    const screenWidth = this.scale.width;
    const screenHeight = this.scale.height;
    const overlay = this.add
      .rectangle(0, 0, screenWidth, screenHeight, 0x10131a, 0.72)
      .setOrigin(0)
      .setScrollFactor(0);
    const titleText = this.add
      .text(screenWidth / 2, screenHeight / 2 - 116, title, {
        fontFamily: "monospace",
        fontSize: "34px",
        color: "#f6f1d1",
        align: "center"
      })
      .setOrigin(0.5)
      .setScrollFactor(0);
    const bodyText = this.add
      .text(screenWidth / 2, screenHeight / 2 - 48, body, {
        fontFamily: "monospace",
        fontSize: "18px",
        color: "#ffffff",
        align: "center",
        lineSpacing: 8
      })
      .setOrigin(0.5)
      .setScrollFactor(0);

    this.overlayObjects.push(overlay, titleText, bodyText);
  }

  private addOverlayButton(
    label: string,
    y: number,
    onClick: () => void
  ): void {
    const button = this.add
      .text(this.scale.width / 2, y, label, {
        fontFamily: "monospace",
        fontSize: "22px",
        color: "#10131a",
        backgroundColor: "#f6f1d1",
        padding: { x: 18, y: 10 }
      })
      .setOrigin(0.5)
      .setScrollFactor(0)
      .setInteractive({ useHandCursor: true });

    button.on("pointerdown", onClick);
    this.overlayObjects.push(button);
  }

  private clearOverlay(): void {
    for (const object of this.overlayObjects) {
      object.destroy();
    }
    this.overlayObjects.length = 0;
  }

  private restartCurrentLevel(): void {
    this.scene.start(SCENE_KEYS.alphaLevel, {
      campaignKey: this.currentCampaign.key,
      levelIndex: this.currentLevelIndex,
      survivorName: this.currentSurvivor
    });
  }
}
