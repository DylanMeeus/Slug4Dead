import Phaser from "phaser";

export const NORMAL_GAME_SPEED = 1;
export const DEBUG_GAME_SPEED = 0.25;

export function resolveGameSpeed(mode: string | undefined): number {
  return mode === "debug" ? DEBUG_GAME_SPEED : NORMAL_GAME_SPEED;
}

export function resolveArcadePhysicsTimeScale(gameSpeed: number): number {
  return 1 / gameSpeed;
}

export const GAME_SPEED = resolveGameSpeed(import.meta.env.MODE);
export const ARCADE_PHYSICS_TIME_SCALE =
  resolveArcadePhysicsTimeScale(GAME_SPEED);

export function applySceneGameSpeed(scene: Phaser.Scene): void {
  scene.time.timeScale = GAME_SPEED;

  if (scene.physics.world) {
    scene.physics.world.timeScale = ARCADE_PHYSICS_TIME_SCALE;
  }

  scene.anims.globalTimeScale = GAME_SPEED;
}
