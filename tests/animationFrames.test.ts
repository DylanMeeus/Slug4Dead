import { describe, expect, it } from "vitest";

import { buildInclusiveFrameSequence } from "../src/game/animationFrames";
import { PLAYER_SPRITESHEETS } from "../src/game/constants";

describe("animation frame sequences", () => {
  it("builds every frame in an inclusive forward range", () => {
    expect(
      buildInclusiveFrameSequence({
        startFrame: 7,
        endFrame: 13
      })
    ).toEqual([7, 8, 9, 10, 11, 12, 13]);
  });

  it("builds every frame in an inclusive reverse range", () => {
    expect(
      buildInclusiveFrameSequence({
        startFrame: 4,
        endFrame: 1
      })
    ).toEqual([4, 3, 2, 1]);
  });

  it("uses an explicit frame list when animation metadata provides one", () => {
    expect(
      buildInclusiveFrameSequence({
        startFrame: 7,
        endFrame: 13,
        frames: [7, 9, 10, 11, 12, 13]
      })
    ).toEqual([7, 9, 10, 11, 12, 13]);
  });

  it("skips Bill's duplicate-looking second walking frame", () => {
    expect(
      buildInclusiveFrameSequence(PLAYER_SPRITESHEETS.Bill.animations.walking)
    ).toEqual([7, 9, 10, 11, 12, 13]);
  });

  it("uses every generated walking frame for Zoey", () => {
    expect(
      buildInclusiveFrameSequence(PLAYER_SPRITESHEETS.Zoey.animations.walking)
    ).toEqual([7, 8, 9, 10, 11, 12, 13]);
  });
});
