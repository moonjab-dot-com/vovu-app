'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ACTIVITY_META, TIME_WINDOWS } from '@/lib/constants'
import { ActivityType } from '@/lib/types'
import Toast from '@/components/Toast'

export default function PostPage() {
  const router = useRouter()
  const [activity,      setActivity]      = useState<ActivityType | null>(null)
  const [zone,          setZone]          = useState('')
  const [customZone,    setCustomZone]    = useState('')
  const [timeWindow,    setTimeWindow]    = useState('')
  const [exactLocation, setExactLocation] = useState('')
  const [exactTime,     setExactTime]     = useState('')
  const [note,          setNote]          = useState('')
  const [spots,         setSpots]         = useState<1|2|3>(1)
  const [submitting,    setSubmitting]    = useState(false)
  const [error,         setError]         = useState('')
  const [toast,         setToast]         = useState({ visible: false, message: '', type: 'success' as const })

  const activeZone = customZone || zone
  const canSubmit  = !!activity && !!activeZone && !!timeWindow && !!exactLocation && !!exactTime && !submitting

  const activities = Object.entries(ACTIVITY_META) as [ActivityType, typeof ACTIVITY_META[ActivityType]][]

  async function handleSubmit() {
    if (!canSubmit) return
    const email = localStorage.getItem('vovu_email')
    if (!email) { router.replace('/login'); return }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          plan: { activity, zone: activeZone, timeWindow, exactLocation, exactTime, note, spots },
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to post plan.')
        setSubmitting(false)
        return
      }
      router.push('/feed')
    } catch {
      setError('Network error. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={() => router.back()} style={s.backBtn}>←</button>
        <h1 style={s.title}>Drop a plan</h1>
        <div style={{ width: 32 }} />
      </div>

      <p style={s.subtext}>Only people whose vibe matches yours will see it.</p>

      <div style={s.form}>
        {/* Activity */}
        <div style={s.section}>
          <label style={s.sectionLabel}>What do you want to do?</label>
          <div style={s.actGrid}>
            {activities.map(([key, meta]) => (
              <button
                key={key}
                onClick={() => { setActivity(key); setZone(''); setCustomZone('') }}
                style={{
                  ...s.actBtn,
                  ...(activity === key ? s.actBtnSel : {}),
                }}
              >
                <span style={{ fontSize: 24 }}>{meta.icon}</span>
                <span style={{ fontSize: 12, marginTop: 4, fontWeight: 500 }}>{meta.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Zone (public) */}
        {activity && (
          <div style={s.section}>
            <label style={s.sectionLabel}>
              General area
              <span style={s.labelNote}> (shown publicly)</span>
            </label>
            <p style={s.helper}>Vague on purpose — exact spot only revealed after match.</p>
            <div style={s.chips}>
              {ACTIVITY_META[activity].zone_suggestions.map(z => (
                <button
                  key={z}
                  onClick={() => { setZone(z); setCustomZone('') }}
                  style={{ ...s.chip, ...(zone === z && !customZone ? s.chipSel : {}) }}
                >
                  {z}
                </button>
              ))}
            </div>
            <input
              value={customZone}
              onChange={e => { setCustomZone(e.target.value); setZone('') }}
              placeholder="Or type your own area…"
              style={{ ...s.input, marginTop: 8 }}
            />
          </div>
        )}

        {/* Time window (public) */}
        <div style={s.section}>
          <label style={s.sectionLabel}>
            Time window
            <span style={s.labelNote}> (shown publicly)</span>
          </label>
          <div style={{ position: 'relative' }}>
            <select
              value={timeWindow}
              onChange={e => setTimeWindow(e.target.value)}
              style={s.select}
            >
              <option value="">Select a time…</option>
              {TIME_WINDOWS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            <span style={s.selectArrow}>▾</span>
          </div>
        </div>

        {/* Private details */}
        <div style={s.privateSection}>
          <div style={s.privateHeader}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={s.privateLabel}>Private — revealed only after match</span>
          </div>

          <div>
            <label style={s.sectionLabel}>Exact location</label>
            <input
              value={exactLocation}
              onChange={e => setExactLocation(e.target.value)}
              placeholder="e.g. Back corner table, near the windows"
              style={s.privateInput}
            />
          </div>
          <div style={{ marginTop: 16 }}>
            <label style={s.sectionLabel}>Exact time</label>
            <input
              value={exactTime}
              onChange={e => setExactTime(e.target.value)}
              placeholder="e.g. 7:15pm"
              style={s.privateInput}
            />
          </div>
        </div>

        {/* Note */}
        <div style={s.section}>
          <label style={s.sectionLabel}>
            Add a note
            <span style={s.labelNote}> optional · 120 chars max</span>
          </label>
          <div style={{ position: 'relative' }}>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value.slice(0, 120))}
              rows={3}
              placeholder="Anything to set the vibe…"
              style={s.textarea}
            />
            <span style={{
              position: 'absolute', bottom: 8, right: 12,
              fontSize: 11,
              color: note.length >= 100 ? '#dc2626' : note.length >= 80 ? '#f59e0b' : 'var(--sage)',
              fontWeight: 500,
            }}>
              {note.length}/120
            </span>
          </div>
        </div>

        {/* Spots */}
        <div style={s.section}>
          <label style={s.sectionLabel}>How many people?</label>
          <div style={s.spotsRow}>
            {([1,2,3] as const).map(n => (
              <button
                key={n}
                onClick={() => setSpots(n)}
                style={{
                  ...s.spotBtn,
                  ...(spots === n ? s.spotBtnSel : {}),
                }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Submit bar */}
      <div style={s.submitBar}>
        {error && <p style={s.errText}>{error}</p>}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          style={{ ...s.submitBtn, ...(!canSubmit ? s.submitBtnDisabled : {}) }}
        >
          {submitting ? 'Posting…' : 'Drop this plan →'}
        </button>
      </div>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => setToast(t => ({ ...t, visible: false }))}
      />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--butter)',
    paddingBottom: 120,
  },
  header: {
    padding: '20px 20px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 20,
    color: 'var(--forest)',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    width: 32,
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'var(--forest)',
    flex: 1,
    textAlign: 'center',
  },
  subtext: {
    padding: '6px 20px 20px',
    fontSize: 13,
    color: 'var(--sage)',
  },
  form: {
    padding: '0 16px',
  },
  section: {
    marginBottom: 28,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--sage)',
    textTransform: 'uppercase',
    letterSpacing: '0.07em',
    display: 'block',
    marginBottom: 10,
  },
  labelNote: {
    fontWeight: 400,
    color: 'var(--sage)',
    textTransform: 'none',
    letterSpacing: 0,
  },
  helper: {
    fontSize: 12,
    color: 'var(--sage)',
    marginBottom: 10,
    lineHeight: 1.4,
  },
  actGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  actBtn: {
    height: 80,
    background: 'var(--white)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--forest)',
    transition: 'all 150ms ease',
  },
  actBtnSel: {
    background: 'var(--forest)',
    borderColor: 'var(--forest)',
    color: 'var(--butter)',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  chip: {
    fontSize: 12,
    fontWeight: 500,
    background: 'var(--mist)',
    color: 'var(--forest)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    padding: '8px 16px',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  chipSel: {
    background: 'var(--forest)',
    color: 'var(--butter)',
  },
  input: {
    width: '100%',
    height: 44,
    background: 'var(--white)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0 14px',
    fontSize: 15,
    color: 'var(--forest)',
    outline: 'none',
    transition: 'border-color 200ms',
  },
  select: {
    width: '100%',
    height: 52,
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    borderRadius: 'var(--radius-md)',
    padding: '0 40px 0 16px',
    fontSize: 15,
    color: 'var(--forest)',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  selectArrow: {
    position: 'absolute',
    right: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--forest)',
    pointerEvents: 'none',
    fontSize: 14,
  },
  privateSection: {
    background: 'var(--mist)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    marginBottom: 28,
    border: '1.5px solid rgba(1,62,55,0.15)',
  },
  privateHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  privateLabel: {
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--forest)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  privateInput: {
    width: '100%',
    height: 48,
    background: 'var(--cream)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0 14px',
    fontSize: 15,
    color: 'var(--forest)',
    outline: 'none',
    transition: 'border-color 200ms',
  },
  textarea: {
    width: '100%',
    background: 'var(--white)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '12px 16px 32px',
    fontSize: 14,
    color: 'var(--forest)',
    outline: 'none',
    resize: 'none',
    lineHeight: 1.5,
    transition: 'border-color 200ms',
  },
  spotsRow: {
    display: 'flex',
    gap: 12,
  },
  spotBtn: {
    width: 56, height: 56,
    borderRadius: '50%',
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'var(--forest)',
    cursor: 'pointer',
    transition: 'all 150ms ease',
  },
  spotBtnSel: {
    background: 'var(--forest)',
    color: 'var(--butter)',
  },
  submitBar: {
    position: 'fixed',
    bottom: 64,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    padding: '12px 20px',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))',
    background: 'var(--butter)',
    borderTop: '1px solid var(--border)',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    background: 'var(--forest)',
    color: 'var(--butter)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'transform 150ms ease',
  },
  submitBtnDisabled: {
    background: '#E5E5E5',
    color: 'var(--sage)',
    cursor: 'not-allowed',
  },
  errText: {
    fontSize: 13,
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
}
