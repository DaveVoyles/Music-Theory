import { staffSignatureLayout, type SignatureKind } from '../theory'

interface StaffSignatureProps {
  kind: SignatureKind
  accidentals: readonly string[]
  /** Accessible label, e.g. "G major key signature". */
  label: string
}

/**
 * Compact treble-staff SVG showing the current key signature accidentals.
 */
export function StaffSignature({ kind, accidentals, label }: StaffSignatureProps) {
  const layout = staffSignatureLayout(kind, accidentals)
  const lineGap = 10
  const top = 18
  const left = 12
  const clefX = 14
  const accStartX = 42
  const accStep = 12
  const width = Math.max(
    88,
    accStartX + layout.count * accStep + 16,
  )
  const height = top + lineGap * 4 + 22

  return (
    <svg
      className="staff-signature"
      viewBox={`0 0 ${width} ${height}`}
      width={width}
      height={height}
      role="img"
      aria-label={label}
    >
      <title>{label}</title>
      {/* Five staff lines */}
      {Array.from({ length: 5 }, (_, i) => {
        const y = top + i * lineGap
        return (
          <line
            key={i}
            x1={left}
            x2={width - 8}
            y1={y}
            y2={y}
            className="staff-signature-line"
          />
        )
      })}
      {/* Simplified treble clef glyph */}
      <text
        x={clefX}
        y={top + lineGap * 3.15}
        className="staff-signature-clef"
      >
        𝄞
      </text>
      {layout.count === 0 ? (
        <text
          x={accStartX}
          y={top + lineGap * 2.35}
          className="staff-signature-natural"
        >
          ♮
        </text>
      ) : (
        layout.positions.map((pos) => {
          const x = accStartX + pos.order * accStep
          const y = top + pos.staffY * lineGap + 4
          return (
            <text
              key={`${pos.spelling}-${pos.order}`}
              x={x}
              y={y}
              className={
                pos.glyph === '♯'
                  ? 'staff-signature-sharp'
                  : 'staff-signature-flat'
              }
            >
              {pos.glyph}
            </text>
          )
        })
      )}
    </svg>
  )
}

export default StaffSignature
