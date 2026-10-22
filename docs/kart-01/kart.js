// kart.js — Kart 01 do Kartle · kart de aluguel low-poly (Three.js)
//
// Unidades em metros · Y para cima · frente do kart = −Z · direita do piloto = +X
// Origem no chão, no meio do entre-eixos.
//
// Uso:
//   import { criarKart, atualizarKart } from './kart.js';
//   await document.fonts.load('italic 900 100px Archivo'); // opcional: fonte dos adesivos
//   const kart = criarKart({ numero: '07' });
//   cena.add(kart);
//   // a cada frame:
//   atualizarKart(kart, { direcao: anguloRodas, distancia: metrosPercorridos });
//
// direcao: ângulo das rodas dianteiras em radianos (positivo = esquerda). O volante
// gira MEDIDAS.relacaoDirecao vezes esse ângulo e os braços do piloto acompanham.
// distancia: metros percorridos desde o início (gira as rodas).
//
// Opções de criarKart: { numero: '01', piloto: true, cores: { carenagem: 0x2f9e44 } }
//
// Cada peça é um THREE.Group com nome (kart.getObjectByName('motor')):
// chassi, eixoTraseiro, rodaDianteiraEsq/Dir, rodaTraseiraEsq/Dir, nariz,
// painelFrontal, sidepodEsq/Dir, paraChoqueTraseiro, banco, direcao, pedais,
// motor e piloto. explodirKart(kart, 0..1) monta a vista explodida.

import * as THREE from 'three';

export const CORES = {
  carenagem: 0xff6a13, // laranja Kartle
  borracha: 0x1e2024,
  chassi: 0x2b2e34,
  bandeja: 0x3a3e45,
  pneu: 0x1a1b1f,
  aro: 0xc5cad1,
  cubo: 0x3a3e45,
  banco: 0x1e2024,
  volante: 0x26292e,
  motor: 0x5a6069,
  motorEscuro: 0x33373d,
  escapamento: 0xb9bec6,
  placa: 0xf4f3ef,
  macacao: 0x2f55d4,
  luvas: 0x1c1d21,
  capacete: 0xf4f3ef,
  viseira: 0x1a2233,
};

export const MEDIDAS = {
  comprimento: 1.925,
  largura: 1.45,
  entreEixos: 1.05,
  bitolaDianteira: 1.0,
  bitolaTraseira: 1.14,
  raioRodaDianteira: 0.13,
  larguraRodaDianteira: 0.13,
  raioRodaTraseira: 0.14,
  larguraRodaTraseira: 0.19,
  relacaoDirecao: 2.2, // volante gira 2,2× o ângulo das rodas
};

// Volante: centro, inclinação da coluna e raio
const VOLANTE = { centro: new THREE.Vector3(0, 0.46, -0.18), inclinacao: -0.686, raio: 0.15, pegada: 0.1386 };

// ---------------------------------------------------------------- utilidades

const v3 = (p) => (p.isVector3 ? p.clone() : new THREE.Vector3(p[0], p[1], p[2]));
const CIMA = new THREE.Vector3(0, 1, 0);

function malha(geo, material, nome = '') {
  const m = new THREE.Mesh(geo, material);
  m.name = nome;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

function centralizarEixo(g, eixo) {
  g.computeBoundingBox();
  const b = g.boundingBox;
  const t = new THREE.Vector3();
  t[eixo] = -(b.min[eixo] + b.max[eixo]) / 2;
  g.translate(t.x, t.y, t.z);
  return g;
}

function opcoesExtrusao(espessura, chanfro) {
  const c = Math.max(0, Math.min(chanfro, espessura / 2 - 0.0005));
  return {
    depth: Math.max(0.0005, espessura - 2 * c),
    bevelEnabled: c > 0,
    bevelThickness: c,
    bevelSize: c,
    bevelOffset: -c,
    bevelSegments: 1,
    curveSegments: 1,
    steps: 1,
  };
}

// Perfil lateral: pontos [z, y], extrudado em X (largura) e centrado em x0
function perfilLateral(pontos, largura, chanfro = 0.02, x0 = 0) {
  const forma = new THREE.Shape(pontos.map(([z, y]) => new THREE.Vector2(z, y)));
  const g = new THREE.ExtrudeGeometry(forma, opcoesExtrusao(largura, chanfro));
  g.rotateY(-Math.PI / 2);
  centralizarEixo(g, 'x');
  if (x0) g.translate(x0, 0, 0);
  return g;
}

// Perfil de planta: pontos [x, z], extrudado para cima de y0 até y1
function perfilPlanta(pontos, y0, y1, chanfro = 0.02) {
  const forma = new THREE.Shape(pontos.map(([x, z]) => new THREE.Vector2(x, -z)));
  const g = new THREE.ExtrudeGeometry(forma, opcoesExtrusao(y1 - y0, chanfro));
  g.rotateX(-Math.PI / 2);
  g.computeBoundingBox();
  g.translate(0, y0 - g.boundingBox.min.y, 0);
  return g;
}

// Perfil frontal: pontos [x, y], espessura em Z centrada
function perfilFrontal(pontos, espessura, chanfro = 0.01) {
  const forma = new THREE.Shape(pontos.map(([x, y]) => new THREE.Vector2(x, y)));
  const g = new THREE.ExtrudeGeometry(forma, opcoesExtrusao(espessura, chanfro));
  return centralizarEixo(g, 'z');
}

// Sobe/desce os vértices do topo (y >= yCorte) com uma função plana de (x, z)
function inclinarTopo(g, yCorte, delta) {
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const y = p.getY(i);
    if (y >= yCorte) p.setY(i, y + delta(p.getX(i), p.getZ(i)));
  }
  p.needsUpdate = true;
  g.computeVertexNormals();
  g.computeBoundingBox();
  return g;
}

function retanguloChanfrado(w, h, c) {
  return [
    [-w / 2 + c, -h / 2], [w / 2 - c, -h / 2], [w / 2, -h / 2 + c], [w / 2, h / 2 - c],
    [w / 2 - c, h / 2], [-w / 2 + c, h / 2], [-w / 2, h / 2 - c], [-w / 2, -h / 2 + c],
  ];
}

// Caixa com todas as arestas chanfradas, centrada na origem (w = X, h = Y, d = Z)
function caixa(w, h, d, c = 0.01) {
  c = Math.max(0.0005, Math.min(c, w / 2 - 0.001, h / 2 - 0.001, d / 2 - 0.001));
  return perfilLateral(retanguloChanfrado(d, h, c), w, c);
}

function cilindro(raio, comprimento, segs, eixo, raioTopo = raio) {
  const g = new THREE.CylinderGeometry(raioTopo, raio, comprimento, segs, 1);
  if (eixo === 'x') g.rotateZ(-Math.PI / 2);
  if (eixo === 'z') g.rotateX(Math.PI / 2);
  return g;
}

export function posicionarTubo(m, a, b) {
  const A = v3(a);
  const d = v3(b).sub(A);
  const L = d.length();
  m.position.copy(A).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(CIMA, d.normalize());
  m.scale.set(1, L, 1);
  return m;
}

function tubo(a, b, raio, material, segs = 6, nome = '') {
  const m = malha(new THREE.CylinderGeometry(raio, raio, 1, segs, 1), material, nome);
  return posicionarTubo(m, a, b);
}

function no(m, x, y, z, rx = 0, ry = 0, rz = 0) {
  m.position.set(x, y, z);
  m.rotation.set(rx, ry, rz);
  return m;
}

// Pinta cada face de uma geometria não indexada (cores lineares)
function pintarFaces(g, corDaFace) {
  g = g.index ? g.toNonIndexed() : g;
  const p = g.attributes.position;
  const cores = new Float32Array(p.count * 3);
  const c = new THREE.Color();
  const centro = new THREE.Vector3();
  for (let i = 0; i < p.count; i += 3) {
    centro.set(
      (p.getX(i) + p.getX(i + 1) + p.getX(i + 2)) / 3,
      (p.getY(i) + p.getY(i + 1) + p.getY(i + 2)) / 3,
      (p.getZ(i) + p.getZ(i + 1) + p.getZ(i + 2)) / 3,
    );
    c.setHex(corDaFace(centro));
    for (let k = 0; k < 3; k++) cores.set([c.r, c.g, c.b], (i + k) * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(cores, 3));
  return g;
}

function texturaCanvas(w, h, desenhar) {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  desenhar(canvas.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function caminhoChanfrado(ctx, x, y, w, h, c) {
  ctx.beginPath();
  ctx.moveTo(x + c, y);
  ctx.lineTo(x + w - c, y);
  ctx.lineTo(x + w, y + c);
  ctx.lineTo(x + w, y + h - c);
  ctx.lineTo(x + w - c, y + h);
  ctx.lineTo(x + c, y + h);
  ctx.lineTo(x, y + h - c);
  ctx.lineTo(x, y + c);
  ctx.closePath();
}

const hex = (n) => '#' + n.toString(16).padStart(6, '0');

function texturaPlaca(numero, fonte, cores) {
  return texturaCanvas(512, 352, (ctx, w, h) => {
    ctx.fillStyle = hex(cores.placa);
    caminhoChanfrado(ctx, 0, 0, w, h, 56);
    ctx.fill();
    ctx.fillStyle = hex(cores.borracha);
    ctx.font = `italic 900 262px ${fonte}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(numero, w / 2 + 6, h / 2 + 14);
  });
}

function texturaLateral(numero, fonte, cores) {
  return texturaCanvas(1024, 192, (ctx, w, h) => {
    // faixa escura inclinada com o nome
    ctx.fillStyle = hex(cores.borracha);
    ctx.beginPath();
    ctx.moveTo(232, 0); ctx.lineTo(w, 0); ctx.lineTo(w - 44, h); ctx.lineTo(188, h);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = hex(cores.placa);
    ctx.font = `italic 900 128px ${fonte}`;
    ctx.textBaseline = 'middle';
    ctx.fillText('KARTLE', 262, h / 2 + 8);
    // número em quadro branco chanfrado
    ctx.fillStyle = hex(cores.placa);
    caminhoChanfrado(ctx, 0, 0, 200, h, 34);
    ctx.fill();
    ctx.fillStyle = hex(cores.borracha);
    ctx.font = `italic 900 136px ${fonte}`;
    ctx.textAlign = 'center';
    ctx.fillText(numero, 104, h / 2 + 8);
  });
}

function materialAdesivo(textura) {
  return new THREE.MeshStandardMaterial({
    map: textura, transparent: true, roughness: 0.55,
    polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4,
  });
}

function criarMateriais(cores) {
  const m = (cor, roughness = 0.7, metalness = 0, extra = {}) =>
    new THREE.MeshStandardMaterial({ color: cor, roughness, metalness, flatShading: true, ...extra });
  return {
    carenagem: m(cores.carenagem, 0.5),
    borracha: m(cores.borracha, 0.9),
    chassi: m(cores.chassi, 0.5, 0.2),
    bandeja: m(cores.bandeja, 0.6, 0.15),
    pneu: m(cores.pneu, 0.92),
    aro: m(cores.aro, 0.38, 0.3),
    cubo: m(cores.cubo, 0.5, 0.25),
    banco: m(cores.banco, 0.6),
    volante: m(cores.volante, 0.7),
    motor: m(cores.motor, 0.5, 0.25),
    motorEscuro: m(cores.motorEscuro, 0.6, 0.2),
    escapamento: m(cores.escapamento, 0.32, 0.45),
    disco: m(0x8a9099, 0.4, 0.4),
  };
}

// ---------------------------------------------------------------- rodas

function criarRoda(raio, largura, lado, nome, M) {
  const roda = new THREE.Group();
  roda.name = nome;
  const giro = new THREE.Group();
  giro.name = nome + 'Giro';
  roda.add(giro);
  const segs = 14;
  const rAro = raio * 0.6;
  const c = Math.min(raio * 0.2, largura * 0.24);
  const perfil = [
    [rAro * 1.02, -largura / 2 * 0.9],
    [raio - c, -largura / 2],
    [raio, -largura / 2 + c],
    [raio, largura / 2 - c],
    [raio - c, largura / 2],
    [rAro * 1.02, largura / 2 * 0.9],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const pneu = new THREE.LatheGeometry(perfil, segs);
  pneu.rotateZ(-Math.PI / 2);
  giro.add(malha(pneu, M.pneu, 'pneu'));
  giro.add(malha(cilindro(rAro, largura * 0.84, segs, 'x'), M.aro, 'aro'));
  // cubo saliente do lado de fora
  const cubo = malha(cilindro(raio * 0.24, largura * 0.12, 8, 'x', raio * 0.19), M.cubo, 'cubo');
  cubo.position.x = lado * largura * 0.45;
  if (lado < 0) cubo.rotation.z = Math.PI;
  giro.add(cubo);
  // 4 parafusos
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const p = malha(cilindro(raio * 0.045, largura * 0.06, 6, 'x'), M.cubo, 'parafuso');
    p.position.set(lado * largura * 0.43, Math.sin(a) * rAro * 0.62, Math.cos(a) * rAro * 0.62);
    giro.add(p);
  }
  roda.userData = { giro, raio, lado };
  return roda;
}

// ---------------------------------------------------------------- piloto

export function criarCapacete(cores = CORES) {
  const g = new THREE.Group();
  g.name = 'capacete';
  const r = 0.16;
  const casco = pintarFaces(new THREE.SphereGeometry(r, 12, 9, Math.PI / 12), (c) => {
    const phi = (Math.atan2(c.z, -c.x) + Math.PI * 2) % (Math.PI * 2);
    const perto = (alvo) => Math.abs(phi - alvo) < Math.PI / 12;
    const listra = perto(Math.PI / 2) || perto(Math.PI * 1.5);
    const filete = perto(Math.PI / 3) || perto(Math.PI * 2 / 3) || perto(Math.PI * 4 / 3) || perto(Math.PI * 5 / 3);
    if (c.y < -r * 0.5) return cores.macacao; // faixa de baixo
    if (listra && c.y > -r * 0.2) return cores.carenagem; // listra central laranja
    if (filete && c.y > r * 0.25) return cores.macacao; // filetes azuis ao lado da listra
    return cores.capacete;
  });
  const matCasco = new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.35 });
  const mCasco = malha(casco, matCasco, 'casco');
  g.add(mCasco);
  // viseira: mesmas facetas do casco, um pouco maior
  const viseira = new THREE.SphereGeometry(r * 1.018, 5, 2, Math.PI * 13 / 12, Math.PI * 10 / 12, Math.PI / 3, Math.PI * 2 / 9);
  const matViseira = new THREE.MeshStandardMaterial({ color: cores.viseira, flatShading: true, roughness: 0.12, metalness: 0.55 });
  g.add(malha(viseira, matViseira, 'viseira'));
  // queixeira saliente logo abaixo da viseira
  const queixo = new THREE.SphereGeometry(r * 1.03, 5, 1, Math.PI * 13 / 12, Math.PI * 10 / 12, Math.PI * 5 / 9, Math.PI / 9);
  g.add(malha(queixo, new THREE.MeshStandardMaterial({ color: cores.capacete, flatShading: true, roughness: 0.35, side: THREE.DoubleSide }), 'queixeira'));
  g.scale.set(0.93, 1, 1.06);
  return g;
}

function corposPiloto(cores) {
  const m = (cor, rug = 0.75) => new THREE.MeshStandardMaterial({ color: cor, roughness: rug, flatShading: true });
  return {
    macacao: m(cores.macacao),
    luvas: m(cores.luvas, 0.85),
    punho: m(cores.carenagem, 0.6),
    pescoco: m(cores.luvas, 0.85),
    faixas: new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.75, flatShading: true }),
  };
}

// Pose sentada. Mãos na posição "9h15" do volante.
export function criarPiloto(cores = CORES) {
  const g = new THREE.Group();
  g.name = 'piloto';
  const M = corposPiloto(cores);

  // quadril
  const quadril = malha(new THREE.CylinderGeometry(0.16, 0.155, 0.13, 8, 1, false, -Math.PI / 8), M.macacao, 'quadril');
  quadril.scale.set(1, 1, 0.78);
  no(quadril, 0, 0.15, 0.2);
  g.add(quadril);

  // tronco com faixas laterais laranja
  const geoTronco = pintarFaces(new THREE.CylinderGeometry(0.205, 0.165, 0.42, 8, 1, false, -Math.PI / 8), (c) =>
    Math.abs(c.x) > 0.15 && Math.abs(c.y) < 0.2 ? cores.carenagem : cores.macacao);
  const tronco = malha(geoTronco, M.faixas, 'tronco');
  tronco.scale.set(1, 1, 0.64);
  no(tronco, 0, 0.386, 0.275, 0.19);
  g.add(tronco);

  const pescoco = malha(cilindro(0.056, 0.1, 6, 'y'), M.pescoco, 'pescoco');
  no(pescoco, 0, 0.635, 0.318, 0.19);
  g.add(pescoco);

  const capacete = criarCapacete(cores);
  no(capacete, 0, 0.79, 0.312, 0.06);
  g.add(capacete);

  // pernas (estáticas)
  for (const lado of [-1, 1]) {
    const qua = new THREE.Vector3(lado * 0.09, 0.13, 0.17);
    const joe = new THREE.Vector3(lado * 0.145, 0.27, -0.165);
    const tor = new THREE.Vector3(lado * 0.082, 0.13, -0.535);
    g.add(tubo(qua, joe, 0.078, M.macacao, 6, 'coxa'));
    g.add(tubo(joe, tor, 0.062, M.macacao, 6, 'canela'));
    g.add(no(malha(new THREE.SphereGeometry(0.072, 6, 4), M.macacao, 'joelho'), joe.x, joe.y, joe.z));
    const bota = malha(caixa(0.09, 0.1, 0.2, 0.026), M.luvas, 'bota');
    no(bota, lado * 0.082, 0.165, -0.585, 0.61);
    g.add(bota);
  }

  // braços: atualizados por atualizarBracos()
  const bracos = [];
  for (const lado of [-1, 1]) {
    const ombro = new THREE.Vector3(lado * 0.19, 0.555, 0.3);
    g.add(no(malha(new THREE.SphereGeometry(0.072, 6, 4), M.macacao, 'ombro'), ombro.x, ombro.y, ombro.z));
    const sup = malha(new THREE.CylinderGeometry(0.056, 0.056, 1, 6, 1), M.macacao, 'bracoSup');
    const ante = malha(new THREE.CylinderGeometry(0.048, 0.052, 1, 6, 1), M.macacao, 'antebraco');
    const cot = malha(new THREE.SphereGeometry(0.057, 6, 4), M.macacao, 'cotovelo');
    const punho = malha(new THREE.CylinderGeometry(0.053, 0.053, 1, 6, 1), M.punho, 'punho');
    const luva = malha(caixa(0.078, 0.11, 0.088, 0.018), M.luvas, 'luva');
    g.add(sup, ante, cot, punho, luva);
    bracos.push({ lado, ombro, l1: 0.285, l2: 0.27, sup, ante, cot, punho, luva });
  }
  g.userData.bracos = bracos;
  atualizarBracos(g, 0);
  return g;
}

const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

function maoNoVolante(lado, anguloVolante) {
  // posição da mão no aro (coordenadas do kart) e orientação do volante
  _e.set(VOLANTE.inclinacao, 0, 0);
  _q.setFromEuler(_e);
  const giro = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), anguloVolante);
  const q = _q.clone().multiply(giro);
  const local = new THREE.Vector3(lado * VOLANTE.pegada, 0, 0.012);
  return { pos: local.applyQuaternion(q).add(VOLANTE.centro), q };
}

function resolverCotovelo(ombro, mao, l1, l2, dica) {
  const d = mao.clone().sub(ombro);
  const L = Math.min(d.length(), l1 + l2 - 1e-4);
  const dir = d.normalize();
  const a = (l1 * l1 - l2 * l2 + L * L) / (2 * L);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const perp = dica.clone().addScaledVector(dir, -dica.dot(dir)).normalize();
  return ombro.clone().addScaledVector(dir, a).addScaledVector(perp, h);
}

export function atualizarBracos(piloto, anguloVolante = 0) {
  for (const b of piloto.userData.bracos) {
    const { pos, q } = maoNoVolante(b.lado, anguloVolante);
    const dica = new THREE.Vector3(b.lado * 0.65, -0.75, 0.1);
    const cotovelo = resolverCotovelo(b.ombro, pos, b.l1, b.l2, dica);
    const pulso = pos.clone().lerp(cotovelo, 0.16);
    posicionarTubo(b.sup, b.ombro, cotovelo);
    posicionarTubo(b.ante, cotovelo, pulso);
    posicionarTubo(b.punho, pulso, pulso.clone().lerp(pos, 0.45));
    b.cot.position.copy(cotovelo);
    b.luva.position.copy(pos);
    b.luva.quaternion.copy(q);
  }
}

// ---------------------------------------------------------------- kart

export function criarKart(opcoes = {}) {
  const cores = { ...CORES, ...(opcoes.cores || {}) };
  const numero = opcoes.numero ?? '01';
  const fonte = opcoes.fonte ?? 'Archivo, "Arial Black", Impact, sans-serif';
  const comPiloto = opcoes.piloto ?? true;
  const M = criarMateriais(cores);

  const kart = new THREE.Group();
  kart.name = 'kart';
  const pecas = {};
  const peca = (nome, explodir) => {
    const g = new THREE.Group();
    g.name = nome;
    g.userData.explodir = new THREE.Vector3(...explodir);
    kart.add(g);
    pecas[nome] = g;
    return g;
  };

  // --- chassi: tubos, bandeja, mangas de eixo e barras de direção
  const chassi = peca('chassi', [0, 0, 0]);
  const yT = 0.045;
  const trilho = [[-0.15, yT, -0.78], [-0.3, yT, -0.48], [-0.35, yT, 0.3], [-0.35, yT, 0.66]];
  for (const s of [-1, 1]) {
    for (let i = 0; i < trilho.length - 1; i++) {
      const a = trilho[i], b = trilho[i + 1];
      chassi.add(tubo([Math.abs(a[0]) * s, a[1], a[2]], [Math.abs(b[0]) * s, b[1], b[2]], 0.016, M.chassi, 6, 'trilho'));
    }
  }
  const travessas = [
    [[-0.15, yT, -0.78], [0.15, yT, -0.78]],
    [[-0.43, 0.06, -0.525], [0.43, 0.06, -0.525]],
    [[-0.33, yT, 0.1], [0.33, yT, 0.1]],
    [[-0.35, yT, 0.66], [0.35, yT, 0.66]],
    [[-0.3, 0.05, 0.66], [-0.3, 0.1, 0.7]],
    [[0.3, 0.05, 0.66], [0.3, 0.1, 0.7]],
    [[-0.15, yT, -0.78], [-0.26, 0.08, -0.87]],
    [[0.15, yT, -0.78], [0.26, 0.08, -0.87]],
  ];
  for (const [a, b] of travessas) chassi.add(tubo(a, b, 0.016, M.chassi));
  chassi.add(malha(perfilPlanta([[-0.14, -0.76], [0.14, -0.76], [0.3, -0.46], [0.3, 0.14], [-0.3, 0.14], [-0.3, -0.46]], 0.026, 0.037, 0.004), M.bandeja, 'bandeja'));
  for (const s of [-1, 1]) {
    chassi.add(tubo([s * 0.43, 0.05, -0.525], [s * 0.43, 0.2, -0.525], 0.014, M.chassi, 6, 'manga'));
    chassi.add(tubo([s * 0.43, 0.13, -0.525], [s * 0.47, 0.13, -0.525], 0.012, M.cubo, 6, 'pontaEixo'));
    chassi.add(tubo([s * 0.04, 0.1, -0.6], [s * 0.4, 0.11, -0.49], 0.008, M.chassi, 5, 'barraDirecao'));
  }

  // --- eixo traseiro
  const eixo = peca('eixoTraseiro', [0, 0, 0.3]);
  eixo.add(tubo([-0.6, 0.14, 0.525], [0.6, 0.14, 0.525], 0.02, M.cubo, 8, 'eixo'));
  for (const s of [-1, 1]) eixo.add(no(malha(caixa(0.04, 0.12, 0.07, 0.008), M.chassi, 'mancal'), s * 0.38, 0.1, 0.525));
  eixo.add(no(malha(cilindro(0.085, 0.01, 14, 'x'), M.disco, 'discoFreio'), -0.18, 0.14, 0.525));
  eixo.add(no(malha(caixa(0.036, 0.05, 0.06, 0.006), M.carenagem, 'pinca'), -0.18, 0.205, 0.475, -0.6));
  eixo.add(no(malha(cilindro(0.075, 0.008, 16, 'x'), M.cubo, 'coroa'), 0.225, 0.14, 0.525));

  // --- rodas
  const rodas = {};
  const defRodas = [
    ['rodaDianteiraEsq', -1, -0.5, -0.525, 0.13, 0.13],
    ['rodaDianteiraDir', 1, 0.5, -0.525, 0.13, 0.13],
    ['rodaTraseiraEsq', -1, -0.57, 0.525, 0.14, 0.19],
    ['rodaTraseiraDir', 1, 0.57, 0.525, 0.14, 0.19],
  ];
  for (const [nome, lado, x, z, raio, larg] of defRodas) {
    const p = peca(nome, [lado * 0.42, 0, z < 0 ? -0.1 : 0.3]);
    const r = criarRoda(raio, larg, lado, nome + 'Malha', M);
    r.position.set(x, raio, z);
    p.add(r);
    rodas[nome] = r;
  }

  // --- nariz (para-choque dianteiro)
  const nariz = peca('nariz', [0, 0.05, -0.5]);
  const geoNariz = perfilPlanta([
    [-0.52, -0.975], [0.52, -0.975], [0.635, -0.93], [0.665, -0.84], [0.66, -0.75], [0.62, -0.705],
    [-0.62, -0.705], [-0.66, -0.75], [-0.665, -0.84], [-0.635, -0.93],
  ], 0.05, 0.21, 0.04);
  inclinarTopo(geoNariz, 0.21 - 0.041, (x, z) => -0.02 + (0.055 * (z + 0.975)) / 0.27);
  nariz.add(malha(geoNariz, M.carenagem, 'carenagemNariz'));
  nariz.add(malha(perfilPlanta([[-0.5, -0.99], [0.5, -0.99], [0.56, -0.965], [-0.56, -0.965]], 0.04, 0.1, 0.012), M.borracha, 'borrachaNariz'));

  // --- painel frontal com o número
  const painel = peca('painelFrontal', [0, 0.3, -0.4]);
  const suporte = new THREE.Group();
  no(suporte, 0, 0.15, -0.735, 0.125);
  painel.add(suporte);
  suporte.add(malha(perfilFrontal([[-0.23, 0], [0.23, 0], [0.21, 0.24], [0.17, 0.285], [-0.17, 0.285], [-0.21, 0.24]], 0.024, 0.008), M.carenagem, 'painel'));
  const placa = malha(new THREE.PlaneGeometry(0.25, 0.172), materialAdesivo(texturaPlaca(numero, fonte, cores)), 'placaNumero');
  no(placa, 0, 0.158, -0.0135, 0, Math.PI, 0);
  placa.castShadow = false;
  suporte.add(placa);

  // --- sidepods (laterais) com adesivo
  const adesivo = materialAdesivo(texturaLateral(numero, fonte, cores));
  for (const [nome, s] of [['sidepodEsq', -1], ['sidepodDir', 1]]) {
    const p = peca(nome, [s * 0.5, 0.08, 0]);
    const pts = [[0.3, -0.335], [0.6, -0.37], [0.69, -0.33], [0.71, -0.27], [0.71, 0.27], [0.685, 0.335], [0.3, 0.34]].map(([x, z]) => [x * s, z]);
    const geo = perfilPlanta(pts, 0.045, 0.25, 0.04);
    inclinarTopo(geo, 0.25 - 0.041, (x, z) => (0.025 * (z + 0.37)) / 0.71);
    p.add(malha(geo, M.carenagem, 'carenagem' + nome));
    const dec = malha(new THREE.PlaneGeometry(0.47, 0.088), adesivo, 'adesivo');
    no(dec, s * 0.7115, 0.148, -0.02, 0, s * Math.PI / 2, 0);
    dec.castShadow = false;
    p.add(dec);
  }

  // --- para-choque traseiro em U
  const traseiro = peca('paraChoqueTraseiro', [0, 0.08, 0.62]);
  traseiro.add(malha(perfilPlanta([
    [-0.725, 0.56], [-0.675, 0.56], [-0.675, 0.69], [0.675, 0.69], [0.675, 0.56], [0.725, 0.56],
    [0.725, 0.87], [0.665, 0.935], [-0.665, 0.935], [-0.725, 0.87],
  ], 0.06, 0.25, 0.022), M.carenagem, 'carenagemTraseira'));
  const placaTras = malha(new THREE.PlaneGeometry(0.15, 0.103), materialAdesivo(texturaPlaca(numero, fonte, cores)), 'placaTraseira');
  no(placaTras, 0, 0.15, 0.9365);
  placaTras.castShadow = false;
  traseiro.add(placaTras);

  // --- banco
  const banco = peca('banco', [0, 0.4, 0.05]);
  banco.add(malha(perfilLateral([[0, 0.045], [0.27, 0.035], [0.385, 0.12], [0.455, 0.48], [0.415, 0.49], [0.345, 0.15], [0.26, 0.075], [0, 0.085]], 0.4, 0.012), M.banco, 'concha'));
  for (const s of [-1, 1]) {
    banco.add(malha(perfilLateral([[0.03, 0.08], [0.27, 0.07], [0.37, 0.16], [0.42, 0.4], [0.38, 0.42], [0.3, 0.22], [0.22, 0.17], [0.03, 0.14]], 0.03, 0.008, s * 0.185), M.banco, 'abas'));
    banco.add(tubo([s * 0.12, 0.38, 0.44], [s * 0.3, 0.06, 0.66], 0.008, M.chassi, 5, 'escoraBanco'));
  }

  // --- direção: coluna + volante octogonal
  const direcao = peca('direcao', [0, 0.48, -0.18]);
  direcao.add(tubo([0, 0.1, -0.62], VOLANTE.centro, 0.016, M.cubo, 6, 'coluna'));
  const volante = new THREE.Group();
  volante.name = 'volante';
  volante.position.copy(VOLANTE.centro);
  volante.rotation.x = VOLANTE.inclinacao;
  direcao.add(volante);
  const volanteGiro = new THREE.Group();
  volanteGiro.name = 'volanteGiro';
  volante.add(volanteGiro);
  const aro = new THREE.TorusGeometry(VOLANTE.raio, 0.017, 6, 8);
  aro.rotateZ(Math.PI / 8);
  volanteGiro.add(malha(aro, M.volante, 'aroVolante'));
  for (const s of [-1, 1]) {
    volanteGiro.add(no(malha(caixa(0.034, 0.095, 0.042, 0.008), M.borracha, 'pegada'), s * VOLANTE.pegada, 0, 0));
    volanteGiro.add(no(malha(caixa(0.095, 0.03, 0.012, 0.004), M.aro, 'raio'), s * 0.0875, 0, -0.006));
  }
  volanteGiro.add(no(malha(caixa(0.03, 0.095, 0.012, 0.004), M.aro, 'raio'), 0, -0.0875, -0.006));
  volanteGiro.add(no(malha(caixa(0.042, 0.034, 0.042, 0.006), M.carenagem, 'marcador'), 0, VOLANTE.pegada, 0));
  volanteGiro.add(no(malha(cilindro(0.046, 0.03, 8, 'z', 0.042), M.cubo, 'cuboVolante'), 0, 0, -0.012));
  volanteGiro.add(no(malha(cilindro(0.026, 0.008, 8, 'z'), M.carenagem, 'centroVolante'), 0, 0, 0.006));

  // --- pedais
  const pedais = peca('pedais', [0, 0.18, -0.12]);
  for (const s of [-1, 1]) {
    pedais.add(no(malha(caixa(0.06, 0.012, 0.1, 0.004), M.aro, s < 0 ? 'freio' : 'acelerador'), s * 0.082, 0.136, -0.642, 0.61));
    pedais.add(tubo([s * 0.08, 0.1, -0.63], [s * 0.08, 0.045, -0.6], 0.008, M.chassi, 5, 'hastePedal'));
  }

  // --- motor (lado direito, atrás)
  const motor = peca('motor', [0.42, 0.42, 0.22]);
  motor.position.set(0, 0, 0);
  const mg = new THREE.Group();
  mg.name = 'motorBloco';
  mg.position.set(0.325, 0, 0.52);
  motor.add(mg);
  mg.add(no(malha(caixa(0.24, 0.016, 0.3, 0.004), M.chassi, 'base'), 0, 0.17, 0));
  mg.add(no(malha(caixa(0.2, 0.17, 0.23, 0.02), M.motor, 'bloco'), 0, 0.265, 0));
  mg.add(no(malha(caixa(0.12, 0.08, 0.08, 0.012), M.motor, 'cabecote'), -0.015, 0.39, -0.07));
  for (const y of [0.365, 0.39, 0.415]) mg.add(no(malha(caixa(0.15, 0.01, 0.105, 0.003), M.motor, 'aleta'), -0.015, y, -0.07));
  mg.add(no(malha(caixa(0.2, 0.085, 0.13, 0.02), M.motorEscuro, 'tanque'), 0, 0.395, 0.045));
  mg.add(no(malha(cilindro(0.022, 0.02, 8, 'y'), M.escapamento, 'tampaTanque'), 0.03, 0.447, 0.06));
  mg.add(no(malha(cilindro(0.075, 0.03, 10, 'x'), M.motorEscuro, 'partida'), 0.115, 0.27, 0));
  mg.add(no(malha(caixa(0.12, 0.11, 0.07, 0.015), M.borracha, 'filtroAr'), -0.01, 0.3, -0.145));
  mg.add(no(malha(cilindro(0.045, 0.17, 10, 'x'), M.escapamento, 'escapamento'), 0, 0.33, 0.155));
  mg.add(no(malha(cilindro(0.016, 0.07, 8, 'z'), M.escapamento, 'ponteira'), 0.065, 0.33, 0.215));
  mg.add(tubo([-0.03, 0.3, 0.1], [-0.03, 0.33, 0.145], 0.014, M.escapamento, 6, 'curva'));
  mg.add(no(malha(caixa(0.016, 0.17, 0.25, 0.006), M.borracha, 'protecaoCorrente'), -0.11, 0.17, 0.02));

  // --- piloto
  let piloto = null;
  if (comPiloto) {
    piloto = criarPiloto(cores);
    piloto.userData.explodir = new THREE.Vector3(0, 0, 0);
    kart.add(piloto);
    pecas.piloto = piloto;
  }

  kart.userData = { pecas, rodas, volante: volanteGiro, piloto, materiais: M };
  return kart;
}

// direcao: ângulo das rodas dianteiras em radianos (positivo = esquerda)
// distancia: metros percorridos (gira as rodas)
export function atualizarKart(kart, { direcao = 0, distancia = 0 } = {}) {
  const { rodas, volante, piloto } = kart.userData;
  rodas.rodaDianteiraEsq.rotation.y = direcao;
  rodas.rodaDianteiraDir.rotation.y = direcao;
  for (const r of Object.values(rodas)) r.userData.giro.rotation.x = -distancia / r.userData.raio;
  const anguloVolante = direcao * MEDIDAS.relacaoDirecao;
  volante.rotation.z = anguloVolante;
  if (piloto) atualizarBracos(piloto, anguloVolante);
}

// fator 0 = montado, 1 = explodido
export function explodirKart(kart, fator = 1) {
  if (kart.userData.piloto) kart.userData.piloto.visible = fator < 0.01; // piloto some na vista explodida
  for (const p of Object.values(kart.userData.pecas)) {
    if (!p.userData.base) p.userData.base = p.position.clone();
    p.position.copy(p.userData.base).addScaledVector(p.userData.explodir, fator);
  }
}
