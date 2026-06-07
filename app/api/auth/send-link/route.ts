import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { sendMagicLink } from '@/lib/email'
import { isEduEmail, getEmailDomain, getCampusName } from '@/lib/utils'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !isEduEmail(email)) {
      return NextResponse.json({ error: 'Use a .edu email.' }, { status: 400 })
    }

    const emailLower = email.toLowerCase()
    const domain     = getEmailDomain(emailLower)
    const campus     = domain
    const campusName = getCampusName(domain)
    const db         = createServerClient()

    // Rate limit: max 3 links per email per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await db
      .from('magic_links')
      .select('*', { count: 'exact', head: true })
      .eq('email', emailLower)
      .gte('created_at', oneHourAgo)

    if ((count ?? 0) >= 3) {
      return NextResponse.json(
        { error: 'Too many requests. Try again in an hour.' },
        { status: 429 }
      )
    }

    // Upsert user
    await db.from('users').upsert(
      { email: emailLower, campus, verified: false },
      { onConflict: 'email', ignoreDuplicates: false }
    )

    // Generate token
    const token    = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    await db.from('magic_links').insert({ email: emailLower, token, expires_at: expiresAt })

    // Send email
    await sendMagicLink(emailLower, token, campusName)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('send-link error:', err)
    return NextResponse.json({ error: 'Failed to send link.' }, { status: 500 })
  }
}
