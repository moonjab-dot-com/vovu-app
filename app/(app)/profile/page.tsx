'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import ApplicantCard from '@/components/ApplicantCard'
import { ACTIVITY_META } from '@/lib/constants'
import { ActivityType, Profile, User } from '@/lib/types'
import { getCampusName } from '@/lib/utils'

export default function ProfilePage() {
  const router   = useRouter()
  const [user,    setUser]    = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const email  = localStorage.getItem('vovu_email')
    const campus = localStorage.getItem('vovu_campus') ?? ''
    if (!email) { router.replace('/login'); return }

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
      <div style={{ padding: 24, background: 'var(--butter)', minHeight: '100vh' }}>
        <div className="skeleton" style={{ height: 100, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 80 }} />
      </div>
    )
  }

  const email  = user?.email ?? ''
  const campus = user?.campus ?? ''

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

      {/* Identity card */}
      <div style={s.identityCard}>
        <div style={s.identityRow}>
          <div style={s.avatarCol}>
            <div style={s.avatar}>
              {email.charAt(0).toUpperCase()}
            </div>
            <span style={s.campusChip}>
              <span style={s.verifiedDot} />
              verified · {getCampusName(campus)}
            </span>
          </div>

          <div style={s.userInfo}>
            <p style={s.name}>{email.split('@')[0]}</p>
            <p style={s.emailText}>{email}</p>
          </div>

          {/* Leadership illustration — decorative */}
          <img
            src="/Leadership--Streamline-Dhaka.png"
            alt=""
            width={80}
            height={80}
            loading="lazy"
            style={{ objectFit: 'contain', opacity: 0.7, flexShrink: 0, alignSelf: 'flex-start' }}
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      </div>

      {/* Card preview */}
      {previewApplicant && (
        <div style={s.section}>
          <p style={s.sectionLabel}>HOW OTHERS SEE YOU</p>
          <p style={s.sectionSub}>This is your anonymous card when you apply to a plan.</p>
          <ApplicantCard
            applicant={previewApplicant}
            isCreator={false}
            isPressing={false}
            isPreview={true}
          />
        </div>
      )}

      {/* Activity preferences */}
      {profile && (
        <div style={s.sectionCard}>
          <div style={s.sectionHeaderRow}>
            <p style={s.sectionLabel}>YOUR VIBE</p>
            <button
              onClick={() => router.push('/onboarding')}
              style={s.editLink}
            >
              Edit →
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 14 }}>
            {allActivities.map(a => {
              const active = profile.activities.includes(a)
              return (
                <span key={a} style={{
                  fontSize: 12,
                  fontWeight: 500,
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-full)',
                  background: active ? 'var(--forest)' : '#F5F5F5',
                  color: active ? 'var(--butter)' : 'var(--sage)',
                  textDecoration: active ? 'none' : 'line-through',
                }}>
                  {ACTIVITY_META[a].icon} {ACTIVITY_META[a].label}
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Privacy box */}
      <div style={s.privacyBox}>
        <p style={s.privacyTitle}>🔒 Your privacy at Vovu</p>
        <p style={s.privacyRow}>Last name: never shared</p>
        <p style={s.privacyRow}>Exact plans: only after mutual yes</p>
        <p style={s.privacyRow}>Campus email: only to your match</p>
      </div>

      {/* Actions */}
      <div style={s.actions}>
        <button onClick={() => router.push('/onboarding')} style={s.updateBtn}>
          Update my profile →
        </button>
        <button onClick={handleSignOut} style={s.signOutBtn}>
          Sign out
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: { minHeight: '100vh', background: 'var(--butter)' },
  header: { padding: '20px 20px 0' },
  title: { fontFamily: 'Georgia, serif', fontSize: 22, fontWeight: 'bold', color: 'var(--forest)' },

  identityCard: {
    background: 'var(--white)',
    margin: '16px 16px 0',
    borderRadius: 'var(--radius-lg)',
    padding: 24,
    border: '1px solid var(--border)',
    position: 'relative',
    overflow: 'hidden',
  },
  identityRow: {
    display: 'flex',
    gap: 16,
    alignItems: 'flex-start',
  },
  avatarCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
    flexShrink: 0,
  },
  avatar: {
    width: 72, height: 72, borderRadius: '50%',
    background: 'var(--butter)', border: '2px solid var(--forest)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: 28, color: 'var(--forest)',
  },
  campusChip: {
    display: 'inline-flex', alignItems: 'center', gap: 5,
    fontSize: 11, fontWeight: 500,
    background: 'var(--mist)', color: 'var(--forest)',
    padding: '3px 10px', borderRadius: 'var(--radius-full)',
    whiteSpace: 'nowrap',
  },
  verifiedDot: {
    display: 'inline-block', width: 6, height: 6,
    borderRadius: '50%', background: '#1A7F5A', flexShrink: 0,
  },
  userInfo: { flex: 1 },
  name: {
    fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 'bold',
    color: 'var(--forest)', marginBottom: 4,
  },
  emailText: { fontSize: 13, color: 'var(--sage)' },

  section: { padding: '12px 16px 0' },
  sectionCard: {
    background: 'var(--white)',
    margin: '12px 16px 0',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    border: '1px solid var(--border)',
  },
  sectionHeaderRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  sectionLabel: {
    fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.12em',
    color: 'var(--sage)', fontWeight: 500,
  },
  sectionSub: { fontSize: 13, color: 'var(--sage)', marginBottom: 12, marginTop: 4 },
  editLink: {
    background: 'transparent', border: 'none',
    fontSize: 13, color: 'var(--forest)', cursor: 'pointer',
    textDecoration: 'underline', fontWeight: 500,
  },

  privacyBox: {
    background: 'var(--mist)',
    margin: '12px 16px 0',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
  },
  privacyTitle: {
    fontSize: 13, fontWeight: 500, color: 'var(--forest)', marginBottom: 10,
  },
  privacyRow: {
    fontSize: 12, color: 'var(--sage)', lineHeight: 1.8,
  },

  actions: {
    margin: '16px 16px 100px',
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  updateBtn: {
    width: '100%', height: 52,
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    borderRadius: 'var(--radius-md)',
    fontSize: 14, fontWeight: 500, color: 'var(--forest)', cursor: 'pointer',
  },
  signOutBtn: {
    width: '100%', height: 52,
    background: 'var(--white)',
    border: '1.5px solid #dc2626',
    borderRadius: 'var(--radius-md)',
    fontSize: 14, fontWeight: 500, color: '#dc2626', cursor: 'pointer',
  },
}
