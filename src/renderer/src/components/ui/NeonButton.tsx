import { motion } from 'framer-motion'
import type { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger' | 'success'
  size?: 'sm' | 'md'
  disabled?: boolean
  fullWidth?: boolean
  icon?: string
  style?: CSSProperties
}

const variants = {
  primary: { bg: 'rgba(255,0,48,0.12)', border: 'rgba(255,0,48,0.4)', color: 'var(--red)', hover: 'rgba(255,0,48,0.2)' },
  ghost:   { bg: 'transparent',         border: 'rgba(255,255,255,0.1)', color: 'var(--text-2)', hover: 'rgba(255,255,255,0.05)' },
  danger:  { bg: 'rgba(255,0,48,0.15)', border: 'rgba(255,0,48,0.5)', color: '#ff4455', hover: 'rgba(255,0,48,0.25)' },
  success: { bg: 'rgba(0,255,136,0.1)', border: 'rgba(0,255,136,0.3)', color: 'var(--green)', hover: 'rgba(0,255,136,0.18)' }
}

export default function NeonButton({ children, onClick, variant = 'primary', size = 'md', disabled, fullWidth, icon, style }: Props) {
  const v = variants[variant]
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.02 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      onClick={disabled ? undefined : onClick}
      style={{
        background: v.bg,
        border: `1px solid ${v.border}`,
        borderRadius: 6,
        color: v.color,
        fontFamily: 'var(--font-head)',
        fontSize: size === 'sm' ? 10 : 11,
        letterSpacing: '0.08em',
        padding: size === 'sm' ? '5px 10px' : '8px 16px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.4 : 1,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        width: fullWidth ? '100%' : undefined,
        justifyContent: fullWidth ? 'center' : undefined,
        transition: 'background 0.15s',
        ...style
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = v.hover }}
      onMouseLeave={e => { e.currentTarget.style.background = v.bg }}
    >
      {icon && <span>{icon}</span>}
      {children}
    </motion.button>
  )
}
