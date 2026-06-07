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
  const meta = ACTIVITY_META[plan.activity]
  const count = plan.applicant_count ?? 0
  const expiry = timeUntilExpiry(plan.expires_at)
  const isFull = count >= plan.spots

  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid rgba(1,62,55,0.08)',
        padding: 16,
        transition: 'border-color 200ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(1,62,55,0.2)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(1,62,55,0.08)')}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'var(--mist)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
          flexShrink: 0,
        }}>
          {meta?.icon ?? '📅'}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: 15,
              fontWeight: 500,
              color: 'var(--forest)',
            }}>
              {meta?.label ?? plan.activity}
            </span>
            <span style={{
              fontSize: 11,
              background: 'var(--mist)',
              color: 'var(--forest)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
            }}>
              {plan.spots} spot{plan.spots !== 1 ? 's' : ''}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--sage)', marginTop: 3, display: 'flex', gap: 10 }}>
            <span>🕐 {plan.time_window}</span>
            <span>📍 {plan.zone}</span>
          </div>
        </div>
      </div>

      {/* Note */}
      {plan.note && (
        <p style={{
          fontSize: 13,
          color: 'var(--sage)',
          fontStyle: 'italic',
          marginBottom: 12,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          "{plan.note}"
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Anonymous applicant dots */}
          <div style={{ display: 'flex', gap: 4 }}>
            {Array.from({ length: plan.spots }).map((_, i) => (
              <div key={i} style={{
                width: 26, height: 26,
                borderRadius: '50%',
                background: i < count ? 'var(--mist)' : '#F5F5F5',
                border: `1px solid ${i < count ? 'var(--forest)' : '#DDD'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
                color: i < count ? 'var(--forest)' : '#CCC',
              }}>
                {i < count ? '?' : ''}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--sage)' }}>
            {count} applied
          </span>
          {expiry && (
            <span style={{ fontSize: 11, color: '#dc2626' }}>{expiry}</span>
          )}
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
            padding: '0 16px',
            borderRadius: 8,
            border: 'none',
            fontSize: 13,
            fontWeight: 500,
            cursor: applied || isFull ? 'default' : 'pointer',
            background: applied ? 'var(--mist)' : isFull ? '#F5F5F5' : 'var(--forest)',
            color: applied ? 'var(--forest)' : isFull ? 'var(--sage)' : 'var(--butter)',
            transition: 'transform 150ms ease',
          }}
          onMouseEnter={e => !applied && !isFull && ((e.target as HTMLButtonElement).style.transform = 'translateY(-1px)')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.transform = 'translateY(0)')}
        >
          {applied ? '✓ Applied' : isFull ? 'Full' : 'Apply'}
        </button>
      </div>
    </div>
  )
}
