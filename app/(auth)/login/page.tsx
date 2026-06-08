'use client'

import { useState, useRef } from 'react'
import Logo from '@/components/Logo'
import { isEduEmail, getEmailDomain, getCampusName } from '@/lib/utils'

export default function LoginPage() {
  const [email,        setEmail]        = useState('')
  const [sent,         setSent]         = useState(false)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState('')
  const [inputFocused, setInputFocused] = useState(false)
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
            onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
          <h1 style={{ ...s.sentTitle, marginTop: 24 }}>Check your inbox</h1>
          <p style={s.sentBody}>
            We sent a link to{' '}
            <strong style={{ color: 'var(--forest)', fontWeight: 600 }}>{email}</strong>.
          </p>
          <p style={{ fontSize: 12, color: 'var(--sage)', marginTop: 16, textAlign: 'center' }}>
            Expires in 15 minutes.
          </p>
          <button onClick={() => setSent(false)} style={{ ...s.ghost, marginTop: 32 }}>
            ← Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={s.page}>
      <div style={s.inner}>
        {/* Hero illustration */}
        <img
          src="/Welcome--Streamline-Dhaka.png"
          alt=""
          width={200}
          height={200}
          style={{ objectFit: 'contain', display: 'block', margin: '0 auto' }}
          onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
        />

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginTop: 20, marginBottom: 6 }}>
          <Logo size="md" />
          <span style={s.brand}>Vovu</span>
        </div>
        <p style={s.tagline}>Plans that find you.</p>

        <div style={{ height: 32 }} />

        {/* Form card */}
        <div style={s.formCard}>
          <form onSubmit={handleSubmit}>
            <label style={s.label}>School email</label>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={e => { setEmail(e.target.value); setError('') }}
              onFocus={() => setInputFocused(true)}
              onBlur={() => {
                setInputFocused(false)
                if (email && !valid) setError('Use your .edu email to continue.')
              }}
              placeholder="you@university.edu"
              style={{
                ...s.input,
                borderColor: error ? '#dc2626' : inputFocused ? 'var(--forest)' : valid ? '#1A7F5A' : 'var(--border)',
                background: inputFocused ? 'var(--white)' : 'var(--butter)',
              }}
              autoFocus
              autoComplete="email"
              inputMode="email"
            />

            {valid && campusName && (
              <div className="fade-in-opacity" style={s.campusRow}>
                <div style={s.greenDot} />
                <span style={s.campusText}>{campusName}</span>
              </div>
            )}

            {error && (
              <div className="fade-in-opacity" style={s.errorText}>{error}</div>
            )}

            <button
              type="submit"
              disabled={!valid || loading}
              style={{
                ...s.btn,
                ...(!valid || loading ? s.btnDisabled : {}),
                marginTop: 20,
              }}
            >
              {loading ? 'Sending…' : 'Send me a link →'}
            </button>
          </form>
        </div>

        <button onClick={handleDemo} style={s.demoLink}>
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
    border: '1.5px solid var(--border)',
    borderRadius: 'var(--radius-md)',
    padding: '0 16px',
    fontSize: 16,
    color: 'var(--forest)',
    outline: 'none',
    transition: 'border-color 200ms ease, background 200ms ease',
  },
  campusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    background: '#16a34a',
    flexShrink: 0,
  },
  campusText: {
    fontSize: 13,
    color: '#16a34a',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    marginTop: 6,
  },
  btn: {
    width: '100%',
    height: 52,
    background: 'var(--forest)',
    color: 'var(--butter)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 15,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 150ms ease, transform 150ms ease',
  },
  btnDisabled: {
    background: '#E5E5E5',
    color: 'var(--sage)',
    cursor: 'not-allowed',
  },
  demoLink: {
    background: 'transparent',
    border: 'none',
    fontSize: 13,
    color: 'var(--sage)',
    cursor: 'pointer',
    marginTop: 16,
  },
  ghost: {
    background: 'transparent',
    border: 'none',
    fontSize: 13,
    color: 'var(--sage)',
    cursor: 'pointer',
    textDecoration: 'underline',
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
