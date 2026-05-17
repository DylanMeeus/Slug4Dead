import fs from "node:fs";
import zlib from "node:zlib";

import { describe, expect, it } from "vitest";

type DecodedPng = {
  width: number;
  height: number;
  pixels: Buffer;
};

function decodeRgbaPng(path: string): DecodedPng {
  const data = fs.readFileSync(path);
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatChunks: Buffer[] = [];

  while (offset < data.length) {
    const length = data.readUInt32BE(offset);
    offset += 4;
    const type = data.toString("ascii", offset, offset + 4);
    offset += 4;
    const chunk = data.subarray(offset, offset + length);
    offset += length + 4;

    if (type === "IHDR") {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      bitDepth = chunk[8];
      colorType = chunk[9];
    } else if (type === "IDAT") {
      idatChunks.push(Buffer.from(chunk));
    } else if (type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || colorType !== 6) {
    throw new Error(`Unsupported PNG format: ${bitDepth}/${colorType}`);
  }

  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bytesPerPixel = 4;
  const stride = width * bytesPerPixel;
  const pixels = Buffer.alloc(height * stride);
  let readOffset = 0;

  for (let y = 0; y < height; y += 1) {
    const filter = raw[readOffset];
    readOffset += 1;

    for (let x = 0; x < stride; x += 1) {
      const value = raw[readOffset];
      readOffset += 1;
      const left = x >= bytesPerPixel ? pixels[y * stride + x - bytesPerPixel] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upperLeft =
        y > 0 && x >= bytesPerPixel
          ? pixels[(y - 1) * stride + x - bytesPerPixel]
          : 0;

      if (filter === 0) {
        pixels[y * stride + x] = value;
      } else if (filter === 1) {
        pixels[y * stride + x] = (value + left) & 255;
      } else if (filter === 2) {
        pixels[y * stride + x] = (value + up) & 255;
      } else if (filter === 3) {
        pixels[y * stride + x] = (value + Math.floor((left + up) / 2)) & 255;
      } else if (filter === 4) {
        const estimate = left + up - upperLeft;
        const leftDistance = Math.abs(estimate - left);
        const upDistance = Math.abs(estimate - up);
        const upperLeftDistance = Math.abs(estimate - upperLeft);
        const predictor =
          leftDistance <= upDistance && leftDistance <= upperLeftDistance
            ? left
            : upDistance <= upperLeftDistance
              ? up
              : upperLeft;

        pixels[y * stride + x] = (value + predictor) & 255;
      } else {
        throw new Error(`Unsupported PNG filter: ${filter}`);
      }
    }
  }

  return { width, height, pixels };
}

function getFrameAlphaBounds(
  png: DecodedPng,
  frame: number,
  frameWidth: number,
  frameHeight: number,
  yStart = 0,
  yEnd = frameHeight
): { minX: number; maxX: number } {
  const column = frame % 7;
  const row = Math.floor(frame / 7);
  let minX = frameWidth;
  let maxX = -1;

  for (let y = yStart; y < yEnd; y += 1) {
    for (let x = 0; x < frameWidth; x += 1) {
      const alphaOffset =
        ((row * frameHeight + y) * png.width + column * frameWidth + x) * 4 + 3;

      if (png.pixels[alphaOffset] === 0) {
        continue;
      }

      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
    }
  }

  return { minX, maxX };
}

function countOpaquePixelsInFrameRegion(
  png: DecodedPng,
  frame: number,
  frameWidth: number,
  frameHeight: number,
  region: { x: number; y: number; width: number; height: number }
): number {
  const column = frame % 7;
  const row = Math.floor(frame / 7);
  let opaquePixels = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const alphaOffset =
        ((row * frameHeight + y) * png.width + column * frameWidth + x) * 4 + 3;

      if (png.pixels[alphaOffset] !== 0) {
        opaquePixels += 1;
      }
    }
  }

  return opaquePixels;
}

function countPixelsMatchingInFrameRegion(
  png: DecodedPng,
  frame: number,
  frameWidth: number,
  frameHeight: number,
  region: { x: number; y: number; width: number; height: number },
  predicate: (red: number, green: number, blue: number, alpha: number) => boolean
): number {
  const column = frame % 7;
  const row = Math.floor(frame / 7);
  let matchingPixels = 0;

  for (let y = region.y; y < region.y + region.height; y += 1) {
    for (let x = region.x; x < region.x + region.width; x += 1) {
      const offset =
        ((row * frameHeight + y) * png.width + column * frameWidth + x) * 4;

      if (
        predicate(
          png.pixels[offset],
          png.pixels[offset + 1],
          png.pixels[offset + 2],
          png.pixels[offset + 3]
        )
      ) {
        matchingPixels += 1;
      }
    }
  }

  return matchingPixels;
}

function isChromaKeyGreen(red: number, green: number, blue: number): boolean {
  return (
    green > 125 &&
    red < 100 &&
    blue < 120 &&
    green > red * 1.45 &&
    green > blue * 1.45
  );
}

function isBillSkinTone(
  red: number,
  green: number,
  blue: number,
  alpha: number
): boolean {
  return (
    alpha > 0 &&
    red > 130 &&
    green > 70 &&
    green < 190 &&
    blue < 130 &&
    red > green * 1.15 &&
    green > blue * 1.1
  );
}

describe("player spritesheets", () => {
  it("keeps Bill idle and running frames centered in their cells", () => {
    const frameWidth = 256;
    const frameHeight = 384;
    const billSpritesheet = decodeRgbaPng(
      "docs/art/players/bill/bill-spritesheet.png"
    );

    for (const frame of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
      const bounds = getFrameAlphaBounds(
        billSpritesheet,
        frame,
        frameWidth,
        frameHeight
      );
      const center = (bounds.minX + bounds.maxX + 1) / 2;

      expect(bounds.minX).toBeGreaterThanOrEqual(35);
      expect(bounds.maxX).toBeLessThanOrEqual(221);
      expect(center).toBeGreaterThanOrEqual(127);
      expect(center).toBeLessThanOrEqual(139);
    }
  });

  it("renders Bill's body without chroma-key residue or visible hands", () => {
    const frameWidth = 256;
    const frameHeight = 384;
    const billSpritesheet = decodeRgbaPng(
      "docs/art/players/bill/bill-spritesheet.png"
    );

    for (const frame of [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]) {
      const torsoPixels = countOpaquePixelsInFrameRegion(
        billSpritesheet,
        frame,
        frameWidth,
        frameHeight,
        { x: 94, y: 145, width: 71, height: 121 }
      );
      const leftFistPixels = countPixelsMatchingInFrameRegion(
        billSpritesheet,
        frame,
        frameWidth,
        frameHeight,
        { x: 45, y: 205, width: 40, height: 60 },
        isBillSkinTone
      );
      const rightFistPixels = countPixelsMatchingInFrameRegion(
        billSpritesheet,
        frame,
        frameWidth,
        frameHeight,
        { x: 172, y: 205, width: 40, height: 60 },
        isBillSkinTone
      );
      const greenPixels = countPixelsMatchingInFrameRegion(
        billSpritesheet,
        frame,
        frameWidth,
        frameHeight,
        { x: 0, y: 0, width: frameWidth, height: frameHeight },
        (red, green, blue, alpha) =>
          alpha > 0 && isChromaKeyGreen(red, green, blue)
      );

      expect(torsoPixels).toBeGreaterThan(7300);
      expect(leftFistPixels).toBe(0);
      expect(rightFistPixels).toBeLessThanOrEqual(10);
      expect(greenPixels).toBe(0);
    }
  });

  it("keeps Bill running feet clear of horizontal frame clipping", () => {
    const frameWidth = 256;
    const frameHeight = 384;
    const billSpritesheet = decodeRgbaPng(
      "docs/art/players/bill/bill-spritesheet.png"
    );

    for (const frame of [7, 8, 9, 10, 11, 12, 13]) {
      const bounds = getFrameAlphaBounds(
        billSpritesheet,
        frame,
        frameWidth,
        frameHeight,
        320
      );

      expect(bounds.minX).toBeGreaterThanOrEqual(35);
      expect(bounds.maxX).toBeLessThanOrEqual(221);
    }
  });

  it("provides a transparent Bill sniper arms overlay with expected anchors", () => {
    const overlay = decodeRgbaPng(
      "docs/art/players/bill/bill-sniper-arms.png"
    );
    const metadata = JSON.parse(
      fs
        .readFileSync("docs/art/players/bill/bill-sniper-arms.json")
        .toString()
    ) as {
      width: number;
      height: number;
      defaultFacing: string;
      muzzle: { x: number; y: number };
      grip: { x: number; y: number };
    };

    expect(metadata.width).toBe(overlay.width);
    expect(metadata.height).toBe(overlay.height);
    expect(metadata.defaultFacing).toBe("left");
    expect(metadata.muzzle.x).toBeLessThan(metadata.grip.x);
    expect(metadata.grip.x).toBeGreaterThan(metadata.width / 2);

    for (const [x, y] of [
      [0, 0],
      [overlay.width - 1, 0],
      [0, overlay.height - 1],
      [overlay.width - 1, overlay.height - 1]
    ]) {
      const alphaOffset = (y * overlay.width + x) * 4 + 3;

      expect(overlay.pixels[alphaOffset]).toBe(0);
    }
  });
});
