import { describe, expect, it } from "vitest";

import {
  DEBUG_GAME_SPEED,
  NORMAL_GAME_SPEED,
  resolveArcadePhysicsTimeScale,
  resolveGameSpeed
} from "../src/game/debugMode";

describe("debug mode", () => {
  it("runs normal modes at full speed", () => {
    expect(resolveGameSpeed("development")).toBe(NORMAL_GAME_SPEED);
    expect(resolveGameSpeed("production")).toBe(NORMAL_GAME_SPEED);
    expect(resolveGameSpeed(undefined)).toBe(NORMAL_GAME_SPEED);
  });

  it("runs debug mode at quarter speed", () => {
    expect(resolveGameSpeed("debug")).toBe(DEBUG_GAME_SPEED);
    expect(DEBUG_GAME_SPEED).toBe(0.25);
  });

  it("uses the inverse time scale for Arcade physics fixed-step timing", () => {
    expect(resolveArcadePhysicsTimeScale(NORMAL_GAME_SPEED)).toBe(1);
    expect(resolveArcadePhysicsTimeScale(DEBUG_GAME_SPEED)).toBe(4);
  });
});
