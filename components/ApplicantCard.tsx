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
    <div style={s.card}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.avatar}>
          {applicant.initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={s.name}>
              {applicant.initial}·  Anonymous applicant
            </span>
            {applicant.is_me && (
              <span style={s.youBadge}>You</span>
            )}
            {isPreview && (
              <span style={s.previewBadge}>Preview</span>
            )}
          </div>
          <div style={s.subtext}>
            Name revealed only after mutual yes
          </div>
        </div>
      </div>

      {/* Activity tags */}
      {applicant.activities.length > 0 && (
        <div style={s.tags}>
          {applicant.activities.map(a => (
            <span key={a} style={s.tag}>
              {ACTIVITY_META[a]?.icon} {ACTIVITY_META[a]?.label ?? a}
            </span>
          ))}
        </div>
      )}

      {/* Vibe bars */}
      <div style={{ marginBottom: isCreator && !isPreview ? 14 : 0 }}>
        <VibeBar label="Follows through" value={applicant.follow_through} />
        <VibeBar label="Open to new people" value={applicant.openness} />
      </div>

      {/* YES button — creator only, not preview */}
      {isCreator && !isPreview && onYes && (
        <button
          onClick={onYes}
          disabled={isPressing}
          style={{
            ...s.yesBtn,
            background: isPressing ? 'var(--sage)' : 'var(--forest)',
            cursor: isPressing ? 'default' : 'pointer',
          }}
          onMouseEnter={e => !isPressing && ((e.target as HTMLButtonElement).style.transform = 'translateY(-2px)')}
          onMouseLeave={e => ((e.target as HTMLButtonElement).style.transform = 'translateY(0)')}
        >
          {isPressing ? (
            <span style={{ opacity: 0.6 }}>Confirming…</span>
          ) : (
            'Yes, go with this person →'
          )}
        </button>
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
  },
  header: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
  },
  avatar: {
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
  },
  name: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--forest)',
  },
  youBadge: {
    fontSize: 11,
    background: 'var(--mist)',
    color: 'var(--forest)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontWeight: 500,
  },
  previewBadge: {
    fontSize: 10,
    background: 'var(--mist)',
    color: 'var(--forest)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-full)',
    fontWeight: 500,
  },
  subtext: {
    fontSize: 12,
    color: 'var(--sage)',
    marginTop: 2,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tag: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 'var(--radius-full)',
    background: '#F5F5F5',
    color: 'var(--sage)',
  },
  yesBtn: {
    width: '100%',
    height: 52,
    color: 'var(--butter)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 150ms ease, background 150ms ease',
  },
}
