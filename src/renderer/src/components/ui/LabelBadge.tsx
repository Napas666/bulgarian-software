import type { GitHubLabel } from '../../types'

interface Props {
  label: GitHubLabel
  onRemove?: () => void
}

export default function LabelBadge({ label, onRemove }: Props) {
  const hex = label.color.startsWith('#') ? label.color : `#${label.color}`
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b
  const textColor = luminance > 140 ? '#000' : '#fff'

  return (
    <span
      style={{
        background: hex,
        color: textColor,
        fontSize: 11,
        fontFamily: 'var(--font-mono)',
        padding: '2px 8px',
        borderRadius: 12,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        fontWeight: 500
      }}
    >
      {label.name}
      {onRemove && (
        <span
          onClick={e => { e.stopPropagation(); onRemove() }}
          style={{ cursor: 'pointer', opacity: 0.7, fontSize: 12, lineHeight: 1 }}
        >
          ×
        </span>
      )}
    </span>
  )
}
