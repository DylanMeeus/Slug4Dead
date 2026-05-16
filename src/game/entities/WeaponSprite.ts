import Phaser from "phaser";

import sniperWeaponUrl from "../../../docs/art/weapons/sniper/sniper.png";
import {
  PISTOL_WEAPON_ARM_OFFSET,
  PISTOL_WEAPON_DISPLAY_SIZE,
  PISTOL_WEAPON_SPRITE
} from "../constants";
import type { Player } from "./Player";
import { resolveWeaponRenderTransform, type Point } from "../weaponPosition";

const PISTOL_WEAPON_TEXTURE_KEY = "weapon-pistol-sniper";

export class WeaponSprite extends Phaser.GameObjects.Image {
  public static preloadAssets(scene: Phaser.Scene): void {
    if (scene.textures.exists(PISTOL_WEAPON_TEXTURE_KEY)) {
      return;
    }

    scene.load.image(PISTOL_WEAPON_TEXTURE_KEY, sniperWeaponUrl);
  }

  public constructor(scene: Phaser.Scene, player: Player, target: Point) {
    super(scene, player.x, player.y, PISTOL_WEAPON_TEXTURE_KEY);

    scene.add.existing(this);
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

    this.setPosition(transform.x, transform.y);
    this.setRotation(transform.rotation);
    this.setFlipX(transform.flipX);
    this.setDepth(player.depth + 1);

    return transform.muzzle;
  }
}
