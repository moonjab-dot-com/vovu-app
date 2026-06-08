export const dynamic = 'force-static'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')
  const email = searchParams.get('email')?.toLowerCase()

  if (!token || !email) {
    return NextResponse.json({ error: 'Invalid link.' }, { status: 400 })
  }

  try {
    const db = createServerClient()

    // Validate token
    const { data: link } = await db
      .from('magic_links')
      .select('*')
      .eq('token', token)
      .eq('email', email)
      .eq('used', false)
      .single()

    if (!link) {
      return NextResponse.json({ error: 'Link expired or already used.' }, { status: 400 })
    }
    if (new Date(link.expires_at) < new Date()) {
      return NextResponse.json({ error: 'Link expired.' }, { status: 400 })
    }

    // Mark used
    await db.from('magic_links').update({ used: true }).eq('id', link.id)

    // Mark user verified
    await db.from('users').update({ verified: true }).eq('email', email)

    // Get user + check profile
    const { data: user } = await db
      .from('users')
      .select('id, email, campus, first_name')
      .eq('email', email)
      .single()

    const { data: profile } = await db
      .from('profiles')
      .select('id')
      .eq('id', user?.id)
      .single()

    return NextResponse.json({
      ok: true,
      email: user?.email,
      campus: user?.campus,
      onboarded: !!profile && !!user?.first_name,
    })
  } catch (err) {
    console.error('verify error:', err)
    return NextResponse.json({ error: 'Verification failed.' }, { status: 500 })
  }
}
