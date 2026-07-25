# ADR 0003: Phased Analyzer — Fixtures Before Live Gateway

- **Status:** accepted
- **Date:** 2026-07-25
- **Deciders:** Dave Voyles (grilling + plan 0001 approval)

## Context

Full live song analysis requires a network LLM boundary and is the main architectural risk on a static GitHub Pages host. Visual theory tools (Circle, fretboard, audio) deliver standalone value without that boundary.

## Decision

**Phase v1:** ship visual + audio + a real Analyzer **panel** backed by **MockProvider** (2–3 fixture songs) so section → key jumps prove the DTO → store → Pixi path.

**Phase v1.1+:** enable **HttpProvider** against a local or cloud gateway without redesigning UI.

## Consequences

- **Positive:** GH Pages ships fully useful offline-capable theory tools; analyzer architecture is validated end-to-end with fixtures; lower risk first release.
- **Negative:** Title search only hits fixtures until a gateway is configured; users may expect live search immediately.
- **Follow-up:** Document gateway URL configuration and sample request/response for HttpProvider.

## Alternatives considered

- **Full product in one pass:** Requires live gateway day one; higher risk.
- **Visualizer-only, no analyzer UI:** Delays proving the provider interface in the real shell.
- **Analyzer-first spike:** Inverts the product’s visual focus.
