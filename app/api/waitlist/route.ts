import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { isEduEmail, getEmailDomain } from '@/lib/utils'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !isEduEmail(email)) {
      return NextResponse.json({ error: 'Use a .edu email.' }, { status: 400 })
    }
    const emailLower = email.toLowerCase()
    const campus     = getEmailDomain(emailLower)
    const db         = createServerClient()

    await db.from('waitlist').upsert(
      { email: emailLower, campus },
      { onConflict: 'email', ignoreDuplicates: true }
    )
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed.' }, { status: 500 })
  }
}
