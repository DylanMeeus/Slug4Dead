declare class Buffer extends Uint8Array {
  public static alloc(size: number): Buffer;
  public static concat(chunks: Buffer[]): Buffer;
  public static from(chunk: Uint8Array): Buffer;
  public readUInt32BE(offset: number): number;
  public toString(): string;
  public toString(encoding: "ascii", start: number, end: number): string;
  public subarray(start: number, end: number): Buffer;
}

declare module "node:fs" {
  const fs: {
    readFileSync(path: string): Buffer;
  };

  export default fs;
}

declare module "node:zlib" {
  const zlib: {
    inflateSync(data: Buffer): Buffer;
  };

  export default zlib;
}
