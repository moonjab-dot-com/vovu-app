export const dynamic = 'force-static'
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(req: NextRequest) {
  try {
    const { email, first_name } = await req.json()
    if (!email || !first_name?.trim()) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
    }
    const db = createServerClient()
    await db.from('users').update({ first_name: first_name.trim() }).eq('email', email.toLowerCase())
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Failed.' }, { status: 500 })
  }
}
