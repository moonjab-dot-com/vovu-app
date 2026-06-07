'use client'

import { Applicant } from '@/lib/types'
import { ACTIVITY_META } from '@/lib/constants'
import VibeBar from './VibeBar'

interface Props {
  applicant: Applicant
  onYes?: () => void
  isCreator: boolean
  isPressing: boolean
  isPreview?: boolean
}

export default function ApplicantCard({ applicant, onYes, isCreator, isPressing, isPreview }: Props) {
  return (
    <div style={{
      background: 'var(--white)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      padding: 16,
      transition: 'border-color 200ms ease',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'var(--butter)',
          border: '1.5px solid var(--forest)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'Georgia, serif',
          fontWeight: 'bold',
          fontSize: 16,
          color: 'var(--forest)',
          flexShrink: 0,
        }}>
          {applicant.initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--forest)' }}>
              {applicant.initial}· — Anonymous applicant
            </span>
            {isPreview && (
              <span style={{
                fontSize: 10,
                background: 'var(--mist)',
                color: 'var(--forest)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 500,
              }}>
                How you appear to others
              </span>
            )}
          </div>
          <div style={{ fontSize: 12, color: 'var(--sage)', marginTop: 2 }}>
            Name revealed only after mutual yes
          </div>
        </div>
      </div>

      {/* Activity tags */}
      {applicant.activities.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {applicant.activities.map(a => (
            <span key={a} style={{
              fontSize: 11,
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              background: '#F5F5F5',
              color: 'var(--sage)',
            }}>
              {ACTIVITY_META[a]?.icon} {ACTIVITY_META[a]?.label ?? a}
            </span>
          ))}
        </div>
      )}

      {/* Vibe bars */}
      <div style={{ marginBottom: isCreator && !isPreview ? 16 : 0 }}>
        <VibeBar label="Follows through" value={applicant.follow_through} />
        <VibeBar label="Open to new people" value={applicant.openness} />
      </div>

      {/* YES button — creator only, not preview */}
      {isCreator && !isPreview && onYes && (
        <button
          onClick={onYes}
          disabled={isPressing}
          style={{
            width: '100%',
            height: 52,
            background: isPressing ? 'var(--sage)' : 'var(--forest)',
            color: 'var(--butter)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: 15,
            fontWeight: 500,
            cursor: isPressing ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            transition: 'transform 150ms ease, background 150ms ease',
            transform: 'translateY(0)',
          }}
          onMouseEnter={e => !isPressing && ((e.target as HTMLButtonElement).style.transform = 'translateY(-2px)')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.transform = 'translateY(0)')}
        >
          {isPressing ? (
            <>
              <span style={{ fontSize: 16 }}>⏳</span> Confirming…
            </>
          ) : (
            'Yes, go with this person →'
          )}
        </button>
      )}
    </div>
  )
}
