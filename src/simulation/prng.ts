/**
 * Mulberry32 32-bit PRNG
 * Produces deterministic pseudo-random floats in [0, 1) from an integer seed.
 */
export function createPrng(initialSeed: number) {
  let s = Math.floor(Math.abs(initialSeed)) || 1337;

  return function next(): number {
    s |= 0;
    s = (s + 0x6d2b79f5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
