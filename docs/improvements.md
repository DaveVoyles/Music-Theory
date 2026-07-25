# Improvement backlog (post–plan 0001)

Ideas ranked for impact vs. effort. Not committed work — pick via a new plan/issue before implementing.

## High value / clear seams

1. **Wire `HttpProvider` in the UI**  
   Analyzer currently hard-codes `MockProvider`. Add a settings field for gateway base URL (localStorage), toggle Mock vs Http, keep secrets off the client (ADR 0002).

2. **Provider selection + empty gateway states**  
   Friendly errors when Http fails; offline fallback to fixtures.

3. **Accessibility pass**  
   CoF/fretboard are `role="img"` canvases — add keyboard alternatives (key list / note grid) and visible focus rings already present on buttons.

4. **E2E browser test (Playwright)**  
   One smoke: load → click CoF → assert header key text. Complements unit tests; run in CI optionally.

## Product / UX

5. **Degree focus + audio** — play triad (or arpeggio) when selecting a roman degree.  
6. **Fret click octave** — map string+fret to a more realistic octave than fixed C4 band.  
7. **Compact mobile layout** — plan scoped desktop-first; stack order and touch targets need a deliberate pass.  
8. **SPA 404.html → index.html** — if deep links/routes are added later (plan-lenses note).

## Engineering hygiene

9. **Prune unused `public/icons.svg`** if nothing references it.  
10. **Lazy-load Pixi / Tone** — both are heavy; dynamic import on first interaction could shrink initial JS.  
11. **CI cache + Node version pin** already present; add `npm audit` / Dependabot if desired.  
12. **AGENTS.md / CONTRIBUTING.md** in-repo pointer for non-Dave agents cloning only this repo (this README now covers most of that).

## Explicit non-goals (still)

- Baking OpenAI/Anthropic keys into Vite env  
- Full amp sim / sample libraries  
- User accounts / cloud save  

When promoting an item, open a design plan or a labeled issue and keep ADRs updated if architecture shifts.
