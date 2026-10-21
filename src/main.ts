import * as THREE from 'three';
import { initialState, KART_PRESETS, nearest, ARCADE_KART, track, WIDTH, wheelPositions } from './physics';
import { chargeTier } from './maneuvers';
import { RaceAudio } from './audio';
import { SYNTHETIC_TRACK_FILE } from './track';
import { readTrackData, type TrackReading } from './trackData';
import { getLapResult, getLapState, offeredLapKinds, pauseLap, repositionKart, resumeLap, startLap, stepLap, type LapKind, type LapSession } from './lap';
import { advanceClock } from './frameClock';
import { describeLap, formatLapTime, greenSignalVisible, message, resolveLanguage, type Language, type MessageKey } from './lapMessages';
import './style.css';

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
const host = $('scene');
const scene = new THREE.Scene();
scene.background = new THREE.Color('#607e59');
scene.fog = new THREE.Fog('#607e59', 160, 350);
const camera = new THREE.PerspectiveCamera(48, 1, 0.1, 500);
let renderer: THREE.WebGLRenderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true });
} catch {
  $('welcome').innerHTML = '<h2>Não foi possível abrir o jogo.</h2><p>Seu navegador precisa de WebGL. Tente ativar a aceleração gráfica.</p>';
  throw new Error('WebGL unavailable');
}
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);
scene.add(new THREE.HemisphereLight('#fff9dc', '#35543e', 2.5));
const sun = new THREE.DirectionalLight('#fff0cc', 3);
sun.position.set(45, 100, 60);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -120, right: 120, top: 100, bottom: -100 });
sun.shadow.bias = -0.001;
scene.add(sun);

const material = (color: string) => new THREE.MeshStandardMaterial({ color, roughness: 0.9 });
const ground = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), material('#68865b'));
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

function ribbon(inner: number, outer: number, color: string, y: number) {
  const vertices: number[] = [];
  const indices: number[] = [];
  for (let i = 0; i <= track.length; i++) {
    const p = track[i % track.length];
    const a = track[(i + track.length - 1) % track.length], b = track[(i + 1) % track.length];
    const dx = b.x - a.x, dz = b.z - a.z, length = Math.hypot(dx, dz);
    for (const width of [inner, outer]) vertices.push(p.x + dz / length * width, y, p.z - dx / length * width);
    if (i < track.length) { const k = i * 2; indices.push(k, k + 2, k + 1, k + 1, k + 2, k + 3); }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  const mat = material(color);
  mat.side = THREE.DoubleSide;
  const mesh = new THREE.Mesh(geometry, mat);
  mesh.receiveShadow = true;
  scene.add(mesh);
}
ribbon(-WIDTH / 2 - 1, WIDTH / 2 + 1, '#e8e2cb', 0.015);
ribbon(-WIDTH / 2, WIDTH / 2, '#434d48', 0.03);

const boxGeo = new THREE.BoxGeometry(1, 1, 1);
function box(parent: THREE.Object3D, size: number[], position: number[], color: string) {
  const mesh = new THREE.Mesh(boxGeo, material(color));
  mesh.scale.set(size[0], size[1], size[2]);
  mesh.position.set(position[0], position[1], position[2]);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
for (let i = 0; i < track.length; i++) {
  const p = track[i], b = track[(i + 1) % track.length];
  const angle = Math.atan2(b.x - p.x, b.z - p.z);
  if (i % 2 === 0) {
    for (const side of [-1, 1]) {
      const curb = box(scene, [0.85, 0.12, Math.hypot(b.x - p.x, b.z - p.z) * 1.8], [p.x + Math.cos(angle) * side * 5.9, 0.07, p.z - Math.sin(angle) * side * 5.9], i % 4 === 0 ? '#e39173' : '#f0e9d5');
      curb.rotation.y = angle;
    }
  }
  if (i % 4 === 0) {
    const barrier = box(scene, [1.1, 0.8, 2.6], [p.x + Math.cos(angle) * 14.1, 0.4, p.z - Math.sin(angle) * 14.1], i % 8 ? '#e6dfc9' : '#3e594b');
    barrier.rotation.y = angle;
  }
}
const start = initialState();
const line = new THREE.Group();
line.position.set(start.x, 0.055, start.z);
line.rotation.y = start.heading;
for (let x = 0; x < 10; x++) for (let z = 0; z < 2; z++) box(line, [1.1, 0.02, 0.7], [(x - 4.5) * 1.1, 0, z * 0.7], (x + z) % 2 ? '#eff0df' : '#25362f');
scene.add(line);

// Deterministic scenery placement, clear of the driveable course.
for (let i = 0; i < 90; i++) {
  const x = Math.sin(i * 127.1) * 130, z = Math.cos(i * 71.7) * 100;
  if (nearest({ x, z }).distance < 21 || Math.hypot(x, z) < 22) continue;
  const tree = new THREE.Group();
  tree.position.set(x, 0, z);
  box(tree, [0.55, 3, 0.55], [0, 1.5, 0], '#76674a');
  const crown = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + i % 3, 0), material(i % 2 ? '#46694d' : '#879c5b'));
  crown.position.y = 5;
  crown.castShadow = true;
  tree.add(crown);
  scene.add(tree);
}
const kart = new THREE.Group();
box(kart, [1.3, 0.35, 2.15], [0, 0.45, 0], '#e7a056');
box(kart, [1.45, 0.25, 0.55], [0, 0.45, 1.1], '#edb45f');
box(kart, [0.75, 0.5, 0.7], [0, 0.8, -0.25], '#243e35');
const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.36, 12, 8), material('#f1e7ca'));
helmet.position.set(0, 1.2, -0.1);
kart.add(helmet);
box(kart, [0.53, 0.14, 0.15], [0, 1.22, 0.2], '#263d36');
const wheels: { pivot: THREE.Group; mesh: THREE.Mesh }[] = [];
for (const position of wheelPositions(ARCADE_KART)) {
  const pivot = new THREE.Group();
  pivot.position.set(position.left, 0.31, position.forward);
  const wheel = new THREE.Mesh(new THREE.CylinderGeometry(0.31, 0.31, 0.28, 12), material('#202b28'));
  wheel.rotation.z = Math.PI / 2;
  wheel.castShadow = true;
  pivot.add(wheel);
  kart.add(pivot);
  wheels.push({ pivot, mesh: wheel });
}
scene.add(kart);

const skidMarks = new THREE.InstancedMesh(new THREE.BoxGeometry(0.19, 0.012, 1), new THREE.MeshBasicMaterial({ color: '#202b28', transparent: true, opacity: 0.38 }), 320);
skidMarks.count = 0;
skidMarks.frustumCulled = false;
scene.add(skidMarks);
const skidTransform = new THREE.Object3D();
let skidIndex = 0, skidClock = 0;
let previousSkids: THREE.Vector3[] = [];
const exhaust = new THREE.Group();
for (const x of [-0.37, 0.37]) {
  const jet = new THREE.Mesh(new THREE.ConeGeometry(0.18, 1.2, 8), new THREE.MeshBasicMaterial({ color: '#a5faff', transparent: true, opacity: 0.9 }));
  jet.rotation.x = -Math.PI / 2;
  jet.position.set(x, 0.4, -1.35);
  exhaust.add(jet);
}
exhaust.visible = false;
kart.add(exhaust);
const audio = new RaceAudio();
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Lap state: the simulation (src/lap.ts) is the single source; this layer only forwards commands and reads views.
const idleKart = initialState();
let lap: LapSession | undefined;
let config = { ...ARCADE_KART };
const reading: TrackReading = readTrackData(SYNTHETIC_TRACK_FILE);
if (reading.trackDataStatus === 'UNREADABLE') console.warn('track-data', 'UNREADABLE');
else if (reading.trackDataStatus === 'UNSUPPORTED_SCHEMA') console.warn('track-data', 'UNSUPPORTED_SCHEMA', reading.schemaVersion);
else if (reading.trackDataStatus === 'INCOMPLETE') console.warn('track-data', 'INCOMPLETE', reading.trackId, reading.trackVersion);
let started = false, best = Infinity, accumulatorS = 0, last = performance.now();
const keys = new Set<string>();
const touch = new Set<string>();
let tilt = false, neutral: number | null = null, tiltSteer = 0;
// Wall clock of the adapter only: decides when to emit SENSOR_LOST, never the lap time (ADR-0005).
const SENSOR_SILENCE_MS = 500;
let lastOrientationAtMs = performance.now();
const coarsePointer = matchMedia('(pointer: coarse)');
let touchFallback = false;
let notificationUntil = 0;
let lang: Language = resolveLanguage(navigator.language);
const phase = () => lap?.phase;
const lapActive = () => { const p = phase(); return p === 'COUNTDOWN' || p === 'RUNNING' || p === 'PAUSED'; };
function notify(text: string, duration = 3500) { $('message').textContent = text; notificationUntil = performance.now() + duration; }
function emitPause(cause: 'ESC_KEY' | 'FOCUS_LOST' | 'SENSOR_LOST') {
  const r = pauseLap(lap, cause);
  if (!r.ok) return;
  lap = r.lap; keys.clear(); touch.clear(); accumulatorS = 0;
}
function emitResume() {
  const r = resumeLap(lap);
  if (!r.ok) return;
  lap = r.lap; accumulatorS = 0; lastOrientationAtMs = performance.now();
}
function emitReposition() {
  const r = repositionKart(lap);
  if (r.ok) lap = r.lap;
}
const OFFER_KEY: Record<LapKind, MessageKey> = { TRAINING: 'startTraining', OFFICIAL: 'startOfficial', RECON: 'startRecon' };
let offerLang: Language | undefined;
function renderOffer() {
  if (offerLang === lang) return;
  offerLang = lang;
  const status = $('track-status');
  const offer = $('lap-offer');
  offer.replaceChildren();
  if (reading.trackDataStatus === 'UNREADABLE' || reading.trackDataStatus === 'UNSUPPORTED_SCHEMA') {
    status.textContent = message('trackDataError', lang);
    return;
  }
  status.textContent = reading.trackId;
  for (const kind of offeredLapKinds(reading, [])) {
    const button = document.createElement('button');
    button.className = 'primary';
    button.textContent = message(OFFER_KEY[kind], lang);
    button.onclick = () => beginLap(kind);
    offer.appendChild(button);
  }
}
function beginLap(kind: LapKind) {
  if (reading.trackDataStatus !== 'COMPLETE' && reading.trackDataStatus !== 'INCOMPLETE') return;
  const r = startLap(lap, { lapKind: kind, trackId: reading.trackId, trackVersion: reading.trackVersion }, reading, config);
  if (!r.ok) return;
  lap = r.lap; started = true; accumulatorS = 0; keys.clear(); touch.clear();
  touchFallback = coarsePointer.matches && !tilt;
  skidMarks.count = 0; skidIndex = 0; previousSkids = []; skidClock = 0;
  resultLang = undefined; lastPhase = undefined;
  $('welcome').classList.add('hidden');
  $('lap-result').classList.add('hidden');
}
$('driver-mass').oninput = e => {
  const mass = Number((e.target as HTMLInputElement).value);
  $('mass-value').textContent = `${mass} kg`;
  $('total-mass').textContent = `${mass + config.kartMass} kg`;
};
$('driver-mass').onchange = e => {
  config = { ...config, driverMass: Number((e.target as HTMLInputElement).value) };
  best = Infinity; $('best').textContent = '—';
  notify('Peso atualizado. Vale na próxima volta.');
};
$('handling-preset').onchange = e => {
  const preset = (e.target as HTMLSelectElement).value as keyof typeof KART_PRESETS;
  if (!(preset in KART_PRESETS)) return;
  config = { ...KART_PRESETS[preset], driverMass: config.driverMass };
  best = Infinity; $('best').textContent = '—';
  $('preset-label').textContent = preset === 'arcade' ? 'ARCADE ASSISTIDO · TREINO LIVRE' : 'ALUGUEL 4T · TREINO LIVRE';
  $('assist-description').textContent = preset === 'arcade'
    ? 'Direção progressiva, freio equilibrado e ajuda para conter rodadas. Você escolhe a trajetória.'
    : 'Sem assistências de direção ou estabilidade. Frenagem traseira e maior exigência nas curvas.';
  notify(`${preset === 'arcade' ? 'Arcade' : 'Realista'} selecionado. Vale na próxima volta.`);
};
$('sound').onclick = async () => {
  try {
    const enabled = await audio.toggle();
    $('sound').textContent = enabled ? 'Som ligado' : 'Som desligado';
    $('sound').setAttribute('aria-pressed', String(enabled));
  } catch { notify('Áudio indisponível neste navegador.'); }
};
$('reset').onclick = emitReposition;
$('pause').onclick = emitResume;
$('lap-new-lap').onclick = () => { $('lap-result').classList.add('hidden'); $('welcome').classList.remove('hidden'); };
document.addEventListener('keydown', e => {
  if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement || e.target instanceof HTMLTextAreaElement || (e.target instanceof HTMLElement && e.target.isContentEditable)) return;
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  keys.add(e.key.toLowerCase());
  if (!e.repeat && e.key.toLowerCase() === 'r') emitReposition();
  if (!e.repeat && e.key === 'Escape') { if (phase() === 'PAUSED') emitResume(); else emitPause('ESC_KEY'); }
});
document.addEventListener('keyup', e => keys.delete(e.key.toLowerCase()));
// Losing focus pauses; regaining it never resumes (RULE-0002).
window.addEventListener('blur', () => { keys.clear(); touch.clear(); emitPause('FOCUS_LOST'); });
document.addEventListener('visibilitychange', () => { if (document.hidden) emitPause('FOCUS_LOST'); });
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-control]')) {
  const control = button.dataset.control!;
  button.onpointerdown = e => { e.preventDefault(); button.setPointerCapture(e.pointerId); touch.add(control); };
  button.onpointerup = button.onpointercancel = button.onlostpointercapture = () => touch.delete(control);
}
$('tilt').onclick = async () => {
  if (tilt) { tilt = false; neutral = null; $('tilt').textContent = 'Ativar inclinação'; return; }
  if (!window.isSecureContext || !('DeviceOrientationEvent' in window)) { notify('Inclinação indisponível. Use os botões de direção.'); return; }
  try {
    const event = DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> };
    if (event.requestPermission && await event.requestPermission() !== 'granted') throw new Error('denied');
    neutral = null; tilt = true; lastOrientationAtMs = performance.now();
    $('tilt').textContent = 'Desativar inclinação';
    notify('Segure o celular na posição de dirigir.');
  } catch { notify('Permissão não concedida. Use os botões.'); }
};
window.addEventListener('deviceorientation', e => {
  if (!tilt || e.gamma === null || e.beta === null) return;
  lastOrientationAtMs = performance.now();
  const angle = screen.orientation?.angle ?? 0;
  const value = Math.abs(angle) === 90 ? e.beta * (angle === 90 ? 1 : -1) : e.gamma;
  if (neutral === null) { neutral = value; notify('Inclinação calibrada. Acelere pelo botão.'); }
  const delta = value - neutral;
  tiltSteer = Math.abs(delta) < 3 ? 0 : THREE.MathUtils.clamp(delta / 25, -1, 1);
});
screen.orientation?.addEventListener('change', () => { neutral = null; tiltSteer = 0; });
const mini = $('minimap') as unknown as HTMLCanvasElement;
const ctx = mini.getContext('2d')!;
function minimap() {
  ctx.clearRect(0, 0, 220, 150);
  ctx.lineWidth = 9; ctx.strokeStyle = '#e5ecd54d'; ctx.lineJoin = 'round';
  ctx.beginPath();
  track.forEach((p, i) => { const x = p.x * 1.1 + 110, y = p.z * 1.1 + 75; if (!i) ctx.moveTo(x, y); else ctx.lineTo(x, y); });
  ctx.closePath(); ctx.stroke();
  const kartState = lap?.kart ?? idleKart;
  ctx.fillStyle = '#def39a'; ctx.beginPath(); ctx.arc(kartState.x * 1.1 + 110, kartState.z * 1.1 + 75, 5, 0, Math.PI * 2); ctx.fill();
}
// HUD and result screens: they display what the simulation reports and decide nothing (I2).
let shownStateText = '', shownSectorsKey = '', resultLang: Language | undefined, lastPhase: LapSession['phase'] | undefined;
function renderHud() {
  const view = getLapState(lap);
  const countdown = $('lap-countdown'), state = $('lap-state'), paused = $('lap-paused'), sectors = $('lap-sectors');
  if ('code' in view) {
    for (const el of [countdown, state, paused, sectors]) el.classList.add('hidden');
    $('timer').textContent = formatLapTime(0);
    return;
  }
  const d = describeLap(view, lang);
  if (d.countdownText) { countdown.textContent = d.countdownText; countdown.classList.remove('hidden'); }
  else if (greenSignalVisible(view)) { countdown.textContent = message('countdownGreenSignal', lang); countdown.classList.remove('hidden'); }
  else countdown.classList.add('hidden');
  const stateText = d.reasonText ? `${d.stateText} · ${d.reasonText}` : d.stateText;
  if (stateText !== shownStateText) { shownStateText = stateText; state.textContent = stateText; }
  state.dataset.validity = view.lapValidity;
  state.classList.remove('hidden');
  paused.classList.toggle('hidden', !d.pausedText);
  if (d.pausedText) paused.textContent = d.pausedText;
  const sectorsKey = `${lang}:${view.completedSectorMs.join(',')}`;
  if (sectorsKey !== shownSectorsKey) {
    shownSectorsKey = sectorsKey;
    sectors.replaceChildren(...view.completedSectorMs.map((ms, i) => {
      const li = document.createElement('li');
      li.className = 'lap-chip';
      li.textContent = `${message('sectorLabel', lang)} ${i + 1} ${formatLapTime(ms)}`;
      return li;
    }));
  }
  sectors.classList.toggle('hidden', view.completedSectorMs.length === 0);
  $('timer').textContent = formatLapTime(view.elapsedMs);
}
function renderResult() {
  const result = getLapResult(lap);
  const panel = $('lap-result');
  if ('code' in result) { panel.classList.add('hidden'); return; }
  if (resultLang === lang) return;
  resultLang = lang;
  panel.dataset.validity = result.lapValidity;
  const total = $('lap-result-total'), list = $('lap-result-sectors');
  if (result.lapValidity === 'VALID' && result.lapMs !== undefined && result.sectorMs) {
    $('lap-result-title').textContent = message('lapResultValid', lang);
    total.textContent = `${message('totalLabel', lang)} ${formatLapTime(result.lapMs)}${result.official ? '' : ` · ${message('lapUnofficial', lang)}`}`;
    list.replaceChildren(...result.sectorMs.map((ms, i) => {
      const li = document.createElement('li');
      li.className = 'lap-chip';
      li.textContent = `${message('sectorLabel', lang)} ${i + 1} ${formatLapTime(ms)}`;
      return li;
    }));
    total.classList.remove('hidden');
  } else {
    const reasonKey: Record<NonNullable<typeof result.invalidReason>, MessageKey> = { MISSED_MARKER: 'reasonMissedMarker', CUT: 'reasonCut', REPOSITION: 'reasonReposition' };
    const reason = result.invalidReason ? message(reasonKey[result.invalidReason], lang) : undefined;
    $('lap-result-title').textContent = reason ? `${message('lapStateInvalid', lang)} · ${reason}` : message('lapStateInvalid', lang);
    total.textContent = ''; total.classList.add('hidden');
    list.replaceChildren();
  }
  $('lap-new-lap').textContent = message('newLap', lang);
  panel.classList.remove('hidden');
}
new ResizeObserver(() => {
  renderer.setSize(host.clientWidth, host.clientHeight);
  camera.aspect = host.clientWidth / host.clientHeight; camera.updateProjectionMatrix();
}).observe(host);
camera.position.set(125, 130, 145);
camera.lookAt(0, 0, 0);
const cameraTarget = new THREE.Vector3();
function frame(now: number) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.1); last = now;
  lang = resolveLanguage(navigator.language);
  if (tilt && lap && (lap.phase === 'COUNTDOWN' || lap.phase === 'RUNNING') && now - lastOrientationAtMs > SENSOR_SILENCE_MS) emitPause('SENSOR_LOST');
  if (lap && (lap.phase === 'COUNTDOWN' || lap.phase === 'RUNNING')) {
    const left = keys.has('a') || keys.has('arrowleft') || touch.has('left');
    const right = keys.has('d') || keys.has('arrowright') || touch.has('right');
    const input = {
      throttle: +(keys.has('w') || keys.has('arrowup') || touch.has('throttle')),
      brake: +(keys.has('s') || keys.has('arrowdown') || touch.has('brake')),
      steer: left || right ? Number(right) - Number(left) : tilt ? tiltSteer : 0,
      drift: keys.has(' ') || touch.has('drift'),
    };
    const clock = advanceClock(accumulatorS, dt);
    accumulatorS = clock.accumulatorS;
    for (let i = 0; i < clock.steps && lap.phase !== 'ENDED'; i++) {
      const awards = lap.kart.maneuvers.awards;
      lap = stepLap(lap, input);
      if (lap.kart.maneuvers.awards > awards) {
        const tier = lap.kart.maneuvers.boostTier;
        notify(`${['', 'Boa curva!', 'Drift perfeito!', 'Super drift!'][tier]} +${tier * 100 * lap.kart.maneuvers.chain} estilo`, 1800);
        audio.reward(tier);
      }
    }
  }
  const state = lap?.kart ?? idleKart;
  const running = lap?.phase === 'RUNNING';
  if (lap?.phase === 'ENDED' && lastPhase !== 'ENDED') {
    const result = getLapResult(lap);
    if (!('code' in result) && result.lapMs !== undefined) { best = Math.min(best, result.lapMs); $('best').textContent = formatLapTime(best); }
  }
  lastPhase = lap?.phase;
  kart.position.set(state.x, 0, state.z); kart.rotation.y = state.heading;
  const tricks = state.maneuvers;
  audio.update(state.speed, state.throttle, running);
  exhaust.visible = tricks.boost > 0;
  exhaust.scale.z = 1 + (reducedMotion ? 0 : Math.sin(state.elapsed * 35) * 0.12);
  if (running && tricks.drifting && state.speed > 6 && Math.abs(state.telemetry.sideslip) > 0.055) {
    skidClock += dt;
    if (skidClock >= 0.04) {
      skidClock = 0;
      const rear = wheelPositions(config).slice(2).map(p => new THREE.Vector3(
        state.x + p.forward * Math.sin(state.heading) + p.left * Math.cos(state.heading),
        0.055,
        state.z + p.forward * Math.cos(state.heading) - p.left * Math.sin(state.heading),
      ));
      rear.forEach((p, i) => {
        const previous = previousSkids[i];
        if (!previous) return;
        const distance = p.distanceTo(previous);
        if (distance < 0.03 || distance > 3) return;
        skidTransform.position.copy(p).add(previous).multiplyScalar(0.5);
        skidTransform.rotation.y = Math.atan2(p.x - previous.x, p.z - previous.z);
        skidTransform.scale.set(1, 1, distance);
        skidTransform.updateMatrix();
        skidMarks.setMatrixAt(skidIndex, skidTransform.matrix);
        skidIndex = (skidIndex + 1) % 320;
        skidMarks.count = Math.min(320, skidMarks.count + 1);
      });
      skidMarks.instanceMatrix.needsUpdate = true;
      previousSkids = rear;
    }
  } else { previousSkids = []; skidClock = 0; }
  for (let i = 0; i < wheels.length; i++) {
    wheels[i].pivot.rotation.y = state.telemetry.wheels[i]?.steerAngle ?? 0;
    // Visual spin follows traveled speed; wheel angular dynamics are not simulated.
    if (running) wheels[i].mesh.rotateY(state.speed * dt / 0.31);
  }
  if (started) {
    cameraTarget.set(state.x - Math.sin(state.heading) * 18, 14, state.z - Math.cos(state.heading) * 18);
    camera.position.lerp(cameraTarget, 1 - Math.exp(-dt * 5));
    camera.lookAt(state.x + Math.sin(state.heading) * 9, 0.5, state.z + Math.cos(state.heading) * 9);
  }
  const targetFov = 48 + (config.drivingAssists && !reducedMotion ? Math.min(5, state.speed * 0.15) + (tricks.boost > 0 ? 4 : 0) : 0);
  if (Math.abs(camera.fov - targetFov) > 0.01) {
    camera.fov = THREE.MathUtils.lerp(camera.fov, targetFov, 1 - Math.exp(-dt * 5));
    camera.updateProjectionMatrix();
  }
  renderHud();
  if (lap?.phase === 'ENDED') renderResult();
  renderOffer();
  const active = lapActive();
  ($('driver-mass') as HTMLInputElement).disabled = active;
  ($('handling-preset') as HTMLSelectElement).disabled = active;
  const pauseButton = $('pause');
  pauseButton.classList.toggle('hidden', lap?.phase !== 'PAUSED');
  pauseButton.textContent = `▶ ${message('resumeLap', lang)}`;
  const fallback = $('lap-control-fallback');
  const showFallback = active ? touchFallback : coarsePointer.matches && !tilt;
  fallback.classList.toggle('hidden', !showFallback);
  if (showFallback) fallback.textContent = message('controlFallbackTouch', lang);
  $('speed').textContent = Math.round(state.speed * 3.6).toString();
  $('style-score').textContent = tricks.score.toLocaleString('pt-BR');
  $('combo').textContent = tricks.chain > 1 && tricks.chainWindow > 0 ? `×${tricks.chain}` : '';
  const tier = chargeTier(tricks.charge);
  const fill = tricks.boost > 0 ? tricks.boost / [1, 0.8, 1.3, 1.8][tricks.boostTier] : tricks.charge / 2.2;
  $('drift-fill').style.width = `${Math.min(100, fill * 100)}%`;
  $('drift-meter').setAttribute('aria-valuenow', String(Math.round(Math.min(100, fill * 100))));
  $('drift-meter').setAttribute('aria-label', tricks.boost > 0 ? 'Duração restante do turbo' : 'Carga do drift');
  $('drift-hud').dataset.tier = String(tricks.boost > 0 ? tricks.boostTier : tier);
  $('drift-hud').classList.toggle('hidden', !started || !config.drivingAssists);
  $('drift-label').textContent = tricks.boost > 0 ? 'TURBO!' : tricks.drifting ? tier > 0 ? `TURBO ${tier} PRONTO` : 'CARREGANDO DRIFT' : 'ESPAÇO + CURVA';
  $('drift-help').textContent = tricks.boost > 0 ? 'Acelere e aproveite a saída.' : tricks.drifting ? tier > 0 ? 'Solte Espaço para disparar!' : 'Mantenha a curva no asfalto.' : 'Segure para deslizar. Solte para acelerar.';
  document.querySelector('.game-shell')!.classList.toggle('boosting', tricks.boost > 0);
  const driftButton = document.querySelector<HTMLButtonElement>('[data-control="drift"]')!;
  driftButton.disabled = !config.drivingAssists;
  const t = state.telemetry;
  const labels = { grip: 'Aderência', understeer: 'Saindo de frente', oversteer: 'Saindo de traseira', sliding: 'Derrapando' };
  $('handling').textContent = labels[t.handling];
  $('handling').dataset.state = t.handling;
  $('lateral-g').textContent = `${Math.abs(t.lateralG).toFixed(2)} g`;
  $('longitudinal-g').textContent = `${t.longitudinalG >= 0 ? '+' : ''}${t.longitudinalG.toFixed(2)} g`;
  $('front-slip').textContent = `${(t.frontSlip * 180 / Math.PI).toFixed(1)}°`;
  $('rear-slip').textContent = `${(t.rearSlip * 180 / Math.PI).toFixed(1)}°`;
  for (let i = 0; i < 4; i++) {
    const wheel = t.wheels[i];
    const load = wheel?.load ?? (config.kartMass + config.driverMass) * 9.81 * (i < 2 ? config.frontWeight : 1 - config.frontWeight) / 2;
    $(`load-${i}`).style.setProperty('--load', `${Math.min(100, load / ((config.kartMass + config.driverMass) * 9.81) * 200)}%`);
    $(`load-${i}`).textContent = `${Math.round(load)} N`;
    $(`load-${i}`).classList.toggle('saturated', (wheel?.utilization ?? 0) > 1);
  }
  if (now > notificationUntil) $('message').textContent = '';
  minimap();
  renderer.render(scene, camera);
}
requestAnimationFrame(frame);
