import { Application, Container, Graphics, Text, TextStyle } from 'pixi.js'
import { useEffect, useRef } from 'react'
import {
  COF_POSITIONS,
  pairIndexForKey,
  selectionFromWedge,
  wedgeEndAngle,
  wedgeStartAngle,
  type CofPosition,
} from '../cof/circleData'
import { theoryAudio } from '../audio'
import { useTheoryStore } from '../store'
import type { Mode, PitchClass } from '../theory'

const OUTER_R = 150
const OUTER_INNER_R = 100
const INNER_R = 95
const INNER_INNER_R = 48
const SIZE = 360

const brightStyle = new TextStyle({
  fill: '#e8ecf1',
  fontSize: 13,
  fontWeight: '600',
  fontFamily: 'system-ui, sans-serif',
})

const mutedStyle = new TextStyle({
  fill: '#8b95a5',
  fontSize: 12,
  fontWeight: '500',
  fontFamily: 'system-ui, sans-serif',
})

interface WedgeGfx {
  major: Graphics
  minor: Graphics
  majorLabel: Text
  minorLabel: Text
}

function drawWedge(
  g: Graphics,
  start: number,
  end: number,
  outerR: number,
  innerR: number,
  fill: number,
  alpha: number,
  stroke: number,
) {
  g.moveTo(Math.cos(start) * innerR, Math.sin(start) * innerR)
  g.arc(0, 0, outerR, start, end)
  g.lineTo(Math.cos(end) * innerR, Math.sin(end) * innerR)
  g.arc(0, 0, innerR, end, start, true)
  g.closePath()
  g.fill({ color: fill, alpha })
  g.stroke({ width: 1.25, color: stroke, alpha: 0.85 })
}

function labelPos(index: number, radius: number) {
  const a = (index / 12) * Math.PI * 2 - Math.PI / 2
  return { x: Math.cos(a) * radius, y: Math.sin(a) * radius }
}

function paintSelection(
  wedges: Map<number, WedgeGfx>,
  hubMode: Text | null,
  hubKey: Text | null,
  key: PitchClass,
  mode: Mode,
  spelling: string,
) {
  const pair = pairIndexForKey(key, mode)
  for (const pos of COF_POSITIONS) {
    const gfx = wedges.get(pos.index)
    if (!gfx) continue
    const selected = pos.index === pair
    const majorSelected = selected && mode === 'major'
    const minorSelected = selected && mode === 'minor'
    const start = wedgeStartAngle(pos.index)
    const end = wedgeEndAngle(pos.index)

    gfx.major.clear()
    drawWedge(
      gfx.major,
      start,
      end,
      OUTER_R,
      OUTER_INNER_R,
      majorSelected ? 0x2dd4bf : selected ? 0x1e3a36 : 0x1a1f27,
      majorSelected ? 0.95 : selected ? 0.8 : 0.9,
      majorSelected ? 0x5eead4 : selected ? 0x2dd4bf : 0x343c49,
    )

    gfx.minor.clear()
    drawWedge(
      gfx.minor,
      start,
      end,
      INNER_R,
      INNER_INNER_R,
      minorSelected ? 0xfbbf24 : selected ? 0x3a3020 : 0x14181e,
      minorSelected ? 0.95 : selected ? 0.75 : 0.9,
      minorSelected ? 0xfbbf24 : selected ? 0xd4a017 : 0x343c49,
    )

    gfx.majorLabel.style = majorSelected || selected ? brightStyle : mutedStyle
    gfx.minorLabel.style = minorSelected || selected ? brightStyle : mutedStyle

    const scale = majorSelected || minorSelected ? 1.03 : 1
    gfx.major.scale.set(scale)
    gfx.minor.scale.set(scale)
  }
  if (hubMode) hubMode.text = mode === 'major' ? 'Maj' : 'min'
  if (hubKey) hubKey.text = spelling
}

function buildWedge(pos: CofPosition, root: Container, onSelect: (index: number, ring: 'major' | 'minor') => void): WedgeGfx {
  const major = new Graphics()
  major.eventMode = 'static'
  major.cursor = 'pointer'
  major.on('pointertap', () => onSelect(pos.index, 'major'))
  root.addChild(major)

  const minor = new Graphics()
  minor.eventMode = 'static'
  minor.cursor = 'pointer'
  minor.on('pointertap', () => onSelect(pos.index, 'minor'))
  root.addChild(minor)

  const majorLabel = new Text({ text: pos.majorSpelling, style: mutedStyle })
  majorLabel.anchor.set(0.5)
  const mp = labelPos(pos.index, (OUTER_R + OUTER_INNER_R) / 2)
  majorLabel.position.set(mp.x, mp.y)
  majorLabel.eventMode = 'none'
  root.addChild(majorLabel)

  const minorLabel = new Text({ text: `${pos.minorSpelling}m`, style: mutedStyle })
  minorLabel.anchor.set(0.5)
  const np = labelPos(pos.index, (INNER_R + INNER_INNER_R) / 2)
  minorLabel.position.set(np.x, np.y)
  minorLabel.eventMode = 'none'
  root.addChild(minorLabel)

  return { major, minor, majorLabel, minorLabel }
}

/**
 * Dual-ring Circle of Fifths (PixiJS).
 * Outer = major, inner = relative minor. Click sets global key/mode.
 * Relative pair stays highlighted; active mode is brighter with slight scale feedback.
 */
export function CircleOfFifths() {
  const hostRef = useRef<HTMLDivElement>(null)
  const wedgesRef = useRef<Map<number, WedgeGfx>>(new Map())
  const hubModeRef = useRef<Text | null>(null)
  const hubKeyRef = useRef<Text | null>(null)
  const readyRef = useRef(false)

  const key = useTheoryStore((s) => s.key)
  const mode = useTheoryStore((s) => s.mode)
  const keySpelling = useTheoryStore((s) => s.keySpelling)

  useEffect(() => {
    const host = hostRef.current
    if (!host) return

    let cancelled = false
    const app = new Application()

    void (async () => {
      await app.init({
        width: SIZE,
        height: SIZE,
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

      const root = new Container()
      root.position.set(SIZE / 2, SIZE / 2)
      app.stage.addChild(root)

      const onSelect = (index: number, ring: 'major' | 'minor') => {
        const sel = selectionFromWedge(index, ring)
        useTheoryStore.getState().selectKey({
          key: sel.key,
          keySpelling: sel.keySpelling,
          mode: sel.mode,
        })
        const state = useTheoryStore.getState()
        void theoryAudio.playTriad({
          tonic: state.key,
          tonicSpelling: state.keySpelling,
          mode: state.mode,
          minorForm: state.minorForm,
        })
      }

      const wedges = new Map<number, WedgeGfx>()
      for (const pos of COF_POSITIONS) {
        wedges.set(pos.index, buildWedge(pos, root, onSelect))
      }
      wedgesRef.current = wedges

      const hub = new Graphics()
      hub.circle(0, 0, INNER_INNER_R - 4)
      hub.fill({ color: 0x0d0f12, alpha: 0.95 })
      hub.stroke({ width: 1, color: 0x343c49 })
      root.addChild(hub)

      const hubMode = new Text({ text: 'Maj', style: brightStyle })
      hubMode.anchor.set(0.5)
      hubMode.y = -8
      root.addChild(hubMode)
      hubModeRef.current = hubMode

      const hubKey = new Text({ text: 'C', style: mutedStyle })
      hubKey.anchor.set(0.5)
      hubKey.y = 10
      root.addChild(hubKey)
      hubKeyRef.current = hubKey

      readyRef.current = true
      const state = useTheoryStore.getState()
      paintSelection(wedges, hubMode, hubKey, state.key, state.mode, state.keySpelling)
    })()

    return () => {
      cancelled = true
      readyRef.current = false
      wedgesRef.current = new Map()
      hubModeRef.current = null
      hubKeyRef.current = null
      app.destroy(true)
    }
  }, [])

  useEffect(() => {
    if (!readyRef.current) return
    paintSelection(
      wedgesRef.current,
      hubModeRef.current,
      hubKeyRef.current,
      key,
      mode,
      keySpelling,
    )
  }, [key, mode, keySpelling])

  return (
    <div
      className="cof-root"
      ref={hostRef}
      aria-label="Circle of Fifths interactive"
      role="img"
    />
  )
}

export default CircleOfFifths
