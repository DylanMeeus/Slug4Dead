import { describe, expect, it } from "vitest";

import {
  PISTOL_WEAPON_ARM_OFFSET,
  PISTOL_WEAPON_DISPLAY_SIZE,
  PISTOL_WEAPON_SPRITE
} from "../src/game/constants";
import { resolveWeaponRenderTransform } from "../src/game/weaponPosition";

describe("weapon positioning", () => {
  it("places the left-facing pistol muzzle left of the player arm", () => {
    const transform = resolveWeaponRenderTransform(
      { x: 100, y: 200 },
      { x: 0, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      PISTOL_WEAPON_ARM_OFFSET
    );

    expect(transform.facing).toBe("left");
    expect(transform.flipX).toBe(false);
    expect(transform.x).toBe(85);
    expect(transform.y).toBe(192);
    expect(transform.muzzle.x).toBeLessThan(transform.x);
  });

  it("flips the pistol sprite and places the muzzle right of the player arm", () => {
    const transform = resolveWeaponRenderTransform(
      { x: 100, y: 200 },
      { x: 300, y: 200 },
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      PISTOL_WEAPON_ARM_OFFSET
    );

    expect(transform.facing).toBe("right");
    expect(transform.flipX).toBe(true);
    expect(transform.x).toBe(115);
    expect(transform.y).toBe(192);
    expect(transform.muzzle.x).toBeGreaterThan(transform.x);
  });

  it("rotates the muzzle toward the target point", () => {
    const target = { x: 300, y: 120 };
    const transform = resolveWeaponRenderTransform(
      { x: 100, y: 200 },
      target,
      PISTOL_WEAPON_SPRITE,
      PISTOL_WEAPON_DISPLAY_SIZE,
      PISTOL_WEAPON_ARM_OFFSET
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
});
