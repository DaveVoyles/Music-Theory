# Project Glossary

Domain terms, models, and vocabulary this project uses consistently — in
code, comments, commit messages, and conversation.

| Term | Definition | Notes |
|---|---|---|
| Dual-ring CoF | Circle of Fifths with major keys on the outer ring and relative minors on the inner ring | Click either ring sets global theory mode |
| Focus degree | Optional roman-numeral filter (I–vii°) that restricts fretboard chord-tone emphasis | Cleared via re-select or “All” |
| Minor form | Natural, harmonic, or melodic minor variant affecting scale degrees 6 and/or 7 | UI control only when mode is minor; default natural |
| Power-chord emphasis | Stronger visual weight on Low E, A, and D strings for root-fifth practice | Standard EADGBE neck; frets 0–12 |
| SongAnalyzerProvider | Swappable analysis backend returning a domain song-analysis DTO | Mock for v1; Http later (ADR 0002, 0003) |
| Theory store | Zustand single source of truth for key, mode, minor form, focus degree, and analysis-driven jumps | Persisted to localStorage (theory UI only) |
