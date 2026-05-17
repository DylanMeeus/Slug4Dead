import Phaser from "phaser";

import sniperUrl from "../../../docs/art/weapons/sniper/sniper.png";
import {
  PISTOL_WEAPON_ARM_OFFSET,
  PISTOL_WEAPON_ARM_RIG,
  PISTOL_WEAPON_DISPLAY_SIZE,
  PISTOL_WEAPON_SPRITE
} from "../constants";
import type { Player } from "./Player";
import {
  resolveSegmentTransform,
  resolveWeaponAnchorWorldPoint,
  resolveWeaponRenderTransform,
  type Point
} from "../weaponPosition";

const PISTOL_WEAPON_TEXTURE_KEY = "weapon-pistol-sniper";

export class WeaponSprite extends Phaser.GameObjects.Image {
  private readonly rearSleeve: Phaser.GameObjects.Rectangle;
  private readonly frontSleeve: Phaser.GameObjects.Rectangle;
  private readonly rearHand: Phaser.GameObjects.Arc;
  private readonly frontHand: Phaser.GameObjects.Arc;

  public static preloadAssets(scene: Phaser.Scene): void {
    if (scene.textures.exists(PISTOL_WEAPON_TEXTURE_KEY)) {
      return;
    }

    scene.load.image(PISTOL_WEAPON_TEXTURE_KEY, sniperUrl);
  }

  public constructor(scene: Phaser.Scene, player: Player, target: Point) {
    super(scene, player.x, player.y, PISTOL_WEAPON_TEXTURE_KEY);

    scene.add.existing(this);
    this.rearSleeve = scene.add
      .rectangle(0, 0, 1, 1, PISTOL_WEAPON_ARM_RIG.sleeveColor)
      .setOrigin(0, 0.5);
    this.frontSleeve = scene.add
      .rectangle(0, 0, 1, 1, PISTOL_WEAPON_ARM_RIG.sleeveColor)
      .setOrigin(0, 0.5);
    this.rearHand = scene.add.circle(
      0,
      0,
      PISTOL_WEAPON_ARM_RIG.handRadius,
      PISTOL_WEAPON_ARM_RIG.handColor
    );
    this.frontHand = scene.add.circle(
      0,
      0,
      PISTOL_WEAPON_ARM_RIG.handRadius,
      PISTOL_WEAPON_ARM_RIG.handColor
    );

    this.setOrigin(
      PISTOL_WEAPON_SPRITE.grip.x / PISTOL_WEAPON_SPRITE.width,
      PISTOL_WEAPON_SPRITE.grip.y / PISTOL_WEAPON_SPRITE.height
    );
    this.setDisplaySize(
      PISTOL_WEAPON_DISPLAY_SIZE.width,
      PISTOL_WEAPON_DISPLAY_SIZE.height
    );
    this.setDepth(player.depth + 1);
    this.updateForPlayer(player, target);
  }

  public updateForPlayer(player: Player, target: Point): Point {
    const transform = resolveWeaponRenderTransform(
      { x: player.x, y: player.y },
      target,
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      PISTOL_WEAPON_ARM_OFFSET
    );
    const rearShoulder = resolveShoulderPoint(
      player,
      transform.facing,
      PISTOL_WEAPON_ARM_RIG.rearShoulderOffset
    );
    const frontShoulder = resolveShoulderPoint(
      player,
      transform.facing,
      PISTOL_WEAPON_ARM_RIG.frontShoulderOffset
    );
    const rearHand = resolveWeaponAnchorWorldPoint(
      transform,
      PISTOL_WEAPON_ARM_RIG.rearHand,
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE
    );
    const frontHand = resolveWeaponAnchorWorldPoint(
      transform,
      PISTOL_WEAPON_ARM_RIG.frontHand,
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE
    );

    this.setPosition(transform.x, transform.y);
    this.setRotation(transform.rotation);
    this.setFlipX(transform.flipX);
    this.setDepth(player.depth + 2);
    this.updateSleeve(this.rearSleeve, rearShoulder, rearHand);
    this.updateSleeve(this.frontSleeve, frontShoulder, frontHand);
    this.rearHand.setPosition(rearHand.x, rearHand.y);
    this.frontHand.setPosition(frontHand.x, frontHand.y);
    this.rearSleeve.setDepth(player.depth + 1);
    this.frontSleeve.setDepth(player.depth + 1);
    this.rearHand.setDepth(player.depth + 3);
    this.frontHand.setDepth(player.depth + 3);

    return transform.muzzle;
  }

  public override destroy(fromScene?: boolean): void {
    this.rearSleeve.destroy(fromScene);
    this.frontSleeve.destroy(fromScene);
    this.rearHand.destroy(fromScene);
    this.frontHand.destroy(fromScene);
    super.destroy(fromScene);
  }

  private updateSleeve(
    sleeve: Phaser.GameObjects.Rectangle,
    shoulder: Point,
    hand: Point
  ): void {
    const segment = resolveSegmentTransform(shoulder, hand);

    sleeve
      .setPosition(segment.x, segment.y)
      .setDisplaySize(segment.length, PISTOL_WEAPON_ARM_RIG.sleeveThickness)
      .setRotation(segment.rotation);
  }
}

function resolveShoulderPoint(
  player: Player,
  facing: "left" | "right",
  offset: Point
): Point {
  const xOffset = facing === "right" ? -offset.x : offset.x;

  return {
    x: player.x + xOffset,
    y: player.y + offset.y
  };
}
