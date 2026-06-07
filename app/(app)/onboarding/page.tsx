'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ONBOARDING_ACTIVITIES } from '@/lib/constants'
import { ActivityType } from '@/lib/types'

const TOTAL = 8

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)

  // Step answers
  const [firstName,     setFirstName]     = useState('')
  const [groupSize,     setGroupSize]     = useState('')
  const [placeVibe,     setPlaceVibe]     = useState('')
  const [activities,    setActivities]    = useState<ActivityType[]>([])
  const [timing,        setTiming]        = useState<string[]>([])
  const [planStyle,     setPlanStyle]     = useState('')
  const [followThrough, setFollowThrough] = useState(3)
  const [openness,      setOpenness]      = useState(3)
  const [duration,      setDuration]      = useState('')

  function next() { setStep(s => Math.min(s + 1, TOTAL)) }
  function back() { setStep(s => Math.max(s - 1, 1)) }

  function toggleActivity(key: ActivityType) {
    setActivities(prev =>
      prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key]
    )
  }
  function toggleTiming(t: string) {
    setTiming(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function handleFinish() {
    const email = localStorage.getItem('vovu_email')
    if (!email) { router.replace('/login'); return }
    setSaving(true)
    try {
      // Save first name
      await fetch('/api/auth/update-name', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, first_name: firstName }),
      })
      // Save profile
      await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          profile: {
            group_size:     groupSize,
            place_vibe:     placeVibe,
            plan_style:     planStyle,
            activities,
            timing,
            follow_through: followThrough,
            openness,
            duration,
            comfort_level:  'okay',
          },
        }),
      })
      localStorage.setItem('vovu_onboarded', '1')
      router.replace('/feed')
    } catch {
      setSaving(false)
    }
  }

  const canContinue = (() => {
    if (step === 1) return firstName.trim().length > 0
    if (step === 2) return !!groupSize
    if (step === 3) return !!placeVibe
    if (step === 4) return activities.length > 0
    if (step === 5) return timing.length > 0
    if (step === 6) return !!planStyle
    if (step === 7) return true
    if (step === 8) return !!duration
    return false
  })()

  return (
    <div style={s.page}>
      {/* Progress bar */}
      <div style={s.progressTrack}>
        <div style={{ ...s.progressFill, width: `${(step / TOTAL) * 100}%` }} />
      </div>

      {/* Step counter */}
      <div style={s.stepCounter}>{step} of {TOTAL}</div>

      {/* Step content */}
      <div style={s.content}>
        {step === 1 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>What's your first name?</h2>
            <p style={s.sub}>Only revealed to someone after you both say yes.</p>
            <input
              autoFocus
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              placeholder="First name"
              style={s.input}
              onKeyDown={e => e.key === 'Enter' && canContinue && next()}
            />
          </div>
        )}

        {step === 2 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>Your social energy</h2>
            <p style={s.sub}>Pick the one that feels most like you.</p>
            {[
              { value: '1on1',   label: '1-on-1 only' },
              { value: 'small',  label: 'Small group (2–3 people)' },
              { value: 'either', label: 'Either works for me' },
              { value: 'large',  label: 'The more the merrier' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setGroupSize(opt.value)}
                style={{ ...s.optBtn, ...(groupSize === opt.value ? s.optBtnSelected : {}) }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {step === 3 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>Your kind of place</h2>
            <p style={s.sub}>What vibe do you look for?</p>
            {[
              { value: 'quiet',    label: 'Quiet and calm' },
              { value: 'chill',    label: 'Low-key and chill' },
              { value: 'anywhere', label: 'Anywhere, I adapt' },
              { value: 'loud',     label: 'Loud and energetic' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setPlaceVibe(opt.value)}
                style={{ ...s.optBtn, ...(placeVibe === opt.value ? s.optBtnSelected : {}) }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {step === 4 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>What do you actually like doing?</h2>
            <div style={s.callout}>
              <strong>Choose honestly.</strong> These filter your feed forever.
              If you don't pick parties, you'll never see a party plan.
            </div>
            <div style={s.activityGrid}>
              {ONBOARDING_ACTIVITIES.map(a => {
                const sel = activities.includes(a.key as ActivityType)
                return (
                  <button
                    key={a.key}
                    onClick={() => toggleActivity(a.key as ActivityType)}
                    style={{ ...s.actBtn, ...(sel ? s.actBtnSelected : {}) }}
                  >
                    <span style={{ fontSize: 22 }}>{a.icon}</span>
                    <span style={{ fontSize: 12, marginTop: 4 }}>{a.label}</span>
                    {sel && <span style={{ position: 'absolute', top: 6, right: 8, fontSize: 12 }}>✓</span>}
                  </button>
                )
              })}
            </div>
            <p style={s.counter}>{activities.length} selected</p>
          </div>
        )}

        {step === 5 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>When are you usually free?</h2>
            <p style={s.sub}>Select all that apply.</p>
            {[
              'Early morning', 'Between classes', 'Afternoons',
              'Evenings', 'Late night', 'Weekends mostly',
            ].map(t => {
              const sel = timing.includes(t)
              return (
                <button
                  key={t}
                  onClick={() => toggleTiming(t)}
                  style={{ ...s.optBtn, ...(sel ? s.optBtnSelected : {}) }}
                >
                  {t}
                </button>
              )
            })}
          </div>
        )}

        {step === 6 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>How do you usually make plans?</h2>
            {[
              { value: 'lastminute', label: 'Last minute — same day' },
              { value: 'dayof',      label: 'Day before is ideal' },
              { value: 'ahead',      label: 'I like planning ahead' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setPlanStyle(opt.value)}
                style={{ ...s.optBtn, ...(planStyle === opt.value ? s.optBtnSelected : {}) }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}

        {step === 7 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>Two honest questions.</h2>
            <p style={s.sub}>These show as bars on your card — no numbers. Just a visual.</p>

            <div style={{ marginBottom: 32 }}>
              <p style={s.sliderLabel}>How often do you follow through on plans?</p>
              <div style={s.dotRow}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i <= followThrough ? 'var(--forest)' : 'var(--mist)',
                    border: '1.5px solid var(--forest)',
                    cursor: 'pointer',
                    transition: 'background 200ms',
                  }} onClick={() => setFollowThrough(i)} />
                ))}
              </div>
              <div style={s.sliderLabels}>
                <span>I bail a lot</span><span>Always show up</span>
              </div>
            </div>

            <div>
              <p style={s.sliderLabel}>How open are you to meeting someone new?</p>
              <div style={s.dotRow}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    width: 28, height: 28, borderRadius: '50%',
                    background: i <= openness ? 'var(--forest)' : 'var(--mist)',
                    border: '1.5px solid var(--forest)',
                    cursor: 'pointer',
                    transition: 'background 200ms',
                  }} onClick={() => setOpenness(i)} />
                ))}
              </div>
              <div style={s.sliderLabels}>
                <span>A bit nervous</span><span>Love meeting people</span>
              </div>
            </div>
          </div>
        )}

        {step === 8 && (
          <div style={s.stepWrap}>
            <h2 style={s.q}>How long do you usually hang out?</h2>
            {[
              { value: 'quick',  label: 'Quick — 30 minutes' },
              { value: 'medium', label: 'Medium — 1 to 2 hours' },
              { value: 'long',   label: 'Long — I like to linger' },
            ].map(opt => (
              <button
                key={opt.value}
                onClick={() => setDuration(opt.value)}
                style={{ ...s.optBtn, ...(duration === opt.value ? s.optBtnSelected : {}) }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={s.bottomBar}>
        {step > 1 && (
          <button onClick={back} style={s.backBtn}>← Back</button>
        )}
        <div style={{ flex: 1 }} />
        {step < TOTAL ? (
          <button
            onClick={next}
            disabled={!canContinue}
            style={{ ...s.nextBtn, opacity: canContinue ? 1 : 0.35 }}
          >
            Continue →
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={!canContinue || saving}
            style={{ ...s.nextBtn, opacity: canContinue && !saving ? 1 : 0.35 }}
          >
            {saving ? 'Saving…' : 'Enter Vovu →'}
          </button>
        )}
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--butter)',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 80,
  },
  progressTrack: {
    height: 3,
    background: 'rgba(1,62,55,0.12)',
    width: '100%',
  },
  progressFill: {
    height: '100%',
    background: 'var(--forest)',
    transition: 'width 300ms ease',
  },
  stepCounter: {
    fontSize: 13,
    color: 'var(--sage)',
    textAlign: 'right',
    padding: '12px 24px 0',
  },
  content: {
    flex: 1,
    padding: '24px 24px 0',
    overflowY: 'auto',
  },
  stepWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  q: {
    fontFamily: 'Georgia, serif',
    fontSize: 24,
    fontWeight: 'bold',
    color: 'var(--forest)',
    lineHeight: 1.25,
    marginBottom: 4,
  },
  sub: {
    fontSize: 14,
    color: 'var(--sage)',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  input: {
    height: 52,
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    borderRadius: 12,
    padding: '0 16px',
    fontSize: 16,
    color: 'var(--forest)',
    outline: 'none',
    width: '100%',
  },
  optBtn: {
    width: '100%',
    height: 48,
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    borderRadius: 12,
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--forest)',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '0 16px',
  },
  optBtnSelected: {
    background: 'var(--forest)',
    color: 'var(--butter)',
  },
  callout: {
    background: 'var(--forest)',
    color: 'var(--butter)',
    borderRadius: 12,
    padding: '12px 16px',
    fontSize: 14,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  activityGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 10,
  },
  actBtn: {
    height: 64,
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    borderRadius: 12,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: 13,
    color: 'var(--forest)',
    position: 'relative',
    fontWeight: 500,
  },
  actBtnSelected: {
    background: 'var(--forest)',
    color: 'var(--butter)',
  },
  counter: {
    fontSize: 13,
    color: 'var(--sage)',
    textAlign: 'center',
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--forest)',
    marginBottom: 12,
  },
  dotRow: {
    display: 'flex',
    gap: 12,
    marginBottom: 8,
  },
  sliderLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: 'var(--sage)',
  },
  bottomBar: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: 480,
    background: 'var(--butter)',
    borderTop: '1px solid var(--border)',
    padding: '12px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
  },
  backBtn: {
    height: 48,
    background: 'transparent',
    border: '1.5px solid var(--forest)',
    borderRadius: 12,
    fontSize: 14,
    color: 'var(--forest)',
    cursor: 'pointer',
    padding: '0 20px',
    fontWeight: 500,
  },
  nextBtn: {
    height: 48,
    background: 'var(--forest)',
    color: 'var(--butter)',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '0 28px',
    transition: 'opacity 200ms',
  },
}
