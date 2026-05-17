import { describe, expect, it } from "vitest";

import {
  PISTOL_WEAPON_ARM_RIGS,
  PISTOL_WEAPON_DISPLAY_SIZE,
  PISTOL_WEAPON_SPRITE,
  PLAYER_DISPLAY_SIZE
} from "../src/game/constants";
import {
  resolveSegmentTransform,
  resolveWeaponAnchorWorldPoint,
  resolveWeaponRenderTransform
} from "../src/game/weaponPosition";

describe("weapon positioning", () => {
  const billArmRig = PISTOL_WEAPON_ARM_RIGS.Bill;

  it("places the left-facing pistol muzzle left of the player arm", () => {
    const transform = resolveWeaponRenderTransform(
      { x: 100, y: 200 },
      { x: 0, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      billArmRig.armOffset
    );

    expect(transform.facing).toBe("left");
    expect(transform.flipX).toBe(false);
    expect(transform.x).toBeGreaterThan(100 - PLAYER_DISPLAY_SIZE.width / 2);
    expect(transform.x).toBeLessThan(100 + PLAYER_DISPLAY_SIZE.width / 2);
    expect(transform.y).toBeGreaterThan(200 - PLAYER_DISPLAY_SIZE.height / 2);
    expect(transform.y).toBeLessThan(200 + PLAYER_DISPLAY_SIZE.height / 2);
    expect(transform.muzzle.x).toBeLessThan(transform.x);
  });

  it("flips the pistol sprite and places the muzzle right of the player arm", () => {
    const transform = resolveWeaponRenderTransform(
      { x: 100, y: 200 },
      { x: 300, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      billArmRig.armOffset
    );

    expect(transform.facing).toBe("right");
    expect(transform.flipX).toBe(true);
    expect(transform.x).toBeGreaterThan(100 - PLAYER_DISPLAY_SIZE.width / 2);
    expect(transform.x).toBeLessThan(100 + PLAYER_DISPLAY_SIZE.width / 2);
    expect(transform.y).toBeGreaterThan(200 - PLAYER_DISPLAY_SIZE.height / 2);
    expect(transform.y).toBeLessThan(200 + PLAYER_DISPLAY_SIZE.height / 2);
    expect(transform.muzzle.x).toBeGreaterThan(transform.x);
  });

  it("keeps the pistol grip position stable across aim direction changes", () => {
    const player = { x: 100, y: 200 };
    const leftAim = resolveWeaponRenderTransform(
      player,
      { x: 0, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      billArmRig.armOffset
    );
    const rightAim = resolveWeaponRenderTransform(
      player,
      { x: 300, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      billArmRig.armOffset
    );

    expect(leftAim.x).toBe(rightAim.x);
    expect(leftAim.y).toBe(rightAim.y);
  });

  it("rotates the muzzle toward the target point", () => {
    const target = { x: 300, y: 120 };
    const transform = resolveWeaponRenderTransform(
      { x: 100, y: 200 },
      target,
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      billArmRig.armOffset
    );
    const gripToTargetAngle = Math.atan2(
      target.y - transform.y,
      target.x - transform.x
    );
    const gripToMuzzleAngle = Math.atan2(
      transform.muzzle.y - transform.y,
      transform.muzzle.x - transform.x
    );

    expect(gripToMuzzleAngle).toBeCloseTo(gripToTargetAngle, 5);
  });

  it("places weapon hand anchors on the aimed side of the grip", () => {
    const player = { x: 100, y: 200 };
    const leftAim = resolveWeaponRenderTransform(
      player,
      { x: 0, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      billArmRig.armOffset
    );
    const rightAim = resolveWeaponRenderTransform(
      player,
      { x: 300, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      billArmRig.armOffset
    );
    const leftFrontHand = resolveWeaponAnchorWorldPoint(
      leftAim,
      billArmRig.frontHand,
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE
    );
    const rightFrontHand = resolveWeaponAnchorWorldPoint(
      rightAim,
      billArmRig.frontHand,
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE
    );

    expect(leftFrontHand.x).toBeLessThan(leftAim.x);
    expect(rightFrontHand.x).toBeGreaterThan(rightAim.x);
  });

  it("resolves retained arm segment transforms between two points", () => {
    const segment = resolveSegmentTransform({ x: 0, y: 0 }, { x: 3, y: 4 });

    expect(segment).toMatchObject({
      x: 0,
      y: 0,
      length: 5
    });
    expect(segment.rotation).toBeCloseTo(Math.atan2(4, 3), 5);
  });
});
