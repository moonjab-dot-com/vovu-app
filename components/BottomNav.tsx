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
    <nav style={{
      position: 'fixed',
      bottom: 0,
      left: '50%',
      transform: 'translateX(-50%)',
      width: '100%',
      maxWidth: 480,
      background: 'var(--white)',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      zIndex: 50,
      height: 64,
    }}>
      {tabs.map(tab => {
        const active = path === tab.href || (tab.href !== '/feed' && path.startsWith(tab.href + '/'))
        const feedActive = tab.href === '/feed' && (path === '/feed' || path.startsWith('/plan/'))

        if (tab.isPost) {
          return (
            <Link
              key={tab.href}
              href={tab.href}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textDecoration: 'none',
                height: '100%',
                gap: 4,
              }}
            >
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
                lineHeight: 1,
              }}>
                +
              </div>
              <span style={{
                fontSize: 10, fontWeight: 500,
                color: active ? 'var(--forest)' : 'var(--sage)',
              }}>
                {tab.label}
              </span>
            </Link>
          )
        }

        const isActive = feedActive || active
        return (
          <Link
            key={tab.href}
            href={tab.href}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              color: isActive ? 'var(--forest)' : 'var(--sage)',
              borderTop: isActive ? '2px solid var(--forest)' : '2px solid transparent',
              height: '100%',
              gap: 3,
              background: isActive ? 'var(--forest-soft)' : 'transparent',
            }}
          >
            <span style={{ fontSize: 20 }}>{tab.icon}</span>
            <span style={{ fontSize: 10, fontWeight: 500 }}>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
