'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function VerifyInner() {
  const params = useSearchParams()
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'error'>('loading')
  const [error,  setError]  = useState('')

  useEffect(() => {
    const token = params.get('token')
    const email = params.get('email')
    if (!token || !email) { setStatus('error'); setError('Invalid link.'); return }

    fetch(`/api/auth/verify?token=${encodeURIComponent(token)}&email=${encodeURIComponent(email)}`)
      .then(async res => {
        const data = await res.json()
        if (!res.ok) { setStatus('error'); setError(data.error ?? 'Link expired.'); return }
        localStorage.setItem('vovu_email',  data.email)
        localStorage.setItem('vovu_campus', data.campus)
        if (data.onboarded) {
          localStorage.setItem('vovu_onboarded', '1')
          router.replace('/feed')
        } else {
          router.replace('/onboarding')
        }
      })
      .catch(() => { setStatus('error'); setError('Something went wrong.') })
  }, [params, router])

  if (status === 'error') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, flexDirection: 'column', gap: 16 }}>
        <span style={{ fontSize: 40 }}>🔗</span>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: 'var(--forest)' }}>
          {error}
        </p>
        <a href="/login" style={{ fontSize: 14, color: 'var(--sage)' }}>← Back to login</a>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: 32 }}>🥨</div>
      <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: 'var(--forest)' }}>
        Verifying…
      </p>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyInner />
    </Suspense>
  )
}
