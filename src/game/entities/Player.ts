import Phaser from "phaser";

import { PLAYER_MOVEMENT, PLAYER_SIZE } from "../constants";

const PLAYER_TEXTURE_KEY = "__player";

export class Player extends Phaser.Physics.Arcade.Sprite {
  private readonly movementKeys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
  };

  public constructor(scene: Phaser.Scene, x: number, y: number) {
    Player.ensureTexture(scene);
    super(scene, x, y, PLAYER_TEXTURE_KEY);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setDisplaySize(PLAYER_SIZE.width, PLAYER_SIZE.height);
    this.setCollideWorldBounds(true);
    this.setBounce(0);

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(PLAYER_SIZE.width, PLAYER_SIZE.height);

    this.movementKeys = scene.input.keyboard!.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    }) as {
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      jump: Phaser.Input.Keyboard.Key;
    };
  }

  public update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;

    if (this.movementKeys.left.isDown) {
      this.setVelocityX(-PLAYER_MOVEMENT.speed);
      this.setFlipX(true);
    } else if (this.movementKeys.right.isDown) {
      this.setVelocityX(PLAYER_MOVEMENT.speed);
      this.setFlipX(false);
    } else {
      this.setVelocityX(0);
    }

    if (
      Phaser.Input.Keyboard.JustDown(this.movementKeys.jump) &&
      body.blocked.down
    ) {
      this.setVelocityY(-PLAYER_MOVEMENT.jumpVelocity);
    }
  }

  private static ensureTexture(scene: Phaser.Scene): void {
    if (scene.textures.exists(PLAYER_TEXTURE_KEY)) {
      return;
    }

    const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
    graphics.fillStyle(0xffffff);
    graphics.fillRect(0, 0, PLAYER_SIZE.width, PLAYER_SIZE.height);
    graphics.generateTexture(
      PLAYER_TEXTURE_KEY,
      PLAYER_SIZE.width,
      PLAYER_SIZE.height
    );
    graphics.destroy();
  }
}
