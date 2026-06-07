'use client'

import { useEffect } from 'react'

interface Props {
  message: string
  type: 'success' | 'error'
  visible: boolean
  onDismiss: () => void
}

export default function Toast({ message, type, visible, onDismiss }: Props) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onDismiss, 3000)
      return () => clearTimeout(t)
    }
  }, [visible, onDismiss])

  return (
    <div style={{
      position: 'fixed',
      bottom: 80,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 80}px)`,
      background: type === 'error' ? '#dc2626' : 'var(--forest)',
      color: type === 'error' ? '#fff' : 'var(--butter)',
      fontSize: 13,
      padding: '10px 20px',
      borderRadius: 12,
      maxWidth: 320,
      textAlign: 'center',
      zIndex: 200,
      opacity: visible ? 1 : 0,
      transition: 'transform 300ms ease, opacity 300ms ease',
      pointerEvents: visible ? 'auto' : 'none',
      whiteSpace: 'nowrap',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {message}
    </div>
  )
}
