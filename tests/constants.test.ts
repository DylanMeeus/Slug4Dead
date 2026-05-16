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
  isEnemyType,
  KNOWN_ENEMY_TYPES,
  LEVEL_WIDTH,
  normalizeLevelDefinition,
  PISTOL_CARD,
  PISTOL_WEAPON_ARM_OFFSET,
  PISTOL_WEAPON_DISPLAY_SIZE,
  PISTOL_WEAPON_SPRITE,
  PLAYER_CARD,
  PLAYER_DISPLAY_SIZE,
  PLAYER_MOVEMENT,
  PLAYER_SIZE,
  PLAYER_SPRITESHEET_DEFAULT_FACING,
  PLAYER_SPRITESHEETS,
  SPITTER_DISPLAY_SIZE,
  SPITTER_INFECTED_PROJECTILE,
  SPITTER_INFECTED_STATS,
  SPITTER_SPRITESHEET,
  SURVIVORS,
  hasPlayerSpritesheet,
  isSurvivorName
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

  it("defines the selectable survivors from the gameplay loop", () => {
    expect(SURVIVORS).toEqual(["Bill", "Louis", "Francis", "Zoey"]);
    expect(isSurvivorName("Bill")).toBe(true);
    expect(isSurvivorName("Zoey")).toBe(true);
    expect(isSurvivorName("Unknown")).toBe(false);
  });

  it("defines player spritesheets for survivors with generated art", () => {
    expect(hasPlayerSpritesheet("Bill")).toBe(true);
    expect(hasPlayerSpritesheet("Zoey")).toBe(true);
    expect(hasPlayerSpritesheet("Louis")).toBe(false);
    expect(hasPlayerSpritesheet("Francis")).toBe(false);
    expect(PLAYER_DISPLAY_SIZE).toEqual({
      width: 64,
      height: 96
    });
    expect(PLAYER_SIZE).toEqual({
      width: 28,
      height: 44
    });
    expect(PLAYER_SPRITESHEET_DEFAULT_FACING).toEqual({
      Bill: "right",
      Zoey: "left"
    });
    expect(PLAYER_SPRITESHEETS.Bill.animations.idle).toMatchObject({
      startFrame: 0,
      endFrame: 6,
      repeat: -1
    });
    expect(PLAYER_SPRITESHEETS.Bill.animations.walking).toMatchObject({
      startFrame: 7,
      endFrame: 13,
      frames: [7, 9, 10, 11, 12, 13],
      frameRate: 6,
      repeat: -1
    });
    expect(PLAYER_SPRITESHEETS.Zoey.animations.walking).toMatchObject({
      startFrame: 7,
      endFrame: 13,
      repeat: -1
    });
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

  it("only allows known enemy types in runtime level definitions", () => {
    expect(KNOWN_ENEMY_TYPES).toEqual(["common", "spitter"]);
    expect(isEnemyType("common")).toBe(true);
    expect(isEnemyType("spitter")).toBe(true);
    expect(isEnemyType("unknown")).toBe(false);
  });

  it("normalizes json level field names for runtime use", () => {
    expect(
      normalizeLevelDefinition("test_1", {
        name: "test 1",
        player_spawn_location: 25,
        enemies: [
          {
            type: "common",
            spawn_location: 125
          }
        ]
      })
    ).toEqual({
      key: "test_1",
      name: "test 1",
      playerSpawnLocation: 25,
      enemies: [
        {
          type: "common",
          spawnLocation: 125
        }
      ]
    });
  });

  it("rejects unknown enemy types in json level definitions", () => {
    expect(() =>
      normalizeLevelDefinition("bad_1", {
        name: "bad 1",
        player_spawn_location: 25,
        enemies: [
          {
            type: "unknown",
            spawn_location: 125
          }
        ]
      })
    ).toThrow(/unknown enemy type/i);
  });

  it("defines the alpha level entry point", () => {
    expect(ALPHA_LEVEL.name).toBe("alpha 1");
    expect(ALPHA_LEVEL.playerSpawnLocation).toBe(50);
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

  it("defines the spitter display size at 1.5x the previous runtime size", () => {
    expect(SPITTER_DISPLAY_SIZE).toEqual({
      width: 45,
      height: 69
    });
  });

  it("defines the spitter sprite sheet animation frames", () => {
    expect(SPITTER_SPRITESHEET.frameWidth).toBe(256);
    expect(SPITTER_SPRITESHEET.frameHeight).toBe(384);
    expect(SPITTER_SPRITESHEET.animations.idle).toMatchObject({
      startFrame: 0,
      endFrame: 6,
      repeat: -1
    });
    expect(SPITTER_SPRITESHEET.animations.spitting).toMatchObject({
      startFrame: 7,
      endFrame: 13,
      repeat: 0
    });
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

  it("defines the temporary pistol weapon sprite from the sniper art", () => {
    expect(PISTOL_WEAPON_SPRITE).toMatchObject({
      image: "sniper.png",
      width: 512,
      height: 128,
      defaultFacing: "left"
    });
    expect(PISTOL_WEAPON_SPRITE.muzzle.x).toBeLessThan(
      PISTOL_WEAPON_SPRITE.grip.x
    );
    expect(PISTOL_WEAPON_DISPLAY_SIZE).toEqual({ width: 72, height: 18 });
    expect(PISTOL_WEAPON_ARM_OFFSET).toEqual({ x: 15, y: 8 });
  });

  it("defines crosshair rendering constants", () => {
    expect(CROSSHAIR.size).toBeGreaterThan(0);
  });
});
