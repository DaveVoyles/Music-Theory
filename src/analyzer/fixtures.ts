import type { SongAnalysis } from './types'

/** 3 fixture songs for MockProvider (plan 0001 D8 / ADR 0003). */
export const FIXTURE_SONGS: SongAnalysis[] = [
  {
    id: 'fixture-hotel-california',
    title: 'Hotel California',
    artist: 'Eagles',
    primaryKey: { spelling: 'B', pc: 11, mode: 'minor' },
    sections: [
      {
        id: 'hc-intro',
        name: 'Intro',
        startLabel: '0:00',
        key: { spelling: 'B', pc: 11, mode: 'minor' },
        chords: ['Bm', 'F#', 'A', 'E', 'G', 'D', 'Em', 'F#'],
        romans: ['i', 'V', 'VII', 'IV', 'VI', 'III', 'iv', 'V'],
        borrowed: false,
      },
      {
        id: 'hc-verse',
        name: 'Verse',
        startLabel: '0:52',
        key: { spelling: 'B', pc: 11, mode: 'minor' },
        chords: ['Bm', 'F#', 'A', 'E'],
        romans: ['i', 'V', 'VII', 'IV'],
        borrowed: false,
      },
      {
        id: 'hc-chorus',
        name: 'Chorus',
        startLabel: '1:30',
        key: { spelling: 'D', pc: 2, mode: 'major' },
        chords: ['G', 'D', 'F#', 'Bm'],
        romans: ['IV', 'I', 'III', 'vi'],
        borrowed: true,
      },
    ],
  },
  {
    id: 'fixture-creep',
    title: 'Creep',
    artist: 'Radiohead',
    primaryKey: { spelling: 'G', pc: 7, mode: 'major' },
    sections: [
      {
        id: 'creep-verse',
        name: 'Verse',
        startLabel: '0:00',
        key: { spelling: 'G', pc: 7, mode: 'major' },
        chords: ['G', 'B', 'C', 'Cm'],
        romans: ['I', 'III', 'IV', 'iv'],
        borrowed: true,
      },
      {
        id: 'creep-chorus',
        name: 'Chorus',
        startLabel: '0:48',
        key: { spelling: 'G', pc: 7, mode: 'major' },
        chords: ['G', 'B', 'C', 'Cm'],
        romans: ['I', 'III', 'IV', 'iv'],
        borrowed: true,
      },
    ],
  },
  {
    id: 'fixture-nothing-else-matters',
    title: 'Nothing Else Matters',
    artist: 'Metallica',
    primaryKey: { spelling: 'E', pc: 4, mode: 'minor' },
    sections: [
      {
        id: 'nem-intro',
        name: 'Intro',
        startLabel: '0:00',
        key: { spelling: 'E', pc: 4, mode: 'minor' },
        chords: ['Em', 'D', 'C', 'G'],
        romans: ['i', 'VII', 'VI', 'III'],
        borrowed: false,
      },
      {
        id: 'nem-verse',
        name: 'Verse',
        startLabel: '1:00',
        key: { spelling: 'E', pc: 4, mode: 'minor' },
        chords: ['Em', 'D', 'C', 'G', 'B7'],
        romans: ['i', 'VII', 'VI', 'III', 'V'],
        borrowed: false,
      },
    ],
  },
]
