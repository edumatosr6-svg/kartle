// Deterministic arcade rewards, advanced on the same clock as the vehicle.
export type Maneuvers = {
  drifting: boolean; direction: number; charge: number; boost: number;
  boostTier: number; score: number; chain: number; chainWindow: number; awards: number;
};
export const initialManeuvers = (): Maneuvers => ({
  drifting: false, direction: 0, charge: 0, boost: 0,
  boostTier: 0, score: 0, chain: 0, chainWindow: 0, awards: 0,
});
export type ManeuverSample = {
  enabled: boolean; held: boolean; steer: number; throttle: number; brake: number;
  speed: number; slip: number; yaw: number; onRoad: boolean;
};
export const chargeTier = (charge: number) => charge >= 2.2 ? 3 : charge >= 1.3 ? 2 : charge >= 0.6 ? 1 : 0;

export function advanceManeuvers(previous: Maneuvers, sample: ManeuverSample, dt: number): Maneuvers {
  if (!sample.enabled) return initialManeuvers();
  const next = { ...previous, boost: Math.max(0, previous.boost - dt), chainWindow: Math.max(0, previous.chainWindow - dt) };
  if (next.chainWindow === 0) next.chain = 0;
  if (next.boost === 0) next.boostTier = 0;
  // Grass, braking and crawling cancel a pending reward, including on release.
  if (!sample.onRoad || sample.brake > 0.2 || sample.speed < 5 || Math.abs(sample.slip) > 0.65) {
    return { ...next, drifting: false, direction: 0, charge: 0, boost: 0, boostTier: 0, chain: 0, chainWindow: 0 };
  }
  if (!sample.held) {
    const tier = chargeTier(previous.charge);
    if (previous.drifting && tier > 0) {
      next.chain = Math.min(3, next.chain + 1);
      next.chainWindow = 5;
      next.score += tier * 100 * next.chain;
      next.awards++;
      next.boost = [0, 0.8, 1.3, 1.8][tier];
      next.boostTier = tier;
    }
    return { ...next, drifting: false, direction: 0, charge: 0 };
  }
  const direction = Math.sign(sample.steer);
  const validInput = Math.abs(sample.steer) >= 0.18 && sample.throttle > 0.15 && sample.speed >= 6;
  if (!validInput || (previous.drifting && direction !== previous.direction)) {
    return { ...next, drifting: false, direction: 0, charge: 0 };
  }
  next.drifting = true;
  next.direction = direction;
  // Holding the key on a straight does not charge: actual lateral motion is required.
  if (Math.abs(sample.slip) >= 0.055 && Math.abs(sample.yaw) >= 0.15) {
    next.charge = Math.min(3, next.charge + dt);
  }
  return next;
}

export function cancelManeuver(state: Maneuvers): Maneuvers {
  return { ...initialManeuvers(), score: state.score, awards: state.awards };
}
