// TEST-0013 — the simulation stays pure and offline; the result reaches no network (strategy: lap-layering, DES-0012, DES-0011).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
const SIMULATION = ['physics.ts', 'maneuvers.ts', 'track.ts', 'trackData.ts', 'lap.ts', 'lapTiming.ts'];
const APPLICATION_PURE = ['lapMessages.ts', 'frameClock.ts'];
const stripComments = (text: string) => text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '');
const code = (file: string) => stripComments(readFileSync(join(src, file), 'utf8'));
const imports = (text: string) => [...text.matchAll(/from\s+'([^']+)'/g)].map(m => m[1]);

const NETWORK_OR_STORAGE = ['fetch', 'XMLHttpRequest', 'WebSocket', 'localStorage', 'sessionStorage', 'indexedDB', 'navigator.sendBeacon'];
const DOM_CLOCK_RANDOM = ['document', 'window', 'Date', 'performance', 'Math.random', 'requestAnimationFrame', 'setTimeout', 'setInterval'];
const uses = (text: string, symbol: string) => new RegExp(`(^|[^\\w.$])${symbol.replace('.', '\\.')}(?![\\w$])`).test(text);

test('CHK-TEST-0013-01 the simulation modules import nothing from the renderer, the audio or the application', () => {
  // NFR-0004
  for (const file of [...SIMULATION, ...APPLICATION_PURE]) {
    for (const dep of imports(code(file))) {
      assert.ok(!/^three/.test(dep), `NFR-0004: ${file} must not import three (${dep})`);
      assert.ok(!/\.\/(audio|main)$/.test(dep), `NFR-0004: ${file} must not import an outer layer (${dep})`);
    }
  }
  for (const dep of imports(code('lapMessages.ts'))) assert.ok(/^\.\/lap$/.test(dep), `NFR-0004: lapMessages.ts may import only types from ./lap (${dep})`);
  assert.match(readFileSync(join(src, 'lapMessages.ts'), 'utf8'), /import type \{[^}]*\} from '\.\/lap'/, 'NFR-0004: lapMessages.ts must import ./lap as types only');
});

test('CHK-TEST-0013-02 the simulation never touches the DOM, the wall clock or an unseeded random', () => {
  // NFR-0001
  for (const file of SIMULATION) {
    const text = code(file);
    for (const symbol of DOM_CLOCK_RANDOM) assert.ok(!uses(text, symbol), `NFR-0001: ${file} must not use ${symbol}`);
  }
  for (const file of APPLICATION_PURE) {
    const text = code(file);
    for (const symbol of DOM_CLOCK_RANDOM) assert.ok(!uses(text, symbol), `NFR-0001: ${file} must not use ${symbol}`);
  }
});

test('CHK-TEST-0013-03 no module of the feature, the application included, uses the network or browser storage', () => {
  // NFR-0005
  for (const file of [...SIMULATION, ...APPLICATION_PURE, 'main.ts', 'frameClock.ts']) {
    const text = code(file);
    for (const symbol of NETWORK_OR_STORAGE) assert.ok(!uses(text, symbol), `NFR-0005: ${file} must not use ${symbol}`);
  }
});

test('CHK-TEST-0013-04 the application no longer decides lap validity with the retired gate tracker', () => {
  // NFR-0011
  const main = code('main.ts');
  assert.ok(!uses(main, 'LapTracker'), 'NFR-0011: main.ts must not import or use LapTracker');
  assert.ok(/from '\.\/lap'/.test(main), 'NFR-0011: main.ts must read the lap through src/lap.ts');
  assert.ok(!/invalidReason\s*[:=]\s*'(MISSED_MARKER|CUT|REPOSITION)'/.test(main), 'NFR-0011: main.ts must not decide an invalidation reason itself');
});
