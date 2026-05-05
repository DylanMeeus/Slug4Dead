import { describe, expect, it } from "vitest";

import {
  ALPHA_LEVEL,
  COMMON_INFECTED_STATS,
  FLOOR_HEIGHT,
  GAMEPLAY_STATES,
  GAME_TITLE,
  LEVEL_WIDTH,
  PLAYER_MOVEMENT
} from "../src/game/constants";

describe("game constants", () => {
  it("exposes the game title", () => {
    expect(GAME_TITLE).toBe("Slug4Dead");
  });

  it("defines the alpha level test ground width", () => {
    expect(LEVEL_WIDTH).toBe(1000);
  });

  it("defines a floor height for the level", () => {
    expect(FLOOR_HEIGHT).toBeGreaterThan(0);
  });

  it("defines minimal player movement tuning", () => {
    expect(PLAYER_MOVEMENT.speed).toBeGreaterThan(0);
    expect(PLAYER_MOVEMENT.jumpVelocity).toBeGreaterThan(0);
  });

  it("defines the common infected placeholder stats", () => {
    expect(COMMON_INFECTED_STATS).toEqual({
      health: 10,
      damage: 1
    });
  });

  it("defines the pre-level and in-level states", () => {
    expect(GAMEPLAY_STATES.preLevel).toBe("pre-level");
    expect(GAMEPLAY_STATES.alive).toBe("alive");
    expect(GAMEPLAY_STATES.dead).toBe("dead");
    expect(GAMEPLAY_STATES.paused).toBe("paused");
  });

  it("defines the alpha level label", () => {
    expect(ALPHA_LEVEL.label).toContain("Alpha");
  });
});
