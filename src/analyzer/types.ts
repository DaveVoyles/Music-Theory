import type { Mode, NoteSpelling, PitchClass } from '../theory'

/** Domain song-analysis DTO (ADR 0002). */
export interface SongAnalysis {
  id: string
  title: string
  artist?: string
  primaryKey: {
    spelling: NoteSpelling
    pc: PitchClass
    mode: Mode
  }
  sections: AnalysisSection[]
}

export interface AnalysisSection {
  id: string
  name: string
  /** Optional start label for timeline display (e.g. "0:00"). */
  startLabel?: string
  key: {
    spelling: NoteSpelling
    pc: PitchClass
    mode: Mode
  }
  chords: string[]
  romans: string[]
  /** True when the section uses non-diatonic / borrowed harmony. */
  borrowed: boolean
}

export interface SongAnalyzerProvider {
  /** List/search fixture or remote songs. */
  search(query: string): Promise<SongAnalysisSummary[]>
  /** Load full analysis for a song id. */
  getAnalysis(id: string): Promise<SongAnalysis>
}

export interface SongAnalysisSummary {
  id: string
  title: string
  artist?: string
  primaryKeyLabel: string
}
