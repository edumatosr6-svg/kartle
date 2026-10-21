// Offline control usability benchmark, NOT part of the playable client.
// Coarse binary inputs at 10 Hz simulate tapping keys with a simple look-ahead.
import { ARCADE_KART, initialState, LapTracker, nearest, STEP, step, track, WIDTH, type Input } from '../src/physics';

export function keyboardLap(assisted: boolean) {
  const config = { ...ARCADE_KART, drivingAssists: assisted };
  let state = initialState();
  const laps = new LapTracker();
  let input: Input = { throttle: 1, brake: 0, steer: 0 };
  let maxDistance = 0, offRoadTicks = 0, peakSlip = 0;
  for (let tick = 0; tick < 120 * 90; tick++) {
    const location = nearest(state);
    if (tick % 12 === 0) {
      const ahead = Math.max(3, Math.round(state.speed * 0.5));
      const target = track[(location.index + ahead) % track.length];
      const a = track[(location.index + 3) % track.length];
      const b = track[(location.index + 7) % track.length];
      const c = track[(location.index + 11) % track.length];
      const curvature = 2 * Math.abs((b.x - a.x) * (c.z - b.z) - (b.z - a.z) * (c.x - b.x))
        / (Math.hypot(b.x - a.x, b.z - a.z) * Math.hypot(c.x - b.x, c.z - b.z) * Math.hypot(c.x - a.x, c.z - a.z));
      const targetSpeed = Math.min(13, Math.sqrt(6 / Math.max(curvature, 0.001)));
      const desired = Math.atan2(target.x - state.x, target.z - state.z);
      const error = Math.atan2(Math.sin(desired - state.heading), Math.cos(desired - state.heading));
      input = {
        throttle: state.speed < targetSpeed ? 1 : 0,
        brake: state.speed > targetSpeed + 1 ? 1 : 0,
        steer: Math.abs(error) > 0.07 ? -Math.sign(error) : 0,
      };
    }
    state = step(state, input, STEP, config);
    const distance = nearest(state).distance;
    maxDistance = Math.max(maxDistance, distance);
    peakSlip = Math.max(peakSlip, Math.abs(state.telemetry.sideslip));
    if (distance > WIDTH / 2) offRoadTicks++;
    if (laps.update(nearest(state).index)) return {
      completed: true, seconds: (tick + 1) * STEP, maxDistance, peakSlip,
      offRoadFraction: offRoadTicks / (tick + 1),
    };
  }
  return { completed: false, seconds: 90, maxDistance, peakSlip, offRoadFraction: offRoadTicks / (120 * 90) };
}

const assisted = keyboardLap(true);
console.log({ assisted, previousArcade: keyboardLap(false) });
if (!assisted.completed || assisted.offRoadFraction > 0 || assisted.maxDistance > WIDTH / 2) {
  throw new Error('Assisted keyboard benchmark failed to complete a clean lap.');
}
