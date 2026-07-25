import { useId, useState, type ReactNode } from 'react'
import { FEATURE_HELP, type FeatureHelpId } from '../help/featureHelp'

interface HelpTipProps {
  /** Key into FEATURE_HELP catalog */
  feature: FeatureHelpId
  /** Optional compact placement for dense toolbars */
  compact?: boolean
  className?: string
}

/**
 * Accessible feature help: hover or focus the “?” control to learn what a
 * region does. Touch devices can tap the control to toggle the popover.
 */
export function HelpTip({ feature, compact = false, className = '' }: HelpTipProps) {
  const help = FEATURE_HELP[feature]
  const tipId = useId()
  const [open, setOpen] = useState(false)

  return (
    <span
      className={`help-tip ${compact ? 'help-tip--compact' : ''} ${open ? 'is-open' : ''} ${className}`.trim()}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        className="help-tip-trigger"
        aria-label={`About ${help.title}`}
        aria-describedby={open ? tipId : undefined}
        aria-expanded={open}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onClick={(e) => {
          // Touch / keyboard: toggle without submitting parent forms
          e.preventDefault()
          setOpen((v) => !v)
        }}
      >
        ?
      </button>
      <div
        id={tipId}
        role="tooltip"
        className="help-tip-popover"
        hidden={!open}
      >
        <p className="help-tip-title">{help.title}</p>
        <p className="help-tip-block">
          <span className="help-tip-kicker">What</span>
          {help.what}
        </p>
        <p className="help-tip-block">
          <span className="help-tip-kicker">How it works</span>
          {help.how}
        </p>
        <p className="help-tip-block">
          <span className="help-tip-kicker">Try this</span>
          {help.tryThis}
        </p>
      </div>
    </span>
  )
}

interface FeatureHeadingProps {
  feature: FeatureHelpId
  as?: 'h2' | 'h3'
  meta?: ReactNode
  children?: ReactNode
}

/** Panel header title + optional meta + help trigger. */
export function FeatureHeading({
  feature,
  as: Tag = 'h2',
  meta,
  children,
}: FeatureHeadingProps) {
  const help = FEATURE_HELP[feature]
  return (
    <div className="feature-heading">
      <div className="feature-heading-main">
        <Tag className="feature-heading-title">
          {children ?? help.title}
          <HelpTip feature={feature} />
        </Tag>
        {meta ? <span className="panel-meta">{meta}</span> : null}
      </div>
    </div>
  )
}

export default HelpTip
