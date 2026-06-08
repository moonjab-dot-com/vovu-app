'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import ApplicantCard from '@/components/ApplicantCard'
import Toast from '@/components/Toast'
import { Plan, Applicant, Match } from '@/lib/types'
import { ACTIVITY_META } from '@/lib/constants'
import { ActivityType } from '@/lib/types'

export default function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router  = useRouter()
  const [plan,       setPlan]       = useState<Plan | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [isCreator,  setIsCreator]  = useState(false)
  const [loading,    setLoading]    = useState(true)
  const [pressing,   setPressing]   = useState<string | null>(null)
  const [match,      setMatch]      = useState<Match | null>(null)
  const [toast,      setToast]      = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' })
  const [email,      setEmail]      = useState('')

  function showToast(msg: string, type: 'success' | 'error' = 'success') {
    setToast({ visible: true, message: msg, type })
  }

  useEffect(() => {
    const em = localStorage.getItem('vovu_email') ?? ''
    setEmail(em)
    if (!em) { router.replace('/login'); return }

    fetch(`/api/plans/${id}?email=${encodeURIComponent(em)}`)
      .then(r => r.json())
      .then(data => {
        setPlan(data.plan)
        setApplicants(data.applicants ?? [])
        setIsCreator(data.is_creator)
      })
      .catch(() => showToast('Failed to load plan.', 'error'))
      .finally(() => setLoading(false))
  }, [id, router])

  async function handleYes(applicantId: string) {
    if (!email || !plan) return
    setPressing(applicantId)
    try {
      const res = await fetch(`/api/plans/${plan.id}/yes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, applicant_id: applicantId }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Failed.', 'error'); return }
      setMatch(data.match)
    } catch {
      showToast('Something went wrong.', 'error')
    } finally {
      setPressing(null)
    }
  }

  async function handleApplicantYes() {
    if (!email || !plan) return
    const myApp = applicants.find(a => a.is_me)
    if (!myApp) return
    setPressing(myApp.applicant_id)
    try {
      showToast('You said yes! Waiting for confirmation…')
    } finally {
      setPressing(null)
    }
  }

  const meta  = plan ? ACTIVITY_META[plan.activity as ActivityType] : null
  const myApp = applicants.find(a => a.is_me)

  // ── REVEAL SCREEN ──
  if (match) {
    return (
      <div className="slide-up" style={s.revealPage}>
        <div style={s.revealInner}>
          <img
            src="/Business-Dealsuccess--Streamline-Dhaka.png"
            alt=""
            width={200}
            height={200}
            style={{ objectFit: 'contain', display: 'block', margin: '0 auto 32px' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />

          <p style={s.revealLabel}>IT'S A MATCH</p>

          <div style={s.matchCard}>
            <div style={s.avatarRow}>
              <div style={s.avatarCol}>
                <div style={{ ...s.avatar, background: 'var(--butter)', border: '2px solid var(--forest)', color: 'var(--forest)' }}>
                  {email.charAt(0).toUpperCase()}
                </div>
                <span style={s.avatarLabel}>You</span>
              </div>
              <span style={{ fontSize: 28, alignSelf: 'center' }}>💚</span>
              <div style={s.avatarCol}>
                <div style={{ ...s.avatar, background: 'var(--forest)', border: '2px solid var(--butter)', color: 'var(--butter)' }}>
                  ?
                </div>
                <span className="reveal-name" style={s.revealName}>
                  {match.match_first_name}
                </span>
              </div>
            </div>

            <div style={s.divider} />

            <div style={s.matchDetails}>
              <p style={s.matchRow}>📍 {match.exact_location}</p>
              <p style={s.matchRow}>🕐 {match.exact_time}</p>
              <p style={s.matchRow}>✉️ {match.match_email}</p>
            </div>
            <p style={s.matchFooter}>Last name never shared by Vovu.</p>
          </div>

          <button onClick={() => router.push('/feed')} style={s.feedBtn}>
            Back to feed →
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ padding: 24, background: 'var(--butter)', minHeight: '100vh' }}>
        <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
        <div className="skeleton" style={{ height: 100 }} />
      </div>
    )
  }

  if (!plan) {
    return (
      <div style={{ padding: 24, textAlign: 'center', background: 'var(--butter)', minHeight: '100vh' }}>
        <img
          src="/Something-Went-Wrong--Streamline-Dhaka.png"
          alt=""
          width={160}
          height={160}
          style={{ objectFit: 'contain', display: 'block', margin: '40px auto 16px' }}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 16 }}>Plan not found.</p>
        <button onClick={() => router.back()} style={s.backBtn}>← Go back</button>
      </div>
    )
  }

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <button onClick={() => router.back()} style={s.backBtn}>←</button>
        <h1 style={s.headerTitle}>{meta?.label ?? plan.activity}</h1>
        <div style={{ width: 32 }} />
      </div>

      {/* Plan summary card */}
      <div style={s.planCard}>
        <div style={s.planTop}>
          <div style={s.actIcon}>{meta?.icon ?? '📅'}</div>
          <div style={{ flex: 1 }}>
            <p style={s.actTitle}>{meta?.label ?? plan.activity}</p>
            <p style={s.planMeta}>🕐 {plan.time_window} · 📍 {plan.zone}</p>
          </div>
        </div>
        {plan.note && (
          <p style={s.note}>"{plan.note}"</p>
        )}
        {isCreator && plan.exact_location && (
          <div style={s.privateBox}>
            <p style={s.privateTitle}>🔒 Your private details</p>
            <p style={s.privateRow}>📍 {plan.exact_location}</p>
            <p style={s.privateRow}>🕐 {plan.exact_time}</p>
          </div>
        )}
      </div>

      {/* CREATOR VIEW */}
      {isCreator && (
        <div style={s.section}>
          <p style={s.sectionLabel}>
            ANONYMOUS APPLICANTS · {applicants.length} applied
          </p>
          {applicants.length === 0 && (
            <div style={s.emptyApplicants}>
              <img
                src="/Empty-Inbox--Streamline-Dhaka.png"
                alt=""
                width={160}
                height={160}
                style={{ objectFit: 'contain' }}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: 'var(--forest)', textAlign: 'center' }}>
                No one has applied yet.
              </p>
              <p style={{ fontSize: 13, color: 'var(--sage)', textAlign: 'center' }}>Be patient 🥨</p>
            </div>
          )}
          {pressing && applicants.length > 0 && (
            <div style={s.waitingState}>
              <img
                src="/Patience--Streamline-Dhaka.png"
                alt=""
                width={160}
                height={160}
                style={{ objectFit: 'contain' }}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: 'var(--forest)', textAlign: 'center' }}>
                Confirming your match…
              </p>
              <div style={s.spinner} />
            </div>
          )}
          {!pressing && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {applicants.map(app => (
                <ApplicantCard
                  key={app.id}
                  applicant={app}
                  onYes={() => handleYes(app.applicant_id)}
                  isCreator={true}
                  isPressing={pressing === app.applicant_id}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* APPLICANT VIEW */}
      {!isCreator && myApp && (
        <div style={s.section}>
          {myApp.status === 'pending' && (
            <div style={s.statusCard}>
              <p style={s.statusTitle}>You applied anonymously.</p>
              <p style={s.statusSub}>You'll be notified if the plan creator picks you.</p>
              <div style={{ marginTop: 20 }}>
                <p style={s.sectionLabel}>HOW YOU APPEAR TO THE CREATOR</p>
                <ApplicantCard
                  applicant={myApp}
                  isCreator={false}
                  isPressing={false}
                  isPreview={true}
                />
              </div>
            </div>
          )}

          {myApp.status === 'yes_creator' && (
            <div style={{ ...s.revealPage, minHeight: 'auto', padding: '40px 24px' }}>
              <img
                src="/I-Have-A-Question--Streamline-Dhaka.png"
                alt=""
                width={160}
                height={160}
                style={{ objectFit: 'contain', display: 'block', margin: '0 auto 24px' }}
                loading="lazy"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
              />
              <p style={{ fontFamily: 'Georgia, serif', fontSize: 26, color: 'var(--butter)', textAlign: 'center', marginBottom: 8 }}>
                Someone said yes to you.
              </p>
              <p style={{ fontSize: 17, color: 'var(--sage)', textAlign: 'center', marginBottom: 32 }}>
                Do you want to go?
              </p>
              <button
                onClick={handleApplicantYes}
                disabled={!!pressing}
                style={{
                  ...s.yesBtn,
                  display: 'block',
                  margin: '0 auto',
                  maxWidth: 320,
                  background: 'var(--butter)',
                  color: 'var(--forest)',
                  border: 'none',
                }}
              >
                {pressing ? 'Confirming…' : 'Yes, I\'m in →'}
              </button>
              <button style={{
                display: 'block',
                margin: '12px auto 0',
                maxWidth: 320,
                width: '100%',
                height: 52,
                background: 'transparent',
                border: '1px solid var(--butter)',
                borderRadius: 'var(--radius-md)',
                fontSize: 15,
                color: 'var(--butter)',
                cursor: 'pointer',
              }}>
                Not this time
              </button>
            </div>
          )}

          {myApp.status === 'declined' && (
            <div style={s.statusCard}>
              <p style={s.statusTitle}>You declined this one.</p>
              <p style={s.statusSub}>More plans in the feed.</p>
              <button onClick={() => router.push('/feed')} style={{ ...s.yesBtn, marginTop: 16 }}>
                Back to feed
              </button>
            </div>
          )}
        </div>
      )}

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
  page: { minHeight: '100vh', background: 'var(--butter)' },
  header: {
    padding: '16px 20px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    fontWeight: 'bold',
    color: 'var(--forest)',
    flex: 1,
    textAlign: 'center',
  },
  backBtn: {
    background: 'transparent',
    border: 'none',
    fontSize: 20,
    color: 'var(--forest)',
    cursor: 'pointer',
    padding: 0,
    fontWeight: 500,
    lineHeight: 1,
  },
  planCard: {
    background: 'var(--white)',
    margin: '16px 16px 0',
    borderRadius: 'var(--radius-lg)',
    padding: 16,
    border: '1px solid var(--border)',
  },
  planTop: { display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 10 },
  actIcon: {
    width: 42, height: 42, borderRadius: '50%',
    background: 'var(--mist)', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: 20, flexShrink: 0,
  },
  actTitle: { fontFamily: 'Georgia, serif', fontSize: 17, fontWeight: 'bold', color: 'var(--forest)' },
  planMeta: { fontSize: 13, color: 'var(--sage)', marginTop: 3 },
  note: {
    fontSize: 13,
    color: 'var(--sage)',
    fontStyle: 'italic',
    marginTop: 10,
    paddingLeft: 10,
    borderLeft: '2px solid var(--mist)',
    lineHeight: 1.5,
  },
  privateBox: { background: 'var(--mist)', borderRadius: 'var(--radius-md)', padding: 12, marginTop: 12 },
  privateTitle: { fontSize: 11, fontWeight: 500, color: 'var(--forest)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 },
  privateRow: { fontSize: 13, color: 'var(--forest)', marginBottom: 4 },
  section: { padding: '20px 16px' },
  sectionLabel: {
    fontSize: 11, textTransform: 'uppercase' as const,
    letterSpacing: '0.08em', color: 'var(--sage)', marginBottom: 14,
    fontWeight: 500,
  },
  emptyApplicants: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 24px',
    gap: 12,
  },
  waitingState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '40px 24px',
    gap: 16,
  },
  spinner: {
    width: 24,
    height: 24,
    border: '2px solid var(--mist)',
    borderTopColor: 'var(--forest)',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  statusCard: {
    background: 'var(--white)',
    borderRadius: 'var(--radius-lg)',
    padding: 20,
    border: '1px solid var(--border)',
  },
  statusTitle: { fontFamily: 'Georgia, serif', fontSize: 18, color: 'var(--forest)', marginBottom: 6 },
  statusSub: { fontSize: 14, color: 'var(--sage)', lineHeight: 1.5 },
  yesBtn: {
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
  // Reveal
  revealPage: {
    minHeight: '100vh',
    background: 'var(--forest)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  revealInner: {
    padding: '40px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
  },
  revealLabel: {
    fontSize: 11,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: 'var(--sage)',
    textAlign: 'center',
    marginBottom: 16,
  },
  matchCard: {
    background: 'var(--white)',
    borderRadius: 24,
    padding: '32px 28px',
    maxWidth: 320,
    width: '100%',
  },
  avatarRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: 20,
    marginBottom: 4,
  },
  avatarCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 64, height: 64, borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'Georgia, serif', fontWeight: 'bold', fontSize: 22,
  },
  avatarLabel: {
    fontSize: 12,
    color: 'var(--sage)',
    textAlign: 'center',
  },
  revealName: {
    fontFamily: 'Georgia, serif',
    fontWeight: 'bold',
    fontSize: 18,
    color: 'var(--forest)',
    textAlign: 'center',
  },
  divider: {
    height: 1,
    background: 'var(--border)',
    margin: '24px 0',
  },
  matchDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
  },
  matchRow: { fontSize: 14, color: 'var(--forest)', lineHeight: 1.5 },
  matchFooter: { fontSize: 11, color: 'var(--sage)', textAlign: 'center', marginTop: 20 },
  feedBtn: {
    marginTop: 32,
    height: 52,
    width: 200,
    background: 'var(--butter)',
    color: 'var(--forest)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
  },
}
