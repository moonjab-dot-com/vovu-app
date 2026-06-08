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
  const meta  = ACTIVITY_META[plan.activity]
  const count = plan.applicant_count ?? 0
  const expiry = timeUntilExpiry(plan.expires_at)
  const isFull = count >= plan.spots

  return (
    <div
      style={{
        background: 'var(--white)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)',
        padding: 16,
        transition: 'border-color 200ms ease, transform 150ms ease',
        cursor: 'pointer',
      }}
      onMouseEnter={e => (e.currentTarget.style.borderColor = 'var(--border-hover)')}
      onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border)')}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 42, height: 42,
            borderRadius: '50%',
            background: 'var(--mist)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20,
            flexShrink: 0,
          }}>
            {meta?.icon ?? '📅'}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{
              fontFamily: 'Georgia, serif',
              fontSize: 15,
              fontWeight: 'bold',
              color: 'var(--forest)',
              display: 'block',
            }}>
              {meta?.label ?? plan.activity}
            </span>
            <div style={{ fontSize: 12, color: 'var(--sage)', marginTop: 3 }}>
              🕐 {plan.time_window} &nbsp;·&nbsp; 📍 {plan.zone}
            </div>
          </div>
        </div>

        {/* Spots badge */}
        <span style={{
          fontSize: 11,
          fontWeight: 600,
          background: isFull ? '#F5F5F5' : '#E6F4EF',
          color: isFull ? 'var(--sage)' : '#1A7F5A',
          padding: '4px 10px',
          borderRadius: 'var(--radius-full)',
          flexShrink: 0,
          whiteSpace: 'nowrap',
        }}>
          {isFull ? 'Full' : `${plan.spots} spot${plan.spots !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Note */}
      {plan.note && (
        <p style={{
          fontSize: 13,
          color: 'var(--sage)',
          fontStyle: 'italic',
          marginTop: 10,
          paddingLeft: 10,
          borderLeft: '2px solid var(--mist)',
          lineHeight: 1.5,
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          "{plan.note}"
        </p>
      )}

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {Array.from({ length: plan.spots }).map((_, i) => (
              <div key={i} style={{
                width: 28, height: 28,
                borderRadius: '50%',
                background: i < count ? 'var(--mist)' : '#F5F5F5',
                border: `1.5px solid ${i < count ? 'var(--forest)' : '#E0E0E0'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11,
                fontWeight: 500,
                color: i < count ? 'var(--forest)' : 'transparent',
              }}>
                {i < count ? '?' : ''}
              </div>
            ))}
          </div>
          <span style={{ fontSize: 12, color: 'var(--sage)', marginLeft: 3 }}>
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
            padding: '0 16px',
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
