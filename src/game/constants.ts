export const GAME_TITLE = "Slug4Dead";

export const LEVEL_WIDTH = 2000;
export const LEVEL_HEIGHT = 540;
export const FLOOR_HEIGHT = 96;
export const SAFE_ZONE_WIDTH = 72;

export const PLAYER_SIZE = {
  width: 28,
  height: 44
} as const;

export const PLAYER_CARD = {
  health: 100,
  velocity: 200
} as const;

export const PLAYER_MOVEMENT = {
  jumpVelocityPixelsPerSecond: 420,
  damageCooldownMs: 500
} as const;

export const COMMON_INFECTED_STATS = {
  name: "common",
  health: 10,
  damage: 25,
  velocity: 100
} as const;

export const COMMON_INFECTED_MOVEMENT = {
  speedPixelsPerSecond: COMMON_INFECTED_STATS.velocity,
  minPatrolDistance: 120,
  maxPatrolDistance: 300
} as const;

export const SPITTER_INFECTED_STATS = {
  name: "spitter",
  health: 20,
  damage: 50,
  velocity: 150
} as const;

export const SPITTER_INFECTED_PROJECTILE = {
  velocity: 300,
  minFireDelayMs: 1000,
  maxFireDelayMs: 3000
} as const;

export const PISTOL_CARD = {
  magSize: 15,
  reloadTimeMs: 2000,
  fireRatePerSecond: 10,
  damage: 2,
  velocity: 500
} as const;

export const CROSSHAIR = {
  size: 12,
  color: 0xfff5cf
} as const;

export const ALPHA_LEVEL = {
  key: "alpha-level",
  label: "Alpha Test Ground",
  playerSpawnLocation: 50,
  enemies: [
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
  ]
} as const;

export const SCENE_KEYS = {
  menu: "menu",
  alphaLevel: "alpha-level"
} as const;

export const GAMEPLAY_STATES = {
  preLevel: "pre-level",
  alive: "alive",
  dead: "dead",
  paused: "paused"
} as const;

export type GameplayState =
  (typeof GAMEPLAY_STATES)[keyof typeof GAMEPLAY_STATES];
