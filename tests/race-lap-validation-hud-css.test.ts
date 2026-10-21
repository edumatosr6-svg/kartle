// TEST-0011 — size and contrast tokens of the lap HUD, read from src/style.css (strategy: lap-hud-css, unit, DES-0008).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const css = readFileSync(join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'style.css'), 'utf8');

function token(name: string): string {
  const m = css.match(new RegExp(`--${name}\\s*:\\s*([^;}]+)`));
  if (!m) throw new Error(`token --${name} not found in src/style.css`);
  return m[1].trim();
}
const px = (value: string): number => {
  const m = value.match(/^(\d+(?:\.\d+)?)px$/);
  if (!m) throw new Error(`${value} is not a px value`);
  return Number(m[1]);
};
// WCAG 2.x relative luminance and contrast ratio.
function luminance(hex: string): number {
  const m = hex.match(/^#([0-9a-f]{6})$/i);
  if (!m) throw new Error(`${hex} is not a 6-digit hex colour`);
  const channel = (i: number) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
}
function contrast(a: string, b: string): number {
  const la = luminance(a), lb = luminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}
const rule = (selector: string): string => {
  const m = css.match(new RegExp(`${selector.replace(/[#.]/g, '\\$&')}\\s*\\{([^}]*)\\}`));
  if (!m) throw new Error(`rule ${selector} not found in src/style.css`);
  return m[1];
};

test('CHK-TEST-0011-01 the countdown numeral and green signal have a minimum size of 48 px', () => {
  // AC-US-0001-09
  assert.ok(px(token('lap-countdown-size')) >= 48, `AC-US-0001-09: --lap-countdown-size is ${token('lap-countdown-size')}, expected at least 48px`);
  assert.match(rule('#lap-countdown'), /font-size:\s*max\(var\(--lap-countdown-size\)/, 'AC-US-0001-09: #lap-countdown must use the token as a floor through max()');
});

test('CHK-TEST-0011-02 the countdown text has a contrast of at least 4.5:1 with its own background', () => {
  // AC-US-0001-10
  const ratio = contrast(token('lap-text'), token('lap-chip-bg'));
  assert.ok(ratio >= 4.5, `AC-US-0001-10: contrast of --lap-text over --lap-chip-bg is ${ratio.toFixed(2)}, expected at least 4.5`);
  assert.match(rule('#lap-countdown'), /padding/, 'AC-US-0001-10: the countdown must sit on its own padded chip so the background is determinate');
});

test('CHK-TEST-0011-03 the state and reason texts have a contrast of at least 4.5:1 on both the valid and the invalid chip', () => {
  // AC-US-0009-08
  for (const bg of ['lap-chip-bg', 'lap-chip-invalid-bg']) {
    const ratio = contrast(token('lap-text'), token(bg));
    assert.ok(ratio >= 4.5, `AC-US-0009-08: contrast of --lap-text over --${bg} is ${ratio.toFixed(2)}, expected at least 4.5`);
  }
  assert.match(rule('.lap-chip'), /background:\s*var\(--lap-chip-bg\)/, 'AC-US-0009-08: the chip must use the opaque background token');
});

test('CHK-TEST-0011-04 the state and reason texts have a minimum size of 16 px', () => {
  // AC-US-0009-09
  assert.ok(px(token('lap-state-size')) >= 16, `AC-US-0009-09: --lap-state-size is ${token('lap-state-size')}, expected at least 16px`);
  assert.match(rule('.lap-chip'), /font-size:\s*max\(var\(--lap-state-size\)/, 'AC-US-0009-09: .lap-chip must use the token as a floor through max()');
});
