export type AnimationFrameRange = {
  startFrame: number;
  endFrame: number;
};

export function buildInclusiveFrameSequence(
  range: AnimationFrameRange
): number[] {
  const step = range.startFrame <= range.endFrame ? 1 : -1;
  const frames: number[] = [];

  for (
    let frame = range.startFrame;
    step > 0 ? frame <= range.endFrame : frame >= range.endFrame;
    frame += step
  ) {
    frames.push(frame);
  }

  return frames;
}
