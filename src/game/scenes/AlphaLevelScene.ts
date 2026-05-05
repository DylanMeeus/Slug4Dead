import Phaser from "phaser";

import { CommonInfected } from "../entities/CommonInfected";
import { Player } from "../entities/Player";
import {
  COMMON_INFECTED_STATS,
  FLOOR_HEIGHT,
  type GameplayState,
  GAMEPLAY_STATES,
  LEVEL_HEIGHT,
  LEVEL_WIDTH,
  PLAYER_SIZE,
  SCENE_KEYS
} from "../constants";

export class AlphaLevelScene extends Phaser.Scene {
  public static readonly key = SCENE_KEYS.alphaLevel;

  private gameplayState: GameplayState = GAMEPLAY_STATES.alive;
  private player?: Player;
  private stateText?: Phaser.GameObjects.Text;
  private floor?: Phaser.GameObjects.Rectangle;

  public constructor() {
    super(AlphaLevelScene.key);
  }

  public create(): void {
    this.cameras.main.setBackgroundColor("#6c8fb0");
    this.physics.world.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);
    this.cameras.main.setBounds(0, 0, LEVEL_WIDTH, LEVEL_HEIGHT);

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

    const playerStartY = LEVEL_HEIGHT - FLOOR_HEIGHT - PLAYER_SIZE.height / 2;
    this.player = new Player(this, 96, playerStartY);
    this.player.setTint(0xf6f1d1);

    const infected = new CommonInfected(
      this,
      720,
      LEVEL_HEIGHT - FLOOR_HEIGHT - 20
    );
    infected.setTint(0x9fe870);

    this.physics.add.collider(this.player, this.floor);
    this.physics.add.collider(infected, this.floor);
    this.physics.add.overlap(this.player, infected, () => {
      this.setGameplayState(GAMEPLAY_STATES.dead);
    });

    this.cameras.main.startFollow(this.player, true, 0.12, 0.12);

    this.stateText = this.add
      .text(16, 16, this.getHudText(), {
        fontFamily: "monospace",
        fontSize: "16px",
        color: "#10131a",
        backgroundColor: "#f6f1d1",
        padding: { x: 8, y: 6 }
      })
      .setScrollFactor(0);

    this.input.keyboard!.on("keydown-ESC", () => {
      if (this.gameplayState === GAMEPLAY_STATES.dead) {
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
    if (this.gameplayState !== GAMEPLAY_STATES.alive || !this.player) {
      return;
    }

    this.player.update();
  }

  private setGameplayState(nextState: GameplayState): void {
    this.gameplayState = nextState;

    if (nextState === GAMEPLAY_STATES.dead && this.player) {
      this.player.setTint(0xc94f4f);
      this.player.setVelocity(0, 0);
      this.physics.pause();
    }

    this.stateText?.setText(this.getHudText());
  }

  private getHudText(): string {
    return [
      `State: ${this.gameplayState}`,
      "Controls: Left / Right / Space",
      `Common infected: ${COMMON_INFECTED_STATS.health}hp / ${COMMON_INFECTED_STATS.damage} damage`,
      "Esc: pause, resume, or return to menu when dead"
    ].join("\n");
  }
}
