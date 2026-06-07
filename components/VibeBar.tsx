'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  label: string
  value: number // 1–5
}

export default function VibeBar({ label, value }: Props) {
  const [width, setWidth] = useState(0)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const timer = setTimeout(() => setWidth((value / 5) * 100), 100)
    return () => clearTimeout(timer)
  }, [value])

  return (
    <div ref={ref} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
      <span style={{
        fontSize: 12,
        color: 'var(--sage)',
        width: 108,
        flexShrink: 0,
        lineHeight: 1.4,
        fontFamily: 'system-ui, sans-serif',
      }}>
        {label}
      </span>
      <div style={{
        flex: 1,
        height: 4,
        background: '#E5E5E5',
        borderRadius: 2,
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          background: 'var(--forest)',
          borderRadius: 2,
          width: `${width}%`,
          transition: 'width 600ms ease',
        }} />
      </div>
    </div>
  )
}
