export const dynamic = 'force-static'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.toLowerCase()
  if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })

  try {
    const db = createServerClient()
    const { data: user } = await db.from('users').select('id').eq('email', email).single()
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const { data: profile } = await db.from('profiles').select('*').eq('id', user.id).single()
    return NextResponse.json({ profile })
  } catch {
    return NextResponse.json({ error: 'Failed.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, profile } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })

    const db = createServerClient()
    const { data: user } = await db.from('users').select('id').eq('email', email.toLowerCase()).single()
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    await db.from('profiles').upsert(
      { id: user.id, ...profile, updated_at: new Date().toISOString() },
      { onConflict: 'id' }
    )
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('profile POST error:', err)
    return NextResponse.json({ error: 'Failed.' }, { status: 500 })
  }
}
