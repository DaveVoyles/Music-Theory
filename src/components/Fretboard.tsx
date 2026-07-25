import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'
import { useEffect, useRef } from 'react'
import {
  FRET_COUNT,
  OPEN_STRING_NAMES,
  buildNeck,
  type FretCell,
} from '../fretboard/neck'
import { theoryAudio } from '../audio'
import { toKeyRef, useTheoryStore } from '../store'
import type { PitchClass } from '../theory'

const WIDTH = 720
const HEIGHT = 220
const PAD_L = 48
const PAD_R = 16
const PAD_T = 28
const PAD_B = 24

const labelStyle = new TextStyle({
  fill: '#e8ecf1',
  fontSize: 11,
  fontWeight: '600',
  fontFamily: 'system-ui, sans-serif',
})
const rootStyle = new TextStyle({
  fill: '#0d0f12',
  fontSize: 11,
  fontWeight: '700',
  fontFamily: 'system-ui, sans-serif',
})
const fretNumStyle = new TextStyle({
  fill: '#8b95a5',
  fontSize: 10,
  fontFamily: 'system-ui, sans-serif',
})
const stringNameStyle = new TextStyle({
  fill: '#8b95a5',
  fontSize: 11,
  fontWeight: '600',
  fontFamily: 'system-ui, sans-serif',
})

function layout() {
  const innerW = WIDTH - PAD_L - PAD_R
  const innerH = HEIGHT - PAD_T - PAD_B
  const fretW = innerW / FRET_COUNT
  const stringGap = innerH / 5 // 6 strings → 5 gaps (low E at bottom)
  return { innerW, innerH, fretW, stringGap }
}

function stringY(stringIndex: number, stringGap: number): number {
  // stringIndex 0 = low E at bottom
  return PAD_T + (5 - stringIndex) * stringGap
}

function fretX(fret: number, fretW: number): number {
  // open notes sit just left of fret 1; fretted notes centered in fret cell
  if (fret === 0) return PAD_L - 14
  return PAD_L + (fret - 0.5) * fretW
}

function drawNeckChrome(g: Graphics) {
  const { fretW, stringGap } = layout()
  g.clear()

  // Fingerboard background
  g.rect(PAD_L, PAD_T - 8, FRET_COUNT * fretW, 5 * stringGap + 16)
  g.fill({ color: 0x1a1f27, alpha: 0.95 })

  // Nut
  g.rect(PAD_L - 3, PAD_T - 8, 4, 5 * stringGap + 16)
  g.fill({ color: 0xe8ecf1, alpha: 0.85 })

  // Frets
  for (let f = 1; f <= FRET_COUNT; f++) {
    const x = PAD_L + f * fretW
    g.moveTo(x, PAD_T - 6)
    g.lineTo(x, PAD_T + 5 * stringGap + 6)
    g.stroke({ width: f === 12 ? 2 : 1, color: 0x5a6575, alpha: 0.9 })
  }

  // Strings — Low E/A/D thicker
  for (let s = 0; s < 6; s++) {
    const y = stringY(s, stringGap)
    const power = s <= 2
    g.moveTo(PAD_L, y)
    g.lineTo(PAD_L + FRET_COUNT * fretW, y)
    g.stroke({
      width: power ? 2.4 : 1.2,
      color: power ? 0xb8c0cc : 0x6b7585,
      alpha: 0.95,
    })
  }

  // Inlay dots on frets 3,5,7,9,12
  for (const f of [3, 5, 7, 9, 12]) {
    const x = PAD_L + (f - 0.5) * fretW
    const midY = PAD_T + 2.5 * stringGap
    if (f === 12) {
      g.circle(x, midY - 14, 3.5)
      g.fill({ color: 0x5eead4, alpha: 0.35 })
      g.circle(x, midY + 14, 3.5)
      g.fill({ color: 0x5eead4, alpha: 0.35 })
    } else {
      g.circle(x, midY, 3.5)
      g.fill({ color: 0x5eead4, alpha: 0.28 })
    }
  }
}

function drawCells(
  layer: Container,
  cells: FretCell[],
  onNote: (pc: PitchClass) => void,
) {
  layer.removeChildren()
  const { fretW, stringGap } = layout()

  for (const cell of cells) {
    const x = fretX(cell.fret, fretW)
    const y = stringY(cell.stringIndex, stringGap)

    if (!cell.isDiatonic) {
      // dark non-diatonic tick
      const g = new Graphics()
      g.circle(x, y, cell.powerEmphasis ? 3.5 : 2.5)
      g.fill({ color: 0x0d0f12, alpha: 0.55 })
      layer.addChild(g)
      continue
    }

    // When focus is on, non-chord tones are dimmed diatonic labels
    const active = cell.isChordTone
    const r = cell.isRoot ? 12 : cell.powerEmphasis ? 10 : 8
    const g = new Graphics()
    if (cell.isRoot) {
      g.circle(x, y, r)
      g.fill({ color: 0xfbbf24, alpha: active ? 1 : 0.35 })
    } else {
      g.circle(x, y, r)
      g.fill({
        color: cell.powerEmphasis ? 0x2dd4bf : 0x3d4a5c,
        alpha: active ? (cell.powerEmphasis ? 0.95 : 0.85) : 0.25,
      })
      g.stroke({
        width: 1,
        color: cell.powerEmphasis ? 0x5eead4 : 0x5a6575,
        alpha: active ? 0.9 : 0.3,
      })
    }
    g.eventMode = 'static'
    g.cursor = 'pointer'
    g.on('pointertap', () => onNote(cell.pc))
    layer.addChild(g)

    if (cell.spelling && active) {
      const t = new Text({
        text: cell.spelling,
        style: cell.isRoot ? rootStyle : labelStyle,
      })
      t.anchor.set(0.5)
      t.position.set(x, y)
      t.eventMode = 'none'
      layer.addChild(t)
    }
  }
}

function drawGuides(layer: Container) {
  layer.removeChildren()
  const { fretW, stringGap } = layout()
  for (let s = 0; s < 6; s++) {
    const t = new Text({ text: OPEN_STRING_NAMES[s]!, style: stringNameStyle })
    t.anchor.set(1, 0.5)
    t.position.set(PAD_L - 10, stringY(s, stringGap))
    layer.addChild(t)
  }
  for (let f = 1; f <= FRET_COUNT; f++) {
    if (![3, 5, 7, 9, 12].includes(f)) continue
    const t = new Text({ text: String(f), style: fretNumStyle })
    t.anchor.set(0.5, 0)
    t.position.set(PAD_L + (f - 0.5) * fretW, HEIGHT - PAD_B + 4)
    layer.addChild(t)
  }
}

/**
 * Pixi fretboard: EADGBE frets 0–12, diatonic labels, root emphasis, E/A/D weight.
 * Reacts instantly to theory store key / focusDegree.
 */
export function Fretboard() {
  const hostRef = useRef<HTMLDivElement>(null)
  const chromeRef = useRef<Graphics | null>(null)
  const cellsRef = useRef<Container | null>(null)
  const readyRef = useRef(false)

  const key = useTheoryStore((s) => s.key)
  const keySpelling = useTheoryStore((s) => s.keySpelling)
  const mode = useTheoryStore((s) => s.mode)
  const minorForm = useTheoryStore((s) => s.minorForm)
  const focusDegree = useTheoryStore((s) => s.focusDegree)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    let cancelled = false
    const app = new Application()

    void (async () => {
      await app.init({
        width: WIDTH,
        height: HEIGHT,
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

      const chrome = new Graphics()
      drawNeckChrome(chrome)
      app.stage.addChild(chrome)
      chromeRef.current = chrome

      const guides = new Container()
      drawGuides(guides)
      app.stage.addChild(guides)

      const cells = new Container()
      app.stage.addChild(cells)
      cellsRef.current = cells
      readyRef.current = true

      const onNote = (pc: PitchClass) => {
        void theoryAudio.playPitch(pc)
      }
      const state = useTheoryStore.getState()
      const neck = buildNeck(toKeyRef(state), state.focusDegree)
      drawCells(cells, neck, onNote)
    })()

    return () => {
      cancelled = true
      readyRef.current = false
      cellsRef.current = null
      chromeRef.current = null
      app.destroy(true)
    }
  }, [])

  useEffect(() => {
    if (!readyRef.current || !cellsRef.current) return
    const keyRef = {
      tonic: key,
      tonicSpelling: keySpelling,
      mode,
      minorForm,
    }
    const onNote = (pc: PitchClass) => {
      void theoryAudio.playPitch(pc)
    }
    drawCells(cellsRef.current, buildNeck(keyRef, focusDegree), onNote)
  }, [key, keySpelling, mode, minorForm, focusDegree])

  return (
    <div
      className="fretboard-root"
      ref={hostRef}
      aria-label="Guitar fretboard map"
      role="img"
    />
  )
}

export default Fretboard
