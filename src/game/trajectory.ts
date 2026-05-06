export type VelocityVector = {
  x: number;
  y: number;
  angle: number;
};

export function resolveVelocityVector(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  speedPixelsPerSecond: number
): VelocityVector {
  const deltaX = toX - fromX;
  const deltaY = toY - fromY;
  const magnitude = Math.hypot(deltaX, deltaY);

  if (magnitude === 0) {
    return {
      x: speedPixelsPerSecond,
      y: 0,
      angle: 0
    };
  }

  const normalizedX = deltaX / magnitude;
  const normalizedY = deltaY / magnitude;

  return {
    x: normalizedX * speedPixelsPerSecond,
    y: normalizedY * speedPixelsPerSecond,
    angle: Math.atan2(normalizedY, normalizedX)
  };
}
