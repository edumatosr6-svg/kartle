// Seeded linear congruential generator (DES-0012): repeatable Input sequences, never Math.random.
import type { Input } from '../../src/physics';

export class Seeded {
  private state: number;
  constructor(seed: number) { this.state = seed >>> 0; }
  // Numerical Recipes LCG on 32 bits; returns a float in [0, 1).
  next(): number {
    this.state = (Math.imul(this.state, 1664525) + 1013904223) >>> 0;
    return this.state / 4294967296;
  }
  // A random but repeatable Input, biased towards driving forward.
  input(): Input {
    const r = this.next();
    return { throttle: r < 0.7 ? 1 : 0, brake: r > 0.9 ? 1 : 0, steer: Math.round((this.next() * 2 - 1) * 10) / 10 };
  }
}
