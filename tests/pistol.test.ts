import { describe, expect, it } from "vitest";

import { PISTOL_CARD } from "../src/game/constants";
import { Pistol } from "../src/game/entities/Pistol";

describe("Pistol", () => {
  it("fires until the magazine is empty and then reloads", () => {
    const pistol = new Pistol();
    let nowMs = 0;

    for (let shot = 0; shot < PISTOL_CARD.magSize; shot += 1) {
      expect(pistol.tryFire(nowMs)).toBe(true);
      nowMs += 1000 / PISTOL_CARD.fireRatePerSecond;
    }

    expect(pistol.getAmmo()).toBe(0);
    expect(pistol.getIsReloading()).toBe(true);
    expect(pistol.tryFire(nowMs)).toBe(false);

    pistol.update(nowMs + PISTOL_CARD.reloadTimeMs);

    expect(pistol.getIsReloading()).toBe(false);
    expect(pistol.getAmmo()).toBe(PISTOL_CARD.magSize);
  });

  it("supports manual reload before the magazine is empty", () => {
    const pistol = new Pistol();

    expect(pistol.tryFire(0)).toBe(true);
    expect(pistol.getAmmo()).toBe(PISTOL_CARD.magSize - 1);
    expect(pistol.tryReload(50)).toBe(true);
    expect(pistol.getIsReloading()).toBe(true);

    pistol.update(50 + PISTOL_CARD.reloadTimeMs);

    expect(pistol.getAmmo()).toBe(PISTOL_CARD.magSize);
    expect(pistol.getIsReloading()).toBe(false);
  });
});
