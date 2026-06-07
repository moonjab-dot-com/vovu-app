'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import PlanCard from '@/components/PlanCard'
import Toast from '@/components/Toast'
import { Plan } from '@/lib/types'
import { getCampusName } from '@/lib/utils'

export default function FeedPage() {
  const router = useRouter()
  const [plans,   setPlans]   = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')
  const [email,   setEmail]   = useState('')
  const [campus,  setCampus]  = useState('')
  const [toast,   setToast]   = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' })

  function showToast(message: string, type: 'success' | 'error' = 'success') {
    setToast({ visible: true, message, type })
  }
  function hideToast() { setToast(t => ({ ...t, visible: false })) }

  const loadPlans = useCallback(async (em: string) => {
    setLoading(true)
    setError('')
    try {
      const res  = await fetch(`/api/plans?email=${encodeURIComponent(em)}`)
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Failed to load plans.'); return }
      setPlans(data.plans ?? [])
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const em = localStorage.getItem('vovu_email') ?? ''
    const ca = localStorage.getItem('vovu_campus') ?? ''
    setEmail(em)
    setCampus(ca)
    if (em) loadPlans(em)
  }, [loadPlans])

  async function handleApply(planId: string) {
    if (!email) return
    try {
      const res  = await fetch(`/api/plans/${planId}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) { showToast(data.error ?? 'Failed to apply.', 'error'); return }
      showToast('Applied! 🥨')
      setPlans(prev => prev.map(p =>
        p.id === planId
          ? { ...p, already_applied: true, applicant_count: (p.applicant_count ?? 0) + 1 }
          : p
      ))
    } catch {
      showToast('Something went wrong. Try again.', 'error')
    }
  }

  const campusName = getCampusName(campus)

  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Vovu</h1>
          {campus && (
            <span style={s.campusChip}>✓ {campusName}</span>
          )}
        </div>
        <span style={s.countLabel}>
          {loading ? '' : `${plans.length} plan${plans.length !== 1 ? 's' : ''} for you`}
        </span>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '0 16px' }}>
          {[0,1,2].map(i => (
            <div key={i} className="skeleton" style={{ height: 120, animationDelay: `${i * 150}ms` }} />
          ))}
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div style={s.center}>
          <p style={s.errText}>{error}</p>
          <button onClick={() => email && loadPlans(email)} style={s.retryBtn}>
            Try again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && plans.length === 0 && (
        <div style={s.center}>
          <span style={{ fontSize: 40 }}>🌱</span>
          <p style={s.emptyTitle}>No plans match your vibe yet.</p>
          <p style={s.emptySubtitle}>Be the first to post one.</p>
          <button onClick={() => router.push('/post')} style={s.emptyBtn}>
            Post a plan →
          </button>
        </div>
      )}

      {/* Feed */}
      {!loading && !error && plans.length > 0 && (
        <div style={s.feed}>
          {plans.map((plan, i) => (
            <div
              key={plan.id}
              className="fade-in"
              style={{ animationDelay: `${i * 50}ms`, opacity: 0 }}
              onClick={() => router.push(`/plan/${plan.id}`)}
            >
              <PlanCard
                plan={plan}
                onApply={handleApply}
                applied={plan.already_applied ?? false}
              />
            </div>
          ))}
        </div>
      )}

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={hideToast}
      />
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--butter)',
    paddingTop: 0,
  },
  header: {
    padding: '20px 16px 12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 22,
    fontWeight: 'bold',
    color: 'var(--forest)',
    display: 'inline',
    marginRight: 10,
  },
  campusChip: {
    fontSize: 12,
    background: 'var(--mist)',
    color: 'var(--forest)',
    padding: '3px 10px',
    borderRadius: 9999,
    fontWeight: 500,
  },
  countLabel: {
    fontSize: 12,
    color: 'var(--sage)',
  },
  feed: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    padding: '0 16px 16px',
  },
  center: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '80px 24px',
    gap: 12,
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: 18,
    color: 'var(--forest)',
  },
  emptySubtitle: {
    fontSize: 14,
    color: 'var(--sage)',
  },
  emptyBtn: {
    marginTop: 8,
    height: 48,
    background: 'var(--forest)',
    color: 'var(--butter)',
    border: 'none',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    padding: '0 24px',
  },
  errText: {
    fontSize: 15,
    color: 'var(--forest)',
  },
  retryBtn: {
    height: 40,
    background: 'transparent',
    border: '1.5px solid var(--forest)',
    borderRadius: 10,
    fontSize: 14,
    color: 'var(--forest)',
    cursor: 'pointer',
    padding: '0 20px',
  },
}
