'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()

  const tabs = [
    { href: '/feed',    icon: '🏠', label: 'Feed' },
    { href: '/post',    icon: '+',  label: 'Post', isPost: true },
    { href: '/profile', icon: '👤', label: 'Profile' },
  ]

  return (
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      height: 64,
      background: 'var(--white)',
      borderTop: '1px solid rgba(1,62,55,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      paddingBottom: 'env(safe-area-inset-bottom)',
      zIndex: 50,
    }}>
      {tabs.map(tab => {
        const active = path === tab.href || path.startsWith(tab.href + '/')
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              textDecoration: 'none',
              color: active ? 'var(--forest)' : 'var(--sage)',
              borderTop: active ? '2px solid var(--forest)' : '2px solid transparent',
              paddingTop: 10,
              flex: 1,
              height: '100%',
              justifyContent: 'center',
            }}
          >
            {tab.isPost ? (
              <div style={{
                width: 40, height: 40,
                borderRadius: '50%',
                background: 'var(--forest)',
                color: 'var(--butter)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 24,
                fontWeight: 300,
                marginTop: -16,
              }}>
                +
              </div>
            ) : (
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
            )}
            <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
