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
      <div style={s.page}>
        <img
          src="/Something-Went-Wrong--Streamline-Dhaka.png"
          alt=""
          width={160}
          height={160}
          style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }}
          loading="lazy"
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />
        <p style={{ ...s.title, marginTop: 24 }}>{error}</p>
        <a href="/login" style={s.link}>← Back to login</a>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <img
        src="/Patience--Streamline-Dhaka.png"
        alt=""
        width={160}
        height={160}
        style={{ objectFit: 'contain', display: 'block', margin: '0 auto', opacity: 0.7 }}
        loading="lazy"
        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
      />
      <p style={{ ...s.title, marginTop: 24 }}>Verifying…</p>
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

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'var(--butter)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'column',
    gap: 16,
    padding: 24,
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: 20,
    color: 'var(--forest)',
    textAlign: 'center',
  },
  link: {
    fontSize: 14,
    color: 'var(--sage)',
    textDecoration: 'none',
  },
}
