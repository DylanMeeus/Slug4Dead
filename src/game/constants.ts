export const GAME_TITLE = "Slug4Dead";

export const LEVEL_WIDTH = 1000;
export const LEVEL_HEIGHT = 540;
export const FLOOR_HEIGHT = 96;

export const PLAYER_SIZE = {
  width: 28,
  height: 44
} as const;

export const PLAYER_MOVEMENT = {
  speed: 220,
  jumpVelocity: 420
} as const;

export const COMMON_INFECTED_STATS = {
  health: 10,
  damage: 1
} as const;

export const ALPHA_LEVEL = {
  key: "alpha-level",
  label: "Alpha Test Ground"
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
