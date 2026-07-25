import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'
import { useEffect, useRef } from 'react'
import {
  FRET_COUNT,
  OPEN_STRING_NAMES,
  buildNeck,
  midiAt,
  type FretCell,
} from '../fretboard/neck'
import { theoryAudio } from '../audio'
import { toKeyRef, useTheoryStore, type NeckLabelMode } from '../store'
import type { PitchPick } from '../theory'

const CHROMATIC_SPELLINGS = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

/** Minimum drawable size — below this we wait for a real layout. */
const MIN_W = 320
const MIN_H = 160

interface LayoutMetrics {
  width: number
  height: number
  padL: number
  padR: number
  padT: number
  padB: number
  fretW: number
  stringGap: number
  /** Scale factor vs a ~1000×420 reference for fonts/radii. */
  scale: number
}

function computeLayout(width: number, height: number): LayoutMetrics {
  // Scale dots/labels with both width and height so a tall wide neck is readable.
  const scale = Math.min(
    Math.max(width / 900, height / 300, 0.95),
    2.5,
  )
  const padL = Math.round(60 * scale)
  const padR = Math.round(22 * scale)
  const padT = Math.round(42 * scale)
  const padB = Math.round(40 * scale)
  const innerW = width - padL - padR
  const innerH = height - padT - padB
  const fretW = innerW / FRET_COUNT
  const stringGap = innerH / 5 // 6 strings → 5 gaps (low E at bottom)
  return { width, height, padL, padR, padT, padB, fretW, stringGap, scale }
}

function stringY(stringIndex: number, m: LayoutMetrics): number {
  // stringIndex 0 = low E at bottom
  return m.padT + (5 - stringIndex) * m.stringGap
}

function fretX(fret: number, m: LayoutMetrics): number {
  // open notes sit just left of fret 1; fretted notes centered in fret cell
  if (fret === 0) return m.padL - Math.round(16 * m.scale)
  return m.padL + (fret - 0.5) * m.fretW
}

function makeStyles(scale: number) {
  const noteSize = Math.round(15 * scale)
  const guideSize = Math.round(14 * scale)
  const fretSize = Math.round(13 * scale)
  return {
    onAccent: new TextStyle({
      fill: '#042f2e',
      fontSize: noteSize,
      fontWeight: '700',
      fontFamily: 'system-ui, sans-serif',
    }),
    root: new TextStyle({
      fill: '#1c1408',
      fontSize: noteSize,
      fontWeight: '700',
      fontFamily: 'system-ui, sans-serif',
    }),
    fretNum: new TextStyle({
      fill: '#a8b2c1',
      fontSize: fretSize,
      fontFamily: 'system-ui, sans-serif',
    }),
    stringName: new TextStyle({
      fill: '#a8b2c1',
      fontSize: guideSize,
      fontWeight: '600',
      fontFamily: 'system-ui, sans-serif',
    }),
  }
}

function drawNeckChrome(g: Graphics, m: LayoutMetrics) {
  g.clear()
  const boardH = 5 * m.stringGap + Math.round(20 * m.scale)
  const boardTop = m.padT - Math.round(10 * m.scale)

  // Fingerboard background
  g.rect(m.padL, boardTop, FRET_COUNT * m.fretW, boardH)
  g.fill({ color: 0x1a1f27, alpha: 0.95 })

  // Nut
  g.rect(m.padL - 3, boardTop, Math.max(4, Math.round(5 * m.scale)), boardH)
  g.fill({ color: 0xe8ecf1, alpha: 0.85 })

  // Frets
  for (let f = 1; f <= FRET_COUNT; f++) {
    const x = m.padL + f * m.fretW
    g.moveTo(x, boardTop + 2)
    g.lineTo(x, boardTop + boardH - 2)
    g.stroke({
      width: f === 12 ? Math.max(2, 2.5 * m.scale) : Math.max(1, 1.25 * m.scale),
      color: 0x5a6575,
      alpha: 0.9,
    })
  }

  // Strings — Low E/A/D thicker (power-string emphasis, not color meaning)
  for (let s = 0; s < 6; s++) {
    const y = stringY(s, m)
    const power = s <= 2
    g.moveTo(m.padL, y)
    g.lineTo(m.padL + FRET_COUNT * m.fretW, y)
    g.stroke({
      width: power ? 3.2 * m.scale : 1.6 * m.scale,
      color: power ? 0xb8c0cc : 0x6b7585,
      alpha: 0.95,
    })
  }

  // Inlay dots on frets 3,5,7,9,12
  const inlayR = Math.max(3.5, 5 * m.scale)
  for (const f of [3, 5, 7, 9, 12]) {
    const x = m.padL + (f - 0.5) * m.fretW
    const midY = m.padT + 2.5 * m.stringGap
    if (f === 12) {
      const offset = Math.round(20 * m.scale)
      g.circle(x, midY - offset, inlayR)
      g.fill({ color: 0x5eead4, alpha: 0.35 })
      g.circle(x, midY + offset, inlayR)
      g.fill({ color: 0x5eead4, alpha: 0.35 })
    } else {
      g.circle(x, midY, inlayR)
      g.fill({ color: 0x5eead4, alpha: 0.28 })
    }
  }
}

function cellLabel(cell: FretCell, labelMode: NeckLabelMode): string | null {
  if (!cell.isDiatonic || !cell.isChordTone) return null
  if (labelMode === 'degrees') {
    return cell.scaleDegree !== null ? String(cell.scaleDegree) : null
  }
  return cell.spelling
}

function isIntervalPick(cell: FretCell, a: PitchPick | null, b: PitchPick | null): boolean {
  return (
    (a !== null && cell.pc === a.pc) || (b !== null && cell.pc === b.pc)
  )
}

function drawCells(
  layer: Container,
  cells: FretCell[],
  m: LayoutMetrics,
  styles: ReturnType<typeof makeStyles>,
  labelMode: NeckLabelMode,
  intervalA: PitchPick | null,
  intervalB: PitchPick | null,
  onNote: (cell: FretCell) => void,
) {
  layer.removeChildren()

  for (const cell of cells) {
    const x = fretX(cell.fret, m)
    const y = stringY(cell.stringIndex, m)
    const picked = isIntervalPick(cell, intervalA, intervalB)

    if (!cell.isDiatonic) {
      // dark non-diatonic tick — outside the key (still clickable for intervals)
      const g = new Graphics()
      const r = (picked ? 7 : cell.powerEmphasis ? 4.5 : 3.5) * m.scale
      g.circle(x, y, r)
      g.fill({
        color: picked ? 0x818cf8 : 0x0d0f12,
        alpha: picked ? 0.9 : 0.55,
      })
      if (picked) {
        g.stroke({ width: 1.5 * m.scale, color: 0xc7d2fe, alpha: 1 })
      }
      g.eventMode = 'static'
      g.cursor = 'pointer'
      g.on('pointertap', () => onNote(cell))
      layer.addChild(g)
      continue
    }

    // Gold = root (tonic). Teal/green = in the key (scale tones).
    // When a degree is focused, non-chord tones stay dimmed.
    // Violet ring = currently in the interval pick pair.
    const active = cell.isChordTone
    const r =
      (cell.isRoot ? 16 : cell.powerEmphasis ? 14 : 12) * m.scale
    const g = new Graphics()
    if (cell.isRoot) {
      g.circle(x, y, r)
      g.fill({ color: 0xfbbf24, alpha: active ? 1 : 0.35 })
    } else {
      g.circle(x, y, r)
      g.fill({
        color: 0x2dd4bf,
        alpha: active ? 0.95 : 0.28,
      })
      g.stroke({
        width: 1.4 * m.scale,
        color: 0x5eead4,
        alpha: active ? 0.95 : 0.35,
      })
    }
    if (picked) {
      g.circle(x, y, r + 3.5 * m.scale)
      g.stroke({ width: 2.2 * m.scale, color: 0xa5b4fc, alpha: 1 })
    }
    g.eventMode = 'static'
    g.cursor = 'pointer'
    g.on('pointertap', () => onNote(cell))
    layer.addChild(g)

    const label = cellLabel(cell, labelMode)
    if (label) {
      const t = new Text({
        text: label,
        style: cell.isRoot ? styles.root : styles.onAccent,
      })
      t.anchor.set(0.5)
      t.position.set(x, y)
      t.eventMode = 'none'
      layer.addChild(t)
    }
  }
}

function drawGuides(
  layer: Container,
  m: LayoutMetrics,
  styles: ReturnType<typeof makeStyles>,
) {
  layer.removeChildren()
  for (let s = 0; s < 6; s++) {
    const t = new Text({ text: OPEN_STRING_NAMES[s]!, style: styles.stringName })
    t.anchor.set(1, 0.5)
    t.position.set(m.padL - Math.round(12 * m.scale), stringY(s, m))
    layer.addChild(t)
  }
  for (let f = 1; f <= FRET_COUNT; f++) {
    if (![3, 5, 7, 9, 12].includes(f)) continue
    const t = new Text({ text: String(f), style: styles.fretNum })
    t.anchor.set(0.5, 0)
    t.position.set(m.padL + (f - 0.5) * m.fretW, m.height - m.padB + 4)
    layer.addChild(t)
  }
}

/**
 * Pixi fretboard: EADGBE frets 0–12.
 * Gold = root (tonic); teal = notes in the key; dark = outside the key.
 * Labels toggle notes vs scale degrees; clicks feed the interval lesson.
 * Fills its host container and redraws on resize.
 */
export function Fretboard() {
  const hostRef = useRef<HTMLDivElement>(null)
  const appRef = useRef<Application | null>(null)
  const chromeRef = useRef<Graphics | null>(null)
  const guidesRef = useRef<Container | null>(null)
  const cellsRef = useRef<Container | null>(null)
  const layoutRef = useRef<LayoutMetrics | null>(null)
  const stylesRef = useRef<ReturnType<typeof makeStyles> | null>(null)
  const readyRef = useRef(false)

  const key = useTheoryStore((s) => s.key)
  const keySpelling = useTheoryStore((s) => s.keySpelling)
  const mode = useTheoryStore((s) => s.mode)
  const minorForm = useTheoryStore((s) => s.minorForm)
  const focusDegree = useTheoryStore((s) => s.focusDegree)
  const neckLabelMode = useTheoryStore((s) => s.neckLabelMode)
  const intervalA = useTheoryStore((s) => s.intervalA)
  const intervalB = useTheoryStore((s) => s.intervalB)
  const toggleNeckLabelMode = useTheoryStore((s) => s.toggleNeckLabelMode)

  const paintCells = () => {
    if (!readyRef.current || !cellsRef.current || !layoutRef.current || !stylesRef.current)
      return
    const state = useTheoryStore.getState()
    const onNote = (cell: FretCell) => {
      const spelling =
        cell.spelling ?? CHROMATIC_SPELLINGS[cell.pc] ?? String(cell.pc)
      state.pickIntervalNote({ pc: cell.pc, spelling })
      // Real guitar register: low E open = E2 … high e open = E4.
      void theoryAudio.playMidi(midiAt(cell.stringIndex, cell.fret))
    }
    drawCells(
      cellsRef.current,
      buildNeck(toKeyRef(state), state.focusDegree),
      layoutRef.current,
      stylesRef.current,
      state.neckLabelMode,
      state.intervalA,
      state.intervalB,
      onNote,
    )
  }

  const paintAll = (width: number, height: number) => {
    const app = appRef.current
    const chrome = chromeRef.current
    const guides = guidesRef.current
    if (!app || !chrome || !guides) return

    const w = Math.max(MIN_W, Math.floor(width))
    const h = Math.max(MIN_H, Math.floor(height))
    app.renderer.resize(w, h)

    const m = computeLayout(w, h)
    layoutRef.current = m
    stylesRef.current = makeStyles(m.scale)

    drawNeckChrome(chrome, m)
    drawGuides(guides, m, stylesRef.current)
    paintCells()
  }

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    let ro: ResizeObserver | null = null
    const app = new Application()

    void (async () => {
      // Start with host size if already laid out; otherwise a sensible default.
      const rect = host.getBoundingClientRect()
      const initW = Math.max(MIN_W, Math.floor(rect.width) || 1000)
      const initH = Math.max(MIN_H, Math.floor(rect.height) || 420)

      await app.init({
        width: initW,
        height: initH,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })
      if (cancelled) {
        app.destroy(true)
        return
      }

      host.replaceChildren(app.canvas)
      // Canvas fills the host; drawing follows content-box size via resize.
      app.canvas.style.width = '100%'
      app.canvas.style.height = '100%'
      app.canvas.style.display = 'block'

      const chrome = new Graphics()
      app.stage.addChild(chrome)
      chromeRef.current = chrome

      const guides = new Container()
      app.stage.addChild(guides)
      guidesRef.current = guides

      const cells = new Container()
      app.stage.addChild(cells)
      cellsRef.current = cells

      appRef.current = app
      readyRef.current = true

      paintAll(initW, initH)

      ro = new ResizeObserver((entries) => {
        const entry = entries[0]
        if (!entry || cancelled) return
        const { width, height } = entry.contentRect
        if (width < 40 || height < 40) return
        paintAll(width, height)
      })
      ro.observe(host)
    })()

    return () => {
      cancelled = true
      readyRef.current = false
      ro?.disconnect()
      cellsRef.current = null
      guidesRef.current = null
      chromeRef.current = null
      appRef.current = null
      layoutRef.current = null
      stylesRef.current = null
      app.destroy(true)
    }
  }, [])

  useEffect(() => {
    paintCells()
  }, [
    key,
    keySpelling,
    mode,
    minorForm,
    focusDegree,
    neckLabelMode,
    intervalA,
    intervalB,
  ])

  return (
    <div className="fretboard-wrap">
      <div className="fretboard-toolbar">
        <div className="fretboard-label-toggle" role="group" aria-label="Neck label mode">
          <button
            type="button"
            className={`fretboard-toggle-btn${neckLabelMode === 'notes' ? ' is-active' : ''}`}
            aria-pressed={neckLabelMode === 'notes'}
            onClick={() => {
              if (neckLabelMode !== 'notes') toggleNeckLabelMode()
            }}
          >
            Note names
          </button>
          <button
            type="button"
            className={`fretboard-toggle-btn${neckLabelMode === 'degrees' ? ' is-active' : ''}`}
            aria-pressed={neckLabelMode === 'degrees'}
            onClick={() => {
              if (neckLabelMode !== 'degrees') toggleNeckLabelMode()
            }}
          >
            Degrees 1–7
          </button>
        </div>
        <p className="fretboard-toolbar-hint">
          Click two frets to measure an interval
        </p>
      </div>
      <div
        className="fretboard-root"
        ref={hostRef}
        aria-label="Guitar fretboard map"
        role="img"
      />
      <ul className="fretboard-legend" aria-label="Fretboard color legend">
        <li>
          <span className="fretboard-swatch fretboard-swatch--root" aria-hidden />
          <span>
            <strong>Gold</strong> = root (tonic of {keySpelling} {mode})
          </span>
        </li>
        <li>
          <span className="fretboard-swatch fretboard-swatch--scale" aria-hidden />
          <span>
            <strong>Green</strong> = notes in the key
            {focusDegree !== null ? ' (dimmed = not this chord)' : ''}
            {neckLabelMode === 'degrees' ? ' · labels are scale degrees' : ''}
          </span>
        </li>
        <li>
          <span className="fretboard-swatch fretboard-swatch--out" aria-hidden />
          <span>
            <strong>Dark</strong> = outside the key
          </span>
        </li>
        <li>
          <span className="fretboard-swatch fretboard-swatch--pick" aria-hidden />
          <span>
            <strong>Violet ring</strong> = interval pick
          </span>
        </li>
      </ul>
    </div>
  )
}

export default Fretboard
