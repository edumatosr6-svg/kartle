// Application layer: converts frame time into a number of fixed steps (DES-0007).
// Wall time decides only how many steps run in a frame; the lap result depends on the step sequence alone.
import { STEP } from './physics';

export const MAX_FRAME_S = 0.1;

export function advanceClock(accumulatorS: number, frameDtS: number): { steps: number; accumulatorS: number } {
  let accumulator = accumulatorS + Math.min(frameDtS, MAX_FRAME_S);
  let steps = 0;
  while (accumulator >= STEP) { accumulator -= STEP; steps++; }
  return { steps, accumulatorS: accumulator };
}
