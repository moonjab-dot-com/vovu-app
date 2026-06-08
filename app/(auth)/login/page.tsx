'use client'

import { useState, useRef } from 'react'
import Logo from '@/components/Logo'
import { isEduEmail, getEmailDomain, getCampusName } from '@/lib/utils'

export default function LoginPage() {
  const [email,   setEmail]   = useState('')
  const [sent,    setSent]    = useState(false)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const domain     = getEmailDomain(email.toLowerCase())
  const valid      = isEduEmail(email)
  const campusName = valid ? getCampusName(domain) : null

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/send-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? 'Something went wrong.'); return }
      setSent(true)
    } catch {
      setError('Network error. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDemo() {
    const demoEmail = 'demo1@kenyon.edu'
    setLoading(true)
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: demoEmail }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.setItem('vovu_email',  data.email)
        localStorage.setItem('vovu_campus', data.campus)
        if (data.onboarded) {
          localStorage.setItem('vovu_onboarded', '1')
          window.location.href = '/feed'
        } else {
          window.location.href = '/onboarding'
        }
      }
    } catch {
      setError('Demo login failed.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div style={s.page}>
        <div style={s.inner}>
          <img
            src="/Enter-Your-Password--Streamline-Dhaka.png"
            alt=""
            width={200}
            height={200}
            style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <h1 style={{ ...s.sentTitle, marginTop: 24 }}>Check your inbox</h1>
          <p style={s.sentBody}>
            We sent a link to{' '}
            <strong style={{ color: 'var(--forest)' }}>{email}</strong>.
          </p>
          <p style={{ fontSize: 12, color: 'var(--sage)', marginTop: 16, textAlign: 'center' }}>
            Expires in 15 minutes.
          </p>
          <button onClick={() => setSent(false)} style={s.demoLink}>
            ← Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        {/* Illustration */}
        <img
          src="/Welcome--Streamline-Dhaka.png"
          alt=""
          width={200}
          height={200}
          style={{ objectFit: 'contain', display: 'block', margin: '0 auto 28px' }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
        />

        {/* Wordmark row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 8 }}>
          <Logo size="md" />
          <span style={s.brand}>Vovu</span>
        </div>

        {/* Tagline */}
        <p style={s.tagline}>Plans that find you.</p>

        {/* Spacer */}
        <div style={{ height: 32 }} />

        {/* Form card */}
        <div style={s.formCard}>
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <label style={s.label}>School email</label>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onBlur={() => {
                if (email && !valid) setError('Use your .edu email to continue.')
              }}
              placeholder="you@university.edu"
              style={{
                ...s.input,
                borderColor: error ? '#dc2626' : valid ? '#1A7F5A' : 'var(--border)',
              }}
              autoFocus
              autoComplete="email"
              inputMode="email"
            />

            {/* Campus confirmation */}
            {valid && campusName && (
              <div className="fade-in-fast" style={{ fontSize: 13, color: '#1A7F5A', marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
                <span>{campusName}</span>
              </div>
            )}

            {error && (
              <div className="fade-in-fast" style={{ fontSize: 13, color: '#dc2626', marginTop: 6 }}>{error}</div>
            )}

            <button
              type="submit"
              disabled={!valid || loading}
              style={{
                ...s.btn,
                background: !valid || loading ? '#E5E5E5' : 'var(--forest)',
                color: !valid || loading ? 'var(--sage)' : 'var(--butter)',
                cursor: !valid || loading ? 'not-allowed' : 'pointer',
                marginTop: 20,
              }}
            >
              {loading ? 'Sending…' : 'Send me a link →'}
            </button>
          </form>
        </div>

        <button onClick={handleDemo} disabled={loading} style={s.demoLink}>
          Skip for demo →
        </button>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: 'var(--butter)',
  },
  inner: {
    width: '100%',
    maxWidth: 360,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  brand: {
    fontFamily: 'Georgia, serif',
    fontSize: 28,
    fontWeight: 'bold',
    color: 'var(--forest)',
  },
  tagline: {
    fontFamily: 'Georgia, serif',
    fontStyle: 'italic',
    fontSize: 16,
    color: 'var(--sage)',
    textAlign: 'center',
  },
  formCard: {
    width: '100%',
    background: 'var(--white)',
    borderRadius: 20,
    padding: '28px 24px',
    border: '1px solid var(--border)',
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--sage)',
    display: 'block',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    height: 52,
    background: 'var(--butter)',
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0 16px',
    fontSize: 16,
    color: 'var(--forest)',
    outline: 'none',
    transition: 'border-color 200ms, background 200ms',
  },
  btn: {
    width: '100%',
    height: 52,
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 500,
    transition: 'background 150ms, transform 150ms',
  },
  demoLink: {
    background: 'transparent',
    border: 'none',
    fontSize: 13,
    color: 'var(--sage)',
    cursor: 'pointer',
    marginTop: 16,
  },
  sentTitle: {
    fontFamily: 'Georgia, serif',
    fontSize: 22,
    color: 'var(--forest)',
    textAlign: 'center',
    marginBottom: 12,
  },
  sentBody: {
    fontSize: 15,
    color: 'var(--sage)',
    lineHeight: 1.6,
    textAlign: 'center',
  },
}
