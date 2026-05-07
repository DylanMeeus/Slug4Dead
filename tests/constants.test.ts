import { describe, expect, it } from "vitest";

import {
  ALPHA_CAMPAIGN,
  ALPHA_LEVEL,
  CAMPAIGNS,
  COMMON_INFECTED_MOVEMENT,
  COMMON_INFECTED_STATS,
  CROSSHAIR,
  FLOOR_HEIGHT,
  GAMEPLAY_STATES,
  GAME_TITLE,
  LEVEL_WIDTH,
  PISTOL_CARD,
  PLAYER_CARD,
  PLAYER_MOVEMENT,
  SPITTER_INFECTED_PROJECTILE,
  SPITTER_INFECTED_STATS
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
      velocity: 200
    });
    expect(PLAYER_MOVEMENT.jumpVelocityPixelsPerSecond).toBeGreaterThan(0);
  });

  it("defines the common infected placeholder stats and patrol range", () => {
    expect(COMMON_INFECTED_STATS).toEqual({
      name: "common",
      health: 10,
      damage: 25,
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
    expect(GAMEPLAY_STATES.levelCompleted).toBe("level_completed");
    expect(GAMEPLAY_STATES.paused).toBe("paused");
  });

  it("defines the ordered alpha campaign levels", () => {
    expect(CAMPAIGNS).toEqual([ALPHA_CAMPAIGN]);
    expect(ALPHA_CAMPAIGN.key).toBe("alpha");
    expect(ALPHA_CAMPAIGN.levels.map((level) => level.name)).toEqual([
      "alpha 1",
      "alpha 2"
    ]);
  });

  it("defines the alpha level enemy layout", () => {
    expect(ALPHA_LEVEL.name).toBe("alpha 1");
    expect(ALPHA_LEVEL.playerSpawnLocation).toBe(50);
    expect(ALPHA_LEVEL.enemies).toEqual([
      {
        type: "common",
        spawnLocation: 500
      },
      {
        type: "common",
        spawnLocation: 1000
      },
      {
        type: "spitter",
        spawnLocation: 1500
      }
    ]);
  });

  it("defines the spitter infected stats and projectile", () => {
    expect(SPITTER_INFECTED_STATS).toEqual({
      name: "spitter",
      health: 20,
      damage: 50,
      velocity: 150
    });
    expect(SPITTER_INFECTED_PROJECTILE.velocity).toBe(300);
    expect(SPITTER_INFECTED_PROJECTILE.minFireDelayMs).toBeGreaterThan(0);
    expect(SPITTER_INFECTED_PROJECTILE.maxFireDelayMs).toBeGreaterThan(
      SPITTER_INFECTED_PROJECTILE.minFireDelayMs
    );
  });

  it("defines the pistol card", () => {
    expect(PISTOL_CARD).toEqual({
      magSize: 15,
      reloadTimeMs: 2000,
      fireRatePerSecond: 10,
      damage: 2,
      velocity: 500
    });
  });

  it("defines crosshair rendering constants", () => {
    expect(CROSSHAIR.size).toBeGreaterThan(0);
  });
});
