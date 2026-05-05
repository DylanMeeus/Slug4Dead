import { describe, expect, it } from "vitest";

import { GAME_TITLE, HELLO_WORLD_LABEL } from "../src/game/constants";

describe("initial scaffold copy", () => {
  it("exposes the game title", () => {
    expect(GAME_TITLE).toBe("Slug4Dead");
  });

  it("exposes the hello world label", () => {
    expect(HELLO_WORLD_LABEL).toBe("Hello World");
  });
});
