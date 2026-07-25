# `src/analyzer/` — song analysis providers

Modular analysis backend (ADR 0002 / 0003). UI depends only on the **domain DTO**.

## Contents

| File | Role |
|------|------|
| `types.ts` | `SongAnalysis`, `AnalysisSection`, `SongAnalyzerProvider` |
| `fixtures.ts` | 3 offline fixture songs (Hotel California, Creep, Nothing Else Matters) |
| `MockProvider.ts` | Search + load fixtures (v1 default) |
| `HttpProvider.ts` | Configurable `baseUrl` only — **no API keys** |
| `index.ts` | Barrel |
| `analyzer.test.ts` | Mock search/DTO + Http URL construction |

## Provider interface

```ts
interface SongAnalyzerProvider {
  search(query: string): Promise<SongAnalysisSummary[]>
  getAnalysis(id: string): Promise<SongAnalysis>
}
```

DTO includes title, primary key/mode, and section timeline (chords, romans, borrowed flag, section key).

## Security

- **Never** put LLM/API secrets in Vite env baked into the static bundle.
- `HttpProvider` is for a **public gateway URL** or user-entered local proxy.

## Extending

- Swap UI to `HttpProvider({ baseUrl })` when a gateway speaks the DTO.
- Add fixtures in `fixtures.ts` for offline demos.
- Panel UI: `components/AnalyzerPanel.tsx` (currently hard-wired to `MockProvider`).
