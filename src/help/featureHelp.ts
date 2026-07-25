/**
 * In-app feature copy for hover/focus help.
 * Keep educational and practical — what it is, how it works here, what to try.
 */

export interface FeatureHelp {
  /** Short label shown in the UI */
  title: string
  /** One-line “what is this?” */
  what: string
  /** How this control behaves in the app */
  how: string
  /** Concrete action for the user */
  tryThis: string
}

export const FEATURE_HELP = {
  app: {
    title: 'Music Theory workspace',
    what: 'A synced practice space: key, neck map, sound, and song sections all follow one theory state.',
    how: 'Changing the key on the Circle or in the Analyzer updates the fretboard, roman focus, and triad sound together.',
    tryThis: 'Click a major key on the outer circle, then look at which notes light up on the neck.',
  },
  keyBadge: {
    title: 'Current key',
    what: 'The global key (and minor form / degree focus) driving the whole workspace.',
    how: 'Set by the Circle of Fifths or Analyzer sections. Persists in this browser via localStorage.',
    tryThis: 'Switch keys a few times, reload the page — your last key should come back.',
  },
  keyLesson: {
    title: 'Key signature lesson',
    what: 'How many sharps or flats the current key uses, which notes they are, and why — tied to the Circle of Fifths.',
    how: 'Updates live when you change key. Shows the accidental list in staff order, the scale with accidentals highlighted, a short “why” (fifths from C), a mnemonic for the order of sharps/flats, and the relative major/minor pair that share this signature.',
    tryThis: 'Click C (0 accidentals), then G (1 sharp: F#), then D (2 sharps), then F (1 flat: Bb). Watch the count climb as you walk the circle.',
  },
  circleOfFifths: {
    title: 'Circle of Fifths',
    what: 'A map of keys arranged by fifths. Neighbors share almost all notes; opposites are farthest away. Clockwise adds sharps; counter-clockwise adds flats.',
    how: 'Outer ring = major keys. Inner ring = relative minors (same key signature, different tonic). Click a wedge to set the global key; the matching major/minor pair stays highlighted. Click also plays the tonic triad. Read the Key signature lesson below for the accidental count and why.',
    tryThis: 'Click C (outer), then walk clockwise G → D → A and count sharps in the lesson panel (1, 2, 3).',
  },
  romanStrip: {
    title: 'Roman-numeral degrees',
    what: 'Scale degrees I–vii° name chords built on each step of the current key (e.g. V = dominant).',
    how: 'Selecting a degree filters the fretboard to that chord’s tones, opens the Degree function lesson, and plays the degree triad. “All” or tapping the same degree again clears the filter (no sound on clear).',
    tryThis: 'In C major, tap V — hear G–B–D, neck filters, lesson explains dominant function.',
  },
  degreeLesson: {
    title: 'Degree function lesson',
    what: 'What each scale degree does in the key: tonic / subdominant / dominant roles, the triad notes, and why it pulls the way it does.',
    how: 'Follows the roman strip. Selecting a degree also plays its triad (ear training). Use “Hear triad” to replay. Minor form changes V/vii quality, copy, and sound.',
    tryThis: 'In C major: tap I (home), then V (tension), then I again — listen and read Why. Then try ii → V → I.',
  },
  quiz: {
    title: 'Theory quiz',
    what: 'Active-recall drills on key signatures and degree functions — the same facts the lesson panels teach.',
    how: 'Answer multiple choice (count of sharps/flats, which accidentals, degree names, chord tones). After each answer you get an explanation. “Show on workspace” jumps the Circle, neck, and lessons to that key/degree.',
    tryThis: 'Miss one on purpose, read the explain text, hit Show on workspace, then Next question.',
  },
  minorForm: {
    title: 'Minor form',
    what: 'Three common minor scale flavors that differ on degrees 6 and/or 7.',
    how: 'Visible only in minor keys. Natural = pure minor; harmonic raises 7 (strong V chord); melodic raises 6 and 7 (smoother ascending lines). The neck and triads update immediately.',
    tryThis: 'Select A minor, switch Harmonic — look for G# on the neck instead of G.',
  },
  fretboard: {
    title: 'Guitar fretboard',
    what: 'Standard tuning (EADGBE), open string through fret 12, showing where the current key lives on the neck.',
    how: 'Diatonic notes are labeled; the root is gold; non-diatonic frets stay dark. Low E, A, and D strings are drawn stronger for power-chord / root-fifth practice. Click a lit note to hear its pitch.',
    tryThis: 'Change the Circle to G major — F# should appear; F natural should go dark.',
  },
  analyzer: {
    title: 'Song analyzer',
    what: 'A modular panel that loads song structure (sections, chords, romans) from a provider — fixtures for now, HTTP gateway later.',
    how: 'Search and open a fixture song, then click a section to jump the workspace key/mode to that section. Degree focus clears on jump so the neck matches the new key.',
    tryThis: 'Open “Hotel California”, click Chorus — key should move (e.g. toward D major) and the Circle/neck follow.',
  },
  analyzerSong: {
    title: 'Fixture song',
    what: 'An offline demo analysis (title, primary key, section timeline).',
    how: 'Selecting a song loads its sections and sets the primary key as the workspace key.',
    tryThis: 'Pick any song, then click through its sections in order.',
  },
  analyzerSection: {
    title: 'Song section',
    what: 'A chunk of the form (intro, verse, chorus, …) with its local key and harmony.',
    how: 'Click to set the global key from this section’s key. Chords and roman numerals are listed for context; borrowed flags mark non-diatonic color.',
    tryThis: 'Compare Verse vs Chorus keys on the same song and watch the neck re-label.',
  },
} as const satisfies Record<string, FeatureHelp>

export type FeatureHelpId = keyof typeof FEATURE_HELP
