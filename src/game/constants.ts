import alpha1Level from "./levels/alpha/alpha_1.json";
import alpha2Level from "./levels/alpha/alpha_2.json";
import billSpritesheet from "../../docs/art/players/bill/bill-spritesheet.json";
import spitterSpritesheet from "../../docs/art/enemies/spitter/spitter-spritesheet.json";
import sniperSprite from "../../docs/art/weapons/sniper/sniper.json";
import zoeySpritesheet from "../../docs/art/players/zoey/zoey-spritesheet.json";
import type { WeaponSpriteMetadata } from "./weaponPosition";

export const GAME_TITLE = "Slug4Dead";

export const LEVEL_WIDTH = 2000;
export const LEVEL_HEIGHT = 540;
export const FLOOR_HEIGHT = 96;
export const SAFE_ZONE_WIDTH = 72;

export const PLAYER_SIZE = {
  width: 28,
  height: 44
} as const;

export const PLAYER_DISPLAY_SIZE = {
  width: 64,
  height: 96
} as const;

export type HorizontalFacingDirection = "left" | "right";

export const PLAYER_SPRITESHEET_DEFAULT_FACING: Record<
  SpritesheetSurvivorName,
  HorizontalFacingDirection
> = {
  Bill: "right",
  Zoey: "left"
} as const;

export const PLAYER_CARD = {
  health: 100,
  velocity: 200
} as const;

export const PLAYER_MOVEMENT = {
  jumpVelocityPixelsPerSecond: 420,
  damageCooldownMs: 500
} as const;

export const SURVIVORS = ["Bill", "Louis", "Francis", "Zoey"] as const;

export type SurvivorName = (typeof SURVIVORS)[number];

export function isSurvivorName(name: string): name is SurvivorName {
  return SURVIVORS.some((survivor) => survivor === name);
}

export const PLAYER_SPRITESHEETS = {
  Bill: billSpritesheet,
  Zoey: zoeySpritesheet
} as const;

export type SpritesheetSurvivorName = keyof typeof PLAYER_SPRITESHEETS;

export function hasPlayerSpritesheet(
  survivorName: SurvivorName
): survivorName is SpritesheetSurvivorName {
  return Object.prototype.hasOwnProperty.call(
    PLAYER_SPRITESHEETS,
    survivorName
  );
}

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

export const SPITTER_DISPLAY_SIZE = {
  width: 45,
  height: 69
} as const;

export const SPITTER_INFECTED_PROJECTILE = {
  velocity: 300,
  minFireDelayMs: 1000,
  maxFireDelayMs: 3000
} as const;

export const SPITTER_SPRITESHEET = spitterSpritesheet;

export const PISTOL_CARD = {
  magSize: 15,
  reloadTimeMs: 2000,
  fireRatePerSecond: 10,
  damage: 2,
  velocity: 500
} as const;

export const PISTOL_WEAPON_SPRITE: WeaponSpriteMetadata & { image: string } = {
  ...sniperSprite,
  defaultFacing: sniperSprite.defaultFacing as HorizontalFacingDirection
};

export const PISTOL_WEAPON_DISPLAY_SIZE = {
  width: 96,
  height: 24
} as const;

export type WeaponArmRig = {
  armOffset: {
    x: number;
    y: number;
  };
  rearHand: {
    x: number;
    y: number;
  };
  frontHand: {
    x: number;
    y: number;
  };
  rearShoulderOffset: {
    x: number;
    y: number;
  };
  frontShoulderOffset: {
    x: number;
    y: number;
  };
  sleeveThickness: number;
  handRadius: number;
  sleeveColor: number;
  handColor: number;
};

const BASE_PISTOL_WEAPON_ARM_RIG = {
  rearHand: PISTOL_WEAPON_SPRITE.grip,
  frontHand: {
    x: 278,
    y: 84
  },
  sleeveThickness: 6,
  handRadius: 4
} as const;

export const PISTOL_WEAPON_ARM_RIGS: Record<SurvivorName, WeaponArmRig> = {
  Bill: {
    ...BASE_PISTOL_WEAPON_ARM_RIG,
    armOffset: {
      x: 8,
      y: 6
    },
    rearShoulderOffset: {
      x: 9,
      y: 1
    },
    frontShoulderOffset: {
      x: -1,
      y: 3
    },
    sleeveColor: 0x51623a,
    handColor: 0xc88a5a
  },
  Louis: {
    ...BASE_PISTOL_WEAPON_ARM_RIG,
    armOffset: {
      x: 8,
      y: 6
    },
    rearShoulderOffset: {
      x: 9,
      y: 1
    },
    frontShoulderOffset: {
      x: -1,
      y: 3
    },
    sleeveColor: 0x51623a,
    handColor: 0xc88a5a
  },
  Francis: {
    ...BASE_PISTOL_WEAPON_ARM_RIG,
    armOffset: {
      x: 8,
      y: 6
    },
    rearShoulderOffset: {
      x: 9,
      y: 1
    },
    frontShoulderOffset: {
      x: -1,
      y: 3
    },
    sleeveColor: 0x51623a,
    handColor: 0xc88a5a
  },
  Zoey: {
    ...BASE_PISTOL_WEAPON_ARM_RIG,
    armOffset: {
      x: 6,
      y: 5
    },
    rearShoulderOffset: {
      x: 7,
      y: 1
    },
    frontShoulderOffset: {
      x: -2,
      y: 2
    },
    sleeveColor: 0x8b2f31,
    handColor: 0xe2b596
  }
} as const;

export const CROSSHAIR = {
  size: 12,
  color: 0xfff5cf
} as const;

export type EnemyType =
  | typeof COMMON_INFECTED_STATS.name
  | typeof SPITTER_INFECTED_STATS.name;

export type LevelEnemyDefinition = {
  type: EnemyType;
  spawnLocation: number;
};

export type LevelDefinition = {
  key: string;
  name: string;
  playerSpawnLocation: number;
  enemies: LevelEnemyDefinition[];
};

export type CampaignDefinition = {
  key: string;
  label: string;
  levels: LevelDefinition[];
};

type RawLevelEnemyDefinition = {
  type: string;
  spawn_location: number;
};

type RawLevelDefinition = {
  name: string;
  player_spawn_location: number;
  enemies: RawLevelEnemyDefinition[];
};

export const KNOWN_ENEMY_TYPES = [
  COMMON_INFECTED_STATS.name,
  SPITTER_INFECTED_STATS.name
] as const;

export function isEnemyType(enemyType: string): enemyType is EnemyType {
  return KNOWN_ENEMY_TYPES.some((knownType) => knownType === enemyType);
}

export function normalizeLevelDefinition(
  key: string,
  rawLevel: RawLevelDefinition
): LevelDefinition {
  return {
    key,
    name: rawLevel.name,
    playerSpawnLocation: rawLevel.player_spawn_location,
    enemies: rawLevel.enemies.map((enemy) => {
      if (!isEnemyType(enemy.type)) {
        throw new Error(
          `Level "${rawLevel.name}" references unknown enemy type "${enemy.type}".`
        );
      }

      return {
        type: enemy.type,
        spawnLocation: enemy.spawn_location
      };
    })
  };
}

export const ALPHA_CAMPAIGN: CampaignDefinition = {
  key: "alpha",
  label: "alpha",
  levels: [
    normalizeLevelDefinition("alpha_1", alpha1Level),
    normalizeLevelDefinition("alpha_2", alpha2Level)
  ]
};

export const CAMPAIGNS: CampaignDefinition[] = [ALPHA_CAMPAIGN];

export const ALPHA_LEVEL = ALPHA_CAMPAIGN.levels[0];

export const SCENE_KEYS = {
  menu: "menu",
  alphaLevel: "alpha-level"
} as const;

export const GAMEPLAY_STATES = {
  preLevel: "pre-level",
  alive: "alive",
  dead: "dead",
  levelCompleted: "level_completed",
  paused: "paused"
} as const;

export type GameplayState =
  (typeof GAMEPLAY_STATES)[keyof typeof GAMEPLAY_STATES];
