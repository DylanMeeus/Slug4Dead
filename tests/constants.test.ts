import { describe, expect, it } from "vitest";

import {
  ALPHA_LEVEL,
  COMMON_INFECTED_MOVEMENT,
  COMMON_INFECTED_STATS,
  CROSSHAIR,
  FLOOR_HEIGHT,
  GAMEPLAY_STATES,
  GAME_TITLE,
  LEVEL_WIDTH,
  PISTOL_CARD,
  PLAYER_CARD,
  PLAYER_MOVEMENT
} from "../src/game/constants";

describe("game constants", () => {
  it("exposes the game title", () => {
    expect(GAME_TITLE).toBe("Slug4Dead");
  });

  it("defines the alpha level test ground width", () => {
    expect(LEVEL_WIDTH).toBe(2000);
  });

  it("defines a floor height for the level", () => {
    expect(FLOOR_HEIGHT).toBeGreaterThan(0);
  });

  it("defines minimal player movement tuning", () => {
    expect(PLAYER_CARD).toEqual({
      health: 100,
      velocity: 500
    });
    expect(PLAYER_MOVEMENT.jumpVelocityPixelsPerSecond).toBeGreaterThan(0);
  });

  it("defines the common infected placeholder stats and patrol range", () => {
    expect(COMMON_INFECTED_STATS).toEqual({
      health: 10,
      damage: 1,
      velocity: 100
    });
    expect(COMMON_INFECTED_MOVEMENT.speedPixelsPerSecond).toBe(
      COMMON_INFECTED_STATS.velocity
    );
    expect(COMMON_INFECTED_MOVEMENT.maxPatrolDistance).toBe(300);
  });

  it("defines the pre-level and in-level states", () => {
    expect(GAMEPLAY_STATES.preLevel).toBe("pre-level");
    expect(GAMEPLAY_STATES.alive).toBe("alive");
    expect(GAMEPLAY_STATES.dead).toBe("dead");
    expect(GAMEPLAY_STATES.paused).toBe("paused");
  });

  it("defines the alpha level label", () => {
    expect(ALPHA_LEVEL.label).toContain("Alpha");
    expect(ALPHA_LEVEL.playerSpawnLocation).toBe(50);
    expect(ALPHA_LEVEL.enemies).toEqual([
      {
        type: "common",
        spawnLocation: 200
      },
      {
        type: "common",
        spawnLocation: 400
      }
    ]);
  });

  it("defines the pistol card", () => {
    expect(PISTOL_CARD).toEqual({
      magSize: 15,
      reloadTimeMs: 2000,
      fireRatePerSecond: 10,
      bulletDamage: 10,
      velocity: 200
    });
  });

  it("defines crosshair rendering constants", () => {
    expect(CROSSHAIR.size).toBeGreaterThan(0);
  });
});
