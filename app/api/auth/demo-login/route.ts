import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    const emailLower = (email ?? 'demo1@kenyon.edu').toLowerCase()
    const db = createServerClient()

    // Upsert demo user
    const domain = emailLower.split('@')[1]
    await db.from('users').upsert(
      { email: emailLower, campus: domain, verified: true },
      { onConflict: 'email' }
    )

    const { data: user } = await db
      .from('users')
      .select('id, email, campus, first_name')
      .eq('email', emailLower)
      .single()

    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('id', user?.id)
      .maybeSingle()

    return NextResponse.json({
      ok: true,
      email: user?.email,
      campus: user?.campus,
      onboarded: !!profile && !!user?.first_name,
    })
  } catch (err) {
    console.error('demo-login error:', err)
    return NextResponse.json({ error: 'Demo login failed.' }, { status: 500 })
  }
}
