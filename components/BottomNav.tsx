'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const path = usePathname()

  const tabs = [
    { href: '/feed',    icon: '⌂',  label: 'Feed' },
    { href: '/post',    icon: '+',  label: 'Post', isPost: true },
    { href: '/profile', icon: '◯',  label: 'Profile' },
  ]

  return (
    <nav style={s.nav}>
      {tabs.map(tab => {
        const active = path === tab.href || (tab.href !== '/post' && path.startsWith(tab.href + '/'))
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              ...s.tab,
              color: active ? 'var(--forest)' : 'var(--sage)',
              background: !tab.isPost && active ? 'var(--forest-soft)' : 'transparent',
              borderTop: !tab.isPost && active ? '2px solid var(--forest)' : '2px solid transparent',
            }}
          >
            {tab.isPost ? (
              <div style={{
                width: 48, height: 48,
                borderRadius: '50%',
                background: 'var(--forest)',
                color: 'var(--butter)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 26,
                fontWeight: 300,
                marginTop: -16,
                border: '3px solid var(--white)',
              }}>
                +
              </div>
            ) : (
              <span style={{ fontSize: 20 }}>{tab.icon}</span>
            )}
            <span style={{
              fontSize: 11,
              fontWeight: 500,
              color: active && !tab.isPost ? 'var(--forest)' : 'var(--sage)',
            }}>
              {tab.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

const s: Record<string, React.CSSProperties> = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    height: 64,
    background: 'var(--white)',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    alignItems: 'stretch',
    zIndex: 50,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  tab: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
    textDecoration: 'none',
    flex: 1,
    paddingTop: 4,
    transition: 'background 150ms ease',
  },
}
