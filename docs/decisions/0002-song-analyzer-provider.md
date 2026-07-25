# ADR 0002: SongAnalyzerProvider Domain Contract

- **Status:** accepted
- **Date:** 2026-07-25
- **Deciders:** Dave Voyles (grilling + plan 0001 approval)

## Context

Song analysis must support local LLM gateways and cloud providers without rewriting UI. The app is hosted on **GitHub Pages** (static bundle only). Vendor SDKs and API keys must not be hard-wired into the client.

## Decision

Define a **SongAnalyzerProvider** interface that returns a **domain DTO** (title, primary key/mode, section timeline with chord symbols, roman functions, borrowed flags). Implementations:

- **MockProvider** — fixture songs for v1 UI and sync validation
- **HttpProvider** — POST/GET to a configurable base URL (local gateway or cloud proxy)

UI and Zustand store depend only on the DTO, never on raw chat completions.

## Consequences

- **Positive:** Swap backends without UI churn; testable offline; secrets stay on the gateway, not in the static bundle.
- **Negative:** Gateways must speak (or adapt to) the domain contract; pure OpenAI-shaped responses need a thin adapter server-side or client-side mapper.
- **Security:** Never bake LLM API keys into client env for GH Pages. Public base URL or user-entered gateway only.

## Alternatives considered

- **Direct OpenAI-compatible client only:** Couples UI to chat message shapes.
- **Client-side heuristics only:** Fully offline but fails the “type a song title” AI path.
- **Hardcoded vendor SDK:** Breaks modularity and secret hygiene on static hosting.
