import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })

    const db = createServerClient()
    const { data: user } = await db
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase())
      .single()
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const { data: plan } = await db
      .from('plans')
      .select('id, creator_id, spots, is_active')
      .eq('id', id)
      .single()
    if (!plan) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 })
    if (!plan.is_active) return NextResponse.json({ error: 'Plan is no longer active.' }, { status: 400 })
    if (plan.creator_id === user.id) return NextResponse.json({ error: 'You cannot apply to your own plan.' }, { status: 400 })

    // Check spots
    const { count } = await db
      .from('applications')
      .select('*', { count: 'exact', head: true })
      .eq('plan_id', id)
    if ((count ?? 0) >= plan.spots) {
      return NextResponse.json({ error: 'Plan is full.' }, { status: 400 })
    }

    // Check already applied
    const { data: existing } = await db
      .from('applications')
      .select('id')
      .eq('plan_id', id)
      .eq('applicant_id', user.id)
      .maybeSingle()
    if (existing) return NextResponse.json({ error: 'Already applied.' }, { status: 400 })

    await db.from('applications').insert({
      plan_id:      id,
      applicant_id: user.id,
      status:       'pending',
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('POST /apply error:', err)
    return NextResponse.json({ error: 'Failed to apply.' }, { status: 500 })
  }
}
