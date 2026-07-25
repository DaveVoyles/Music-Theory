# `src/help/` — in-app feature explanations

Educational copy shown when users hover/focus **?** help controls.

| File | Role |
|------|------|
| `featureHelp.ts` | Catalog of What / How it works / Try this for each surface |
| `featureHelp.test.ts` | Ensures core features have non-empty copy |

UI: `components/HelpTip.tsx` (`HelpTip`, `FeatureHeading`).

## Adding help for a new control

1. Add an entry to `FEATURE_HELP` in `featureHelp.ts`.
2. Render `<HelpTip feature="yourId" />` next to the control label (or use `FeatureHeading`).
3. Keep copy practical: theory concept + what *this app* does + one concrete try-step.
