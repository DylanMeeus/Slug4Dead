import type { HorizontalFacingDirection } from "./constants";

export type Point = {
  x: number;
  y: number;
};

export type WeaponSpriteMetadata = {
  width: number;
  height: number;
  defaultFacing: HorizontalFacingDirection;
  muzzle: Point;
  grip: Point;
};

export type WeaponDisplaySize = {
  width: number;
  height: number;
};

export type WeaponRenderTransform = {
  x: number;
  y: number;
  rotation: number;
  flipX: boolean;
  facing: HorizontalFacingDirection;
  muzzle: Point;
};

export type SegmentTransform = {
  x: number;
  y: number;
  length: number;
  rotation: number;
};

export function resolveWeaponRenderTransform(
  player: Point,
  target: Point,
  metadata: WeaponSpriteMetadata,
  displaySize: WeaponDisplaySize,
  armOffset: Point
): WeaponRenderTransform {
  const facing: HorizontalFacingDirection =
    target.x < player.x ? "left" : "right";
  const flipX = facing !== metadata.defaultFacing;
  const gripWorld = {
    x: player.x + armOffset.x,
    y: player.y + armOffset.y
  };
  const muzzleOffset = resolveAnchorOffset(
    metadata.muzzle,
    metadata.grip,
    metadata,
    displaySize,
    flipX
  );
  const targetAngle = Math.atan2(target.y - gripWorld.y, target.x - gripWorld.x);
  const muzzleBaseAngle = Math.atan2(muzzleOffset.y, muzzleOffset.x);
  const rotation = targetAngle - muzzleBaseAngle;
  const rotatedMuzzleOffset = rotatePoint(muzzleOffset, rotation);

  return {
    x: gripWorld.x,
    y: gripWorld.y,
    rotation,
    flipX,
    facing,
    muzzle: {
      x: gripWorld.x + rotatedMuzzleOffset.x,
      y: gripWorld.y + rotatedMuzzleOffset.y
    }
  };
}

export function resolveWeaponAnchorWorldPoint(
  transform: Pick<WeaponRenderTransform, "x" | "y" | "rotation" | "flipX">,
  anchor: Point,
  metadata: WeaponSpriteMetadata,
  displaySize: WeaponDisplaySize
): Point {
  const anchorOffset = resolveAnchorOffset(
    anchor,
    metadata.grip,
    metadata,
    displaySize,
    transform.flipX
  );
  const rotatedAnchorOffset = rotatePoint(anchorOffset, transform.rotation);

  return {
    x: transform.x + rotatedAnchorOffset.x,
    y: transform.y + rotatedAnchorOffset.y
  };
}

export function resolveSegmentTransform(
  start: Point,
  end: Point
): SegmentTransform {
  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  return {
    x: start.x,
    y: start.y,
    length: Math.hypot(deltaX, deltaY),
    rotation: Math.atan2(deltaY, deltaX)
  };
}

function resolveAnchorOffset(
  point: Point,
  origin: Point,
  metadata: WeaponSpriteMetadata,
  displaySize: WeaponDisplaySize,
  flipX: boolean
): Point {
  const scaleX = displaySize.width / metadata.width;
  const scaleY = displaySize.height / metadata.height;
  const offsetX = (point.x - origin.x) * scaleX;

  return {
    x: flipX ? -offsetX : offsetX,
    y: (point.y - origin.y) * scaleY
  };
}

function rotatePoint(point: Point, radians: number): Point {
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: point.x * cos - point.y * sin,
    y: point.x * sin + point.y * cos
  };
}
