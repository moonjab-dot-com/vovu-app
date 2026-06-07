'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ApplicantCard from '@/components/ApplicantCard'
import { ACTIVITY_META } from '@/lib/constants'
import { ActivityType, Profile, User } from '@/lib/types'
import { getCampusName, getInitial } from '@/lib/utils'

export default function ProfilePage() {
  const router   = useRouter()
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email  = localStorage.getItem('vovu_email')
    const campus = localStorage.getItem('vovu_campus') ?? ''
    if (!email) { router.replace('/login'); return }

    // Fetch user + profile
    Promise.all([
      fetch(`/api/profile?email=${encodeURIComponent(email)}`).then(r => r.json()),
    ]).then(([pd]) => {
      setProfile(pd.profile)
      setUser({ id: '', email, campus, first_name: null, verified: true, created_at: '' })
    }).finally(() => setLoading(false))
  }, [router])

  function handleSignOut() {
    localStorage.removeItem('vovu_email')
    localStorage.removeItem('vovu_campus')
    localStorage.removeItem('vovu_onboarded')
    router.replace('/login')
  }

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div className="skeleton" style={{ height: 100, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 80 }} />
      </div>
    )
  }

  const email  = user?.email ?? ''
  const campus = user?.campus ?? ''
  const initial = getInitial(profile ? null : null)

  const previewApplicant = profile ? {
    id:             'preview',
    applicant_id:   'preview',
    status:         'pending' as const,
    initial:        email.charAt(0).toUpperCase(),
    activities:     profile.activities as ActivityType[],
    follow_through: profile.follow_through,
    openness:       profile.openness,
    is_me:          true,
  } : null

  const allActivities = Object.keys(ACTIVITY_META) as ActivityType[]

  return (
    <div style={s.page}>
      <div style={s.header}>
        <h1 style={s.title}>Profile</h1>
      </div>

      {/* Identity */}
      <div style={s.card}>
        <div style={s.identity}>
          <div style={s.avatar}>
            {email.charAt(0).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <p style={s.name}>{email.split('@')[0]}</p>
            <span style={s.campusChip}>✓ verified · {getCampusName(campus)}</span>
            <p style={s.emailText}>{email}</p>
          </div>
        </div>
      </div>

      {/* Applicant card preview */}
      {previewApplicant && (
        <div style={{ padding: '0 16px 20px' }}>
          <p style={s.sectionLabel}>HOW YOU APPEAR TO OTHERS</p>
          <p style={s.sectionSub}>This is what plan creators see when you apply.</p>
          <ApplicantCard
            applicant={previewApplicant}
            isCreator={false}
            isPressing={false}
            isPreview={true}
          />
          <p style={{ fontSize: 12, color: 'var(--sage)', marginTop: 8, textAlign: 'center' }}>
            Name only revealed after mutual yes.
          </p>
        </div>
      )}

      {/* Activity preferences */}
      {profile && (
        <div style={{ padding: '0 16px 20px' }}>
          <p style={s.sectionLabel}>YOUR VIBE</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {allActivities.map(a => {
              const active = profile.activities.includes(a)
              return (
                <span key={a} style={{
                  fontSize: 13,
                  padding: '5px 12px',
                  borderRadius: 9999,
                  background: active ? 'var(--forest)' : 'transparent',
                  color: active ? 'var(--butter)' : 'var(--sage)',
                  border: active ? 'none' : '1px solid var(--sage)',
                  textDecoration: active ? 'none' : 'line-through',
                  fontWeight: active ? 500 : 400,
                }}>
                  {ACTIVITY_META[a].icon} {ACTIVITY_META[a].label}
                </span>
              )
            })}
          </div>
          <button
            onClick={() => router.push('/onboarding')}
            style={{ ...s.ghostBtn, marginTop: 12, fontSize: 13 }}
          >
            Update preferences
          </button>
        </div>
      )}

      {/* Privacy reminder */}
      <div style={s.privacyBox}>
        <p style={s.privacyText}>
          🔒 Your last name is never shared by Vovu. Ever.
          Exact plans only revealed after mutual yes.
          Campus email only shared to your match.
        </p>
      </div>

      {/* Actions */}
      <div style={{ padding: '0 16px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button onClick={() => router.push('/onboarding')} style={s.ghostBtn}>
          Update my profile
        </button>
        <button onClick={handleSignOut} style={s.ghostBtn}>
          Sign out
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'var(--butter)' },
  header: { padding: '20px 16px 12px' },
  title: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 'bold', color: 'var(--forest)' },
  card: { background: 'var(--white)', margin: '0 16px 20px', borderRadius: 16, padding: 16, border: '1px solid var(--border)' },
  identity: { display: 'flex', gap: 14, alignItems: 'flex-start' },
  avatar: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'var(--butter)', border: '2px solid var(--forest)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: 28, color: 'var(--forest)',
    flexShrink: 0,
  },
  name: { fontFamily: 'Georgia, serif', fontSize: 18, fontWeight: 'bold', color: 'var(--forest)', marginBottom: 4 },
  campusChip: { fontSize: 12, background: 'var(--mist)', color: 'var(--forest)', padding: '2px 10px', borderRadius: 9999, display: 'inline-block', marginBottom: 4 },
  emailText: { fontSize: 13, color: 'var(--sage)', marginTop: 4 },
  sectionLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--sage)', marginBottom: 4 },
  sectionSub: { fontSize: 13, color: 'var(--sage)', marginBottom: 12 },
  privacyBox: { background: 'var(--mist)', margin: '0 16px 20px', borderRadius: 12, padding: 16 },
  privacyText: { fontSize: 13, color: 'var(--forest)', lineHeight: 1.6 },
  ghostBtn: {
    width: '100%', height: 48, background: 'transparent',
    border: '1.5px solid var(--forest)', borderRadius: 12,
    fontSize: 14, fontWeight: 500, color: 'var(--forest)', cursor: 'pointer',
  },
}
