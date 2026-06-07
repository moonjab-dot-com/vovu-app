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

  const domain    = getEmailDomain(email.toLowerCase())
  const valid     = isEduEmail(email)
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
      <div style={styles.page}>
        <div style={styles.inner}>
          <div style={{ fontSize: 48, textAlign: 'center', marginBottom: 24 }}>📬</div>
          <h1 style={styles.sentTitle}>Check your inbox</h1>
          <p style={styles.sentBody}>
            We sent a link to <strong>{email}</strong>.
            Click it to enter Vovu.
          </p>
          <p style={{ fontSize: 13, color: 'var(--sage)', marginTop: 12, textAlign: 'center' }}>
            Link expires in 15 minutes.
          </p>
          <button
            onClick={() => setSent(false)}
            style={{ ...styles.ghost, marginTop: 32 }}
          >
            ← Use a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.page}>
      <div style={styles.inner}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <Logo size="lg" />
          <h1 style={styles.brand}>Vovu</h1>
          <p style={styles.tagline}>Plans that find you.</p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <label style={styles.label}>School email</label>
          <input
            ref={inputRef}
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); setError('') }}
            onBlur={() => {
              if (email && !valid) setError('Use your .edu email to continue.')
            }}
            placeholder="you@kenyon.edu"
            style={{
              ...styles.input,
              borderColor: error ? '#dc2626' : valid ? '#1A7F5A' : 'var(--forest)',
            }}
            autoFocus
            autoComplete="email"
            inputMode="email"
          />

          {/* Campus confirmation */}
          {valid && campusName && (
            <div style={{ fontSize: 14, color: '#1A7F5A', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span>✓</span> <span>{campusName}</span>
            </div>
          )}

          {error && (
            <div style={{ fontSize: 13, color: '#dc2626', marginTop: 6 }}>{error}</div>
          )}

          <button
            type="submit"
            disabled={!valid || loading}
            style={{
              ...styles.btn,
              opacity: !valid || loading ? 0.4 : 1,
              marginTop: 20,
            }}
          >
            {loading ? 'Sending…' : 'Send me a link →'}
          </button>
        </form>

        <button onClick={handleDemo} style={styles.demoLink}>
          Skip for demo →
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
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
    fontSize: 32,
    fontWeight: 'bold',
    color: 'var(--forest)',
    marginTop: 12,
    marginBottom: 6,
  },
  tagline: {
    fontSize: 16,
    color: 'var(--sage)',
  },
  label: {
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--sage)',
    display: 'block',
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },
  input: {
    width: '100%',
    height: 52,
    background: 'var(--white)',
    border: '1.5px solid var(--forest)',
    borderRadius: 12,
    padding: '0 16px',
    fontSize: 16,
    color: 'var(--forest)',
    outline: 'none',
  },
  btn: {
    width: '100%',
    height: 52,
    background: 'var(--forest)',
    color: 'var(--butter)',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 500,
    cursor: 'pointer',
  },
  ghost: {
    background: 'transparent',
    border: 'none',
    fontSize: 13,
    color: 'var(--sage)',
    cursor: 'pointer',
    textDecoration: 'underline',
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
