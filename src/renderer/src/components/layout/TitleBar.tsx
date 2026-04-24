import { useStore } from '../../store/useStore'

export default function TitleBar() {
  const repoUrl = useStore(s => s.repoUrl)

  const repoName = repoUrl
    ? repoUrl.replace('https://github.com/', '').replace(/\/$/, '')
    : null

  return (
    <div
      style={{
        height: 38,
        background: 'rgba(8,8,15,0.98)',
        borderBottom: '1px solid rgba(255,0,48,0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
        WebkitAppRegion: 'drag' as any
      }}
    >
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div
          style={{
            width: 22,
            height: 22,
            background: 'linear-gradient(135deg, #ff0030, #880018)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 11,
            fontWeight: 900,
            color: '#fff',
            fontFamily: 'var(--font-head)'
          }}
        >
          B
        </div>
        <span style={{ fontFamily: 'var(--font-head)', fontSize: 11, color: 'var(--red)', letterSpacing: '0.18em' }}>
          BULGARIAN SOFTWARE
        </span>
        {repoName && (
          <>
            <span style={{ color: 'var(--text-3)', fontSize: 12 }}>›</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-2)' }}>{repoName}</span>
          </>
        )}
      </div>

      {/* Window controls */}
      <div style={{ display: 'flex', gap: 6, WebkitAppRegion: 'no-drag' as any }}>
        {[
          { color: '#ffb800', action: 'window:minimize', label: '−' },
          { color: '#00cc55', action: 'window:maximize', label: '⤢' },
          { color: '#ff0030', action: 'window:close', label: '×' }
        ].map(({ color, action, label }) => (
          <button
            key={action}
            onClick={() => window.electron?.ipcRenderer.send(action)}
            style={{
              width: 13,
              height: 13,
              borderRadius: '50%',
              background: color,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 9,
              color: 'rgba(0,0,0,0.7)',
              opacity: 0.85,
              transition: 'opacity 0.1s'
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0.85')}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
