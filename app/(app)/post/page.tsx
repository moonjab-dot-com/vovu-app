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
      // Toast shown on feed via URL param would be cleaner but this is fine
    } catch {
      setError('Network error. Try again.')
      setSubmitting(false)
    }
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={() => router.back()} style={s.backBtn}>← Back</button>
        <h1 style={s.title}>Drop a plan</h1>
        <div style={{ width: 48 }} />
      </div>

      <div style={s.form}>
        {/* Activity */}
        <div style={s.section}>
          <label style={s.label}>What do you want to do?</label>
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
                <span style={{ fontSize: 22 }}>{meta.icon}</span>
                <span style={{ fontSize: 11, marginTop: 4 }}>{meta.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Zone (public) */}
        {activity && (
          <div style={s.section}>
            <label style={s.label}>
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
              placeholder="Or type your own…"
              style={{ ...s.input, marginTop: 8 }}
            />
          </div>
        )}

        {/* Time window (public) */}
        <div style={s.section}>
          <label style={s.label}>
            Time window
            <span style={s.labelNote}> (shown publicly)</span>
          </label>
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
        </div>

        {/* Private details */}
        <div style={s.privateSection}>
          <div style={s.privateHeader}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <span style={s.privateLabel}>Only revealed after mutual yes</span>
          </div>

          <div style={s.privateFields}>
            <div>
              <label style={s.label}>Exact location</label>
              <p style={s.helper}>Only revealed after mutual yes.</p>
              <input
                value={exactLocation}
                onChange={e => setExactLocation(e.target.value)}
                placeholder="e.g. Back corner table, near the windows"
                style={s.input}
              />
            </div>
            <div style={{ marginTop: 16 }}>
              <label style={s.label}>Exact time</label>
              <p style={s.helper}>Only revealed after mutual yes.</p>
              <input
                value={exactTime}
                onChange={e => setExactTime(e.target.value)}
                placeholder="e.g. 7:15pm"
                style={s.input}
              />
            </div>
          </div>
        </div>

        {/* Note */}
        <div style={s.section}>
          <label style={s.label}>
            Add a note
            <span style={s.labelNote}> (optional · max 120 characters)</span>
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
              position: 'absolute', bottom: 8, right: 10,
              fontSize: 11,
              color: note.length >= 100 ? 'var(--forest)' : 'var(--sage)',
            }}>
              {note.length}/120
            </span>
          </div>
        </div>

        {/* Spots */}
        <div style={s.section}>
          <label style={s.label}>How many people?</label>
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
          style={{ ...s.submitBtn, opacity: canSubmit ? 1 : 0.4 }}
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
    paddingBottom: 100,
  },
  header: {
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border)',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 15,
    color: 'var(--forest)',
    cursor: 'pointer',
    padding: '4px 0',
    fontWeight: 500,
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 20,
    fontWeight: 'bold',
    color: 'var(--forest)',
  },
  form: {
    padding: '16px',
  },
  section: {
    marginBottom: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--forest)',
    display: 'block',
    marginBottom: 6,
  },
  labelNote: {
    fontWeight: 400,
    color: 'var(--sage)',
  },
  helper: {
    fontSize: 12,
    color: 'var(--sage)',
    marginBottom: 8,
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
    border: '1.5px solid var(--forest)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'var(--forest)',
    fontWeight: 500,
  },
  actBtnSel: {
    background: 'var(--forest)',
    color: 'var(--butter)',
  },
  chips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    fontSize: 13,
    background: 'var(--mist)',
    color: 'var(--forest)',
    border: 'none',
    borderRadius: 9999,
    padding: '6px 14px',
    cursor: 'pointer',
    fontWeight: 500,
  },
  chipSel: {
    background: 'var(--forest)',
    color: 'var(--butter)',
  },
  input: {
    width: '100%',
    height: 48,
    background: 'var(--white)',
    border: '1.5px solid var(--border)',
    borderRadius: 10,
    padding: '0 14px',
    fontSize: 15,
    color: 'var(--forest)',
    outline: 'none',
  },
  select: {
    width: '100%',
    height: 48,
    background: 'var(--white)',
    border: '1.5px solid var(--border)',
    borderRadius: 10,
    padding: '0 14px',
    fontSize: 15,
    color: 'var(--forest)',
    outline: 'none',
    appearance: 'none',
    cursor: 'pointer',
  },
  privateSection: {
    background: 'var(--mist)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 28,
  },
  privateHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginBottom: 16,
  },
  privateLabel: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--forest)',
  },
  privateFields: {},
  textarea: {
    width: '100%',
    background: 'var(--white)',
    border: '1.5px solid var(--border)',
    borderRadius: 10,
    padding: '12px 14px',
    fontSize: 15,
    color: 'var(--forest)',
    outline: 'none',
    resize: 'none',
    lineHeight: 1.5,
    paddingBottom: 28,
  },
  spotsRow: {
    display: 'flex',
    gap: 12,
  },
  spotBtn: {
    width: 52, height: 52,
    borderRadius: '50%',
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'var(--forest)',
    cursor: 'pointer',
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
    padding: '12px 16px',
    background: 'var(--butter)',
    borderTop: '1px solid var(--border)',
  },
  submitBtn: {
    width: '100%',
    height: 52,
    background: 'var(--forest)',
    color: 'var(--butter)',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 200ms',
  },
  errText: {
    fontSize: 13,
    color: '#dc2626',
    marginBottom: 8,
    textAlign: 'center',
  },
}
