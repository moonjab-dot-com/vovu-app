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
      bottom: 88,
      left: '50%',
      transform: `translateX(-50%) translateY(${visible ? 0 : 20}px)`,
      background: type === 'error' ? '#dc2626' : 'var(--forest)',
      color: type === 'error' ? '#fff' : 'var(--butter)',
      fontSize: 13,
      fontWeight: 500,
      padding: '12px 20px',
      borderRadius: 'var(--radius-full)',
      maxWidth: 300,
      textAlign: 'center',
      zIndex: 200,
      opacity: visible ? 1 : 0,
      transition: 'transform 250ms ease, opacity 250ms ease',
      pointerEvents: visible ? 'auto' : 'none',
      whiteSpace: 'nowrap',
      fontFamily: 'system-ui, sans-serif',
    }}>
      {message}
    </div>
  )
}
