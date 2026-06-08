'use client'

import { Plan } from '@/lib/types'
import { ACTIVITY_META } from '@/lib/constants'
import { timeUntilExpiry } from '@/lib/utils'

interface Props {
  plan: Plan
  onApply: (id: string) => void
  applied: boolean
}

export default function PlanCard({ plan, onApply, applied }: Props) {
  const meta   = ACTIVITY_META[plan.activity]
  const count  = plan.applicant_count ?? 0
  const expiry = timeUntilExpiry(plan.expires_at)
  const isFull = count >= plan.spots

  return (
    <div
      style={s.card}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-hover)'
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border)'
      }}
      onMouseDown={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(0.99)'
      }}
      onMouseUp={e => {
        (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)'
      }}
    >
      {/* Top row */}
      <div style={s.topRow}>
        <div style={s.iconCircle}>
          {meta?.icon ?? '📅'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
            <span style={s.actLabel}>{meta?.label ?? plan.activity}</span>
            <span style={{
              ...s.spotsBadge,
              background: isFull ? '#F5F5F5' : '#E6F4EF',
              color: isFull ? 'var(--sage)' : '#1A7F5A',
            }}>
              {isFull ? 'Full' : `${plan.spots} spot${plan.spots !== 1 ? 's' : ''}`}
            </span>
          </div>
          <div style={s.metaRow}>
            <span>🕐 {plan.time_window}</span>
            <span style={{ color: 'var(--mist)' }}>·</span>
            <span>📍 {plan.zone}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      {plan.note && (
        <p style={s.note}>"{plan.note}"</p>
      )}

      {/* Footer */}
      <div style={s.footer}>
        <div style={s.dotsRow}>
          {Array.from({ length: plan.spots }).map((_, i) => (
            <div key={i} style={{
              width: 28, height: 28,
              borderRadius: '50%',
              background: i < count ? 'var(--mist)' : '#F5F5F5',
              border: `1.5px solid ${i < count ? 'var(--forest)' : '#E0E0E0'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11,
              color: i < count ? 'var(--forest)' : 'transparent',
              fontWeight: 500,
            }}>
              {i < count ? '?' : ''}
            </div>
          ))}
          <span style={{ fontSize: 12, color: 'var(--sage)', marginLeft: 8 }}>
            {count} applied
          </span>
        </div>

        <button
          disabled={applied || isFull}
          onClick={e => {
            e.stopPropagation()
            if (!applied && !isFull) {
              if ('vibrate' in navigator) navigator.vibrate(10)
              onApply(plan.id)
            }
          }}
          style={{
            height: 32,
            padding: '0 20px',
            borderRadius: applied ? 'var(--radius-full)' : 'var(--radius-md)',
            border: 'none',
            fontSize: 13,
            fontWeight: 500,
            cursor: applied || isFull ? 'default' : 'pointer',
            background: applied ? '#E6F4EF' : isFull ? '#F5F5F5' : 'var(--forest)',
            color: applied ? '#1A7F5A' : isFull ? 'var(--sage)' : 'var(--butter)',
            transition: 'transform 150ms ease',
          }}
          onMouseEnter={e => !applied && !isFull && ((e.target as HTMLButtonElement).style.transform = 'translateY(-1px)')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.transform = 'translateY(0)')}
        >
          {applied ? '✓ Applied' : isFull ? 'Full' : 'Apply'}
        </button>
      </div>

      {/* Expiry warning */}
      {expiry && (
        <div style={{ marginTop: 8, fontSize: 11, color: '#dc2626' }}>
          ⏱ {expiry}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    border: '1px solid var(--border)',
    padding: 16,
    cursor: 'pointer',
    transition: 'border-color 200ms ease, transform 150ms ease',
  },
  topRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 0,
  },
  iconCircle: {
    width: 42, height: 42,
    borderRadius: '50%',
    background: 'var(--mist)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 20,
    flexShrink: 0,
  },
  actLabel: {
    fontFamily: 'Georgia, serif',
    fontSize: 15,
    fontWeight: 'bold',
    color: 'var(--forest)',
  },
  spotsBadge: {
    fontSize: 11,
    fontWeight: 600,
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
    whiteSpace: 'nowrap' as const,
  },
  metaRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'center',
    fontSize: 12,
    color: 'var(--sage)',
    marginTop: 3,
  },
  note: {
    fontSize: 13,
    color: 'var(--sage)',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 1.5,
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical' as const,
    paddingLeft: 10,
    borderLeft: '2px solid var(--mist)',
  },
  footer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  dotsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
}
