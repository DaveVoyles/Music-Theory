# ADR 0001: PixiJS for Circle of Fifths and Fretboard

- **Status:** accepted
- **Date:** 2026-07-25
- **Deciders:** Dave Voyles (grilling + plan 0001 approval)

## Context

The app needs two interactive, hardware-accelerated 2D diagrams: a dual-ring Circle of Fifths and a guitar fretboard. Both require smooth selection animations, hit-testing, and frequent re-highlighting when theory state changes. Candidates included PixiJS, Three.js / React Three Fiber, raw WebGL, and Canvas 2D.

## Decision

Use **PixiJS v8** with React bindings for **both** views.

## Consequences

- **Positive:** 2D-first GPU path, good hit-testing, shared renderer skills across CoF and fretboard, smaller conceptual load than a full 3D scene graph.
- **Negative:** Less natural if a future 3D neck/camera product direction appears; would need a separate Three.js path later.
- **Neutral:** React wrappers and Pixi lifecycle (resize, destroy) must be handled carefully to avoid WebGL context leaks on hot reload.

## Alternatives considered

- **Three.js + R3F:** Powerful 3D; unnecessary ceremony for flat theory diagrams.
- **Raw WebGL:** Maximum control; highest implementation cost for v1.
- **Canvas 2D first:** Faster prototype; contradicts the performance requirement.
