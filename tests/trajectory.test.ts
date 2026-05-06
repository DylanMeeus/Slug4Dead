import { describe, expect, it } from "vitest";

import { resolveVelocityVector } from "../src/game/trajectory";

describe("resolveVelocityVector", () => {
  it("returns a normalized velocity toward the target", () => {
    const velocity = resolveVelocityVector(0, 0, 10, 0, 20);

    expect(velocity.x).toBe(20);
    expect(velocity.y).toBe(0);
    expect(velocity.angle).toBe(0);
  });

  it("returns a fallback horizontal velocity when origin and target match", () => {
    const velocity = resolveVelocityVector(5, 5, 5, 5, 30);

    expect(velocity.x).toBe(30);
    expect(velocity.y).toBe(0);
  });
});
