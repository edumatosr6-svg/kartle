# Registro de benchmarks — validação de volta de corrida (NFR-0011, DES-0012)

Saídas completas de `npm run bench:physics` e `npm run bench:handling` antes e depois da feature `race-lap-validation`, geradas em 2026-10-21 (UTC) a partir da árvore anterior (cópia de `src/`, `scripts/` antes da mudança) e da árvore atual. `src/physics.ts`, `src/maneuvers.ts` e `LapTracker` não foram editados; a comparação linha a linha (`Compare-Object`) de cada par de saídas devolve 0 linhas diferentes: diferença nula em 100% das medidas.

| Benchmark | Linhas antes | Linhas depois | Linhas diferentes |
|---|---|---|---|
| bench:physics | 141 | 141 | 0 |
| bench:handling | 16 | 16 | 0 |

## bench:physics — antes

```
{ mass: 55, speedAfter5sKmh: 42.678, distance: 30.768 }
{ mass: 75, speedAfter5sKmh: 40.157, distance: 28.501 }
{ mass: 110, speedAfter5sKmh: 36.172, distance: 25.1 }
{
  steer: 0.1,
  kmh: 56.072,
  yaw: -0.334,
  frontSlip: 0.062,
  rearSlip: 0.044,
  handling: 'grip'
}
{
  steer: 0.3,
  kmh: 51.994,
  yaw: -0.637,
  frontSlip: 0.283,
  rearSlip: 0.207,
  handling: 'understeer'
}
{
  steer: 0.7,
  kmh: 50.751,
  yaw: -0.442,
  frontSlip: 0.405,
  rearSlip: 0.15,
  handling: 'understeer'
}
{
  steer: 1,
  kmh: 50.052,
  yaw: -0.356,
  frontSlip: 0.508,
  rearSlip: 0.116,
  handling: 'understeer'
}
{
  brake: 0,
  seconds: 0.2,
  kmh: 48.969,
  yaw: -0.503,
  frontSlip: 0.153,
  rearSlip: 0.091,
  sideslip: 0.075,
  handling: 'understeer'
}
{
  brake: 0,
  seconds: 0.5,
  kmh: 47.143,
  yaw: -0.6,
  frontSlip: 0.143,
  rearSlip: 0.09,
  sideslip: 0.07,
  handling: 'understeer'
}
{
  brake: 0,
  seconds: 0.75,
  kmh: 45.616,
  yaw: -0.626,
  frontSlip: 0.146,
  rearSlip: 0.097,
  sideslip: 0.075,
  handling: 'understeer'
}
{
  brake: 0.5,
  seconds: 0.2,
  kmh: 47.668,
  yaw: -0.839,
  frontSlip: 0.169,
  rearSlip: 0.134,
  sideslip: 0.107,
  handling: 'understeer'
}
{
  brake: 0.5,
  seconds: 0.5,
  kmh: 43.788,
  yaw: -1.393,
  frontSlip: 0.318,
  rearSlip: 0.332,
  sideslip: 0.284,
  handling: 'oversteer'
}
{
  brake: 0.5,
  seconds: 0.75,
  kmh: 40.008,
  yaw: -1.585,
  frontSlip: 0.547,
  rearSlip: 0.576,
  sideslip: 0.521,
  handling: 'oversteer'
}
{
  brake: 1,
  seconds: 0.2,
  kmh: 47.454,
  yaw: -0.922,
  frontSlip: 0.174,
  rearSlip: 0.145,
  sideslip: 0.115,
  handling: 'grip'
}
{
  brake: 1,
  seconds: 0.5,
  kmh: 42.797,
  yaw: -1.756,
  frontSlip: 0.397,
  rearSlip: 0.441,
  sideslip: 0.38,
  handling: 'oversteer'
}
{
  brake: 1,
  seconds: 0.75,
  kmh: 38.079,
  yaw: -2.006,
  frontSlip: 0.749,
  rearSlip: 0.797,
  sideslip: 0.733,
  handling: 'sliding'
}
{ stop: { speed: 0, distance: 27.499, yaw: 0 } }
{ terminalKmh: 68.352 }
{
  preset: 'arcade',
  zeroTo40Seconds: 3.208,
  after5SecondsKmh: 54.346,
  terminalKmh: 79.388,
  retakeFrom28_8KmhAfter2Seconds: 48.19
}
{
  preset: 'rental',
  zeroTo40Seconds: 4.975,
  after5SecondsKmh: 40.157,
  terminalKmh: 68.352,
  retakeFrom28_8KmhAfter2Seconds: 41.422
}
```

## bench:physics — depois

```
{ mass: 55, speedAfter5sKmh: 42.678, distance: 30.768 }
{ mass: 75, speedAfter5sKmh: 40.157, distance: 28.501 }
{ mass: 110, speedAfter5sKmh: 36.172, distance: 25.1 }
{
  steer: 0.1,
  kmh: 56.072,
  yaw: -0.334,
  frontSlip: 0.062,
  rearSlip: 0.044,
  handling: 'grip'
}
{
  steer: 0.3,
  kmh: 51.994,
  yaw: -0.637,
  frontSlip: 0.283,
  rearSlip: 0.207,
  handling: 'understeer'
}
{
  steer: 0.7,
  kmh: 50.751,
  yaw: -0.442,
  frontSlip: 0.405,
  rearSlip: 0.15,
  handling: 'understeer'
}
{
  steer: 1,
  kmh: 50.052,
  yaw: -0.356,
  frontSlip: 0.508,
  rearSlip: 0.116,
  handling: 'understeer'
}
{
  brake: 0,
  seconds: 0.2,
  kmh: 48.969,
  yaw: -0.503,
  frontSlip: 0.153,
  rearSlip: 0.091,
  sideslip: 0.075,
  handling: 'understeer'
}
{
  brake: 0,
  seconds: 0.5,
  kmh: 47.143,
  yaw: -0.6,
  frontSlip: 0.143,
  rearSlip: 0.09,
  sideslip: 0.07,
  handling: 'understeer'
}
{
  brake: 0,
  seconds: 0.75,
  kmh: 45.616,
  yaw: -0.626,
  frontSlip: 0.146,
  rearSlip: 0.097,
  sideslip: 0.075,
  handling: 'understeer'
}
{
  brake: 0.5,
  seconds: 0.2,
  kmh: 47.668,
  yaw: -0.839,
  frontSlip: 0.169,
  rearSlip: 0.134,
  sideslip: 0.107,
  handling: 'understeer'
}
{
  brake: 0.5,
  seconds: 0.5,
  kmh: 43.788,
  yaw: -1.393,
  frontSlip: 0.318,
  rearSlip: 0.332,
  sideslip: 0.284,
  handling: 'oversteer'
}
{
  brake: 0.5,
  seconds: 0.75,
  kmh: 40.008,
  yaw: -1.585,
  frontSlip: 0.547,
  rearSlip: 0.576,
  sideslip: 0.521,
  handling: 'oversteer'
}
{
  brake: 1,
  seconds: 0.2,
  kmh: 47.454,
  yaw: -0.922,
  frontSlip: 0.174,
  rearSlip: 0.145,
  sideslip: 0.115,
  handling: 'grip'
}
{
  brake: 1,
  seconds: 0.5,
  kmh: 42.797,
  yaw: -1.756,
  frontSlip: 0.397,
  rearSlip: 0.441,
  sideslip: 0.38,
  handling: 'oversteer'
}
{
  brake: 1,
  seconds: 0.75,
  kmh: 38.079,
  yaw: -2.006,
  frontSlip: 0.749,
  rearSlip: 0.797,
  sideslip: 0.733,
  handling: 'sliding'
}
{ stop: { speed: 0, distance: 27.499, yaw: 0 } }
{ terminalKmh: 68.352 }
{
  preset: 'arcade',
  zeroTo40Seconds: 3.208,
  after5SecondsKmh: 54.346,
  terminalKmh: 79.388,
  retakeFrom28_8KmhAfter2Seconds: 48.19
}
{
  preset: 'rental',
  zeroTo40Seconds: 4.975,
  after5SecondsKmh: 40.157,
  terminalKmh: 68.352,
  retakeFrom28_8KmhAfter2Seconds: 41.422
}
```

## bench:handling — antes

```
{
  assisted: {
    completed: true,
    seconds: 32.016666666666666,
    maxDistance: 1.3170012927910473,
    peakSlip: 0.06622647927872789,
    offRoadFraction: 0
  },
  previousArcade: {
    completed: false,
    seconds: 90,
    maxDistance: 11.165846377193773,
    peakSlip: 1.500588349624453,
    offRoadFraction: 0.07740740740740741
  }
}
```

## bench:handling — depois

```
{
  assisted: {
    completed: true,
    seconds: 32.016666666666666,
    maxDistance: 1.3170012927910473,
    peakSlip: 0.06622647927872789,
    offRoadFraction: 0
  },
  previousArcade: {
    completed: false,
    seconds: 90,
    maxDistance: 11.165846377193773,
    peakSlip: 1.500588349624453,
    offRoadFraction: 0.07740740740740741
  }
}
```
