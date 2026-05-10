import Phaser from "phaser";

import billSpritesheetUrl from "../../../docs/art/players/bill/bill-spritesheet.png";
import zoeySpritesheetUrl from "../../../docs/art/players/zoey/zoey-spritesheet.png";
import { buildInclusiveFrameSequence } from "../animationFrames";
import {
  hasPlayerSpritesheet,
  PLAYER_CARD,
  PLAYER_DISPLAY_SIZE,
  PLAYER_MOVEMENT,
  PLAYER_SPRITESHEET_DEFAULT_FACING,
  PLAYER_SIZE,
  PLAYER_SPRITESHEETS,
  type HorizontalFacingDirection,
  type SpritesheetSurvivorName,
  type SurvivorName
} from "../constants";

const PLAYER_TEXTURE_KEY = "__player";
const PLAYER_TEXTURE_KEYS: Record<SpritesheetSurvivorName, string> = {
  Bill: "player-bill-spritesheet",
  Zoey: "player-zoey-spritesheet"
};
const PLAYER_SPRITESHEET_URLS: Record<SpritesheetSurvivorName, string> = {
  Bill: billSpritesheetUrl,
  Zoey: zoeySpritesheetUrl
};

export class Player extends Phaser.Physics.Arcade.Sprite {
  private healthPoints: number = PLAYER_CARD.health;
  private readonly idleAnimationKey?: string;
  private readonly walkingAnimationKey?: string;
  private readonly defaultFacingDirection?: HorizontalFacingDirection;
  private readonly movementKeys: {
    left: Phaser.Input.Keyboard.Key;
    right: Phaser.Input.Keyboard.Key;
    jump: Phaser.Input.Keyboard.Key;
  };

  public static preloadAssets(scene: Phaser.Scene): void {
    for (const survivorName of Object.keys(
      PLAYER_TEXTURE_KEYS
    ) as SpritesheetSurvivorName[]) {
      const textureKey = PLAYER_TEXTURE_KEYS[survivorName];
      if (scene.textures.exists(textureKey)) {
        continue;
      }

      const spritesheet = PLAYER_SPRITESHEETS[survivorName];
      scene.load.spritesheet(textureKey, PLAYER_SPRITESHEET_URLS[survivorName], {
        frameWidth: spritesheet.frameWidth,
        frameHeight: spritesheet.frameHeight
      });
    }
  }

  public constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    survivorName: SurvivorName
  ) {
    Player.ensurePlaceholderTexture(scene);
    const textureKey = Player.getTextureKey(survivorName);
    super(scene, x, y, textureKey);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    if (hasPlayerSpritesheet(survivorName)) {
      Player.ensureAnimations(scene, survivorName);
      this.idleAnimationKey = Player.getAnimationKey(survivorName, "idle");
      this.walkingAnimationKey = Player.getAnimationKey(survivorName, "walking");
      this.defaultFacingDirection =
        PLAYER_SPRITESHEET_DEFAULT_FACING[survivorName];
      this.play(this.idleAnimationKey);
      this.setDisplaySize(PLAYER_DISPLAY_SIZE.width, PLAYER_DISPLAY_SIZE.height);
    } else {
      this.setDisplaySize(PLAYER_SIZE.width, PLAYER_SIZE.height);
      this.setTint(0xf6f1d1);
    }

    this.setCollideWorldBounds(true);
    this.setBounce(0);

    const body = this.body as Phaser.Physics.Arcade.Body;
    const bodySourceWidth = PLAYER_SIZE.width / this.scaleX;
    const bodySourceHeight = PLAYER_SIZE.height / this.scaleY;
    body.setSize(bodySourceWidth, bodySourceHeight);
    body.setOffset(
      (this.width - bodySourceWidth) / 2,
      this.height - bodySourceHeight
    );

    this.movementKeys = scene.input.keyboard!.addKeys({
      left: Phaser.Input.Keyboard.KeyCodes.A,
      right: Phaser.Input.Keyboard.KeyCodes.D,
      jump: Phaser.Input.Keyboard.KeyCodes.SPACE
    }) as {
      left: Phaser.Input.Keyboard.Key;
      right: Phaser.Input.Keyboard.Key;
      jump: Phaser.Input.Keyboard.Key;
    };
  }

  public update(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    let isWalking = false;

    if (this.movementKeys.left.isDown) {
      this.setVelocityX(-PLAYER_CARD.velocity);
      this.faceDirection("left");
      isWalking = true;
    } else if (this.movementKeys.right.isDown) {
      this.setVelocityX(PLAYER_CARD.velocity);
      this.faceDirection("right");
      isWalking = true;
    } else {
      this.setVelocityX(0);
    }

    this.syncAnimation(isWalking);

    if (
      Phaser.Input.Keyboard.JustDown(this.movementKeys.jump) &&
      body.blocked.down
    ) {
      this.setVelocityY(-PLAYER_MOVEMENT.jumpVelocityPixelsPerSecond);
    }
  }

  public applyDamage(damage: number): number {
    this.healthPoints = Math.max(0, this.healthPoints - damage);
    return this.healthPoints;
  }

  public getHealth(): number {
    return this.healthPoints;
  }

  public getAnimationDebugText(): string {
    const currentAnimationKey = this.anims.currentAnim?.key ?? "none";
    const currentFrame = this.anims.currentFrame;
    const textureFrame = currentFrame?.textureFrame ?? "none";
    const frameIndex = currentFrame?.index ?? "none";
    const playingState = this.anims.isPlaying ? "playing" : "stopped";

    return `${currentAnimationKey} / texture frame ${textureFrame} / sequence frame ${frameIndex} / ${playingState}`;
  }

  private syncAnimation(isWalking: boolean): void {
    const nextAnimationKey = isWalking
      ? this.walkingAnimationKey
      : this.idleAnimationKey;

    if (!nextAnimationKey || this.anims.currentAnim?.key === nextAnimationKey) {
      return;
    }

    this.play(nextAnimationKey, true);
  }

  private faceDirection(direction: HorizontalFacingDirection): void {
    if (!this.defaultFacingDirection) {
      this.setFlipX(direction === "left");
      return;
    }

    this.setFlipX(direction !== this.defaultFacingDirection);
  }

  private static ensurePlaceholderTexture(scene: Phaser.Scene): void {
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

  private static getTextureKey(survivorName: SurvivorName): string {
    if (!hasPlayerSpritesheet(survivorName)) {
      return PLAYER_TEXTURE_KEY;
    }

    return PLAYER_TEXTURE_KEYS[survivorName];
  }

  private static getAnimationKey(
    survivorName: SpritesheetSurvivorName,
    animationName: "idle" | "walking"
  ): string {
    return `player-${survivorName.toLowerCase()}-${animationName}`;
  }

  private static ensureAnimations(
    scene: Phaser.Scene,
    survivorName: SpritesheetSurvivorName
  ): void {
    const spritesheet = PLAYER_SPRITESHEETS[survivorName];
    const textureKey = PLAYER_TEXTURE_KEYS[survivorName];

    const idleKey = Player.getAnimationKey(survivorName, "idle");
    if (!scene.anims.exists(idleKey)) {
      const idle = spritesheet.animations.idle;
      scene.anims.create({
        key: idleKey,
        frames: scene.anims.generateFrameNumbers(textureKey, {
          frames: buildInclusiveFrameSequence(idle)
        }),
        frameRate: idle.frameRate,
        repeat: idle.repeat
      });
    }

    const walkingKey = Player.getAnimationKey(survivorName, "walking");
    if (!scene.anims.exists(walkingKey)) {
      const walking = spritesheet.animations.walking;
      scene.anims.create({
        key: walkingKey,
        frames: scene.anims.generateFrameNumbers(textureKey, {
          frames: buildInclusiveFrameSequence(walking)
        }),
        frameRate: walking.frameRate,
        repeat: walking.repeat
      });
    }
  }
}
