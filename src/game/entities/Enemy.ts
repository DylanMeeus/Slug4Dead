import type Phaser from "phaser";

export type DamageableEnemy = Phaser.Physics.Arcade.Sprite & {
  readonly damage: number;
  update: () => void;
  applyDamage: (damage: number) => number;
  getHealth: () => number;
};
