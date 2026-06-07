import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.toLowerCase()
  if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })

  try {
    const db = createServerClient()
    const { data: user } = await db
      .from('users')
      .select('id, campus')
      .eq('email', email)
      .single()
    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const { data: profile } = await db
      .from('profiles')
      .select('activities')
      .eq('id', user.id)
      .single()

    const activities: string[] = profile?.activities ?? []

    // Expire old plans first
    await db.rpc('expire_plans')

    let query = db
      .from('plans')
      .select('*')
      .eq('campus', user.campus)
      .eq('is_active', true)
      .neq('creator_id', user.id)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })

    if (activities.length > 0) {
      query = query.in('activity', activities)
    }

    const { data: plans } = await query

    // Attach applicant counts and already_applied flag
    const enriched = await Promise.all(
      (plans ?? []).map(async plan => {
        const { count } = await db
          .from('applications')
          .select('*', { count: 'exact', head: true })
          .eq('plan_id', plan.id)

        const { data: myApp } = await db
          .from('applications')
          .select('id')
          .eq('plan_id', plan.id)
          .eq('applicant_id', user.id)
          .maybeSingle()

        return {
          ...plan,
          exact_location: null,  // never expose to feed viewers
          exact_time: null,
          applicant_count: count ?? 0,
          already_applied: !!myApp,
        }
      })
    )

    return NextResponse.json({ plans: enriched })
  } catch (err) {
    console.error('GET /api/plans error:', err)
    return NextResponse.json({ error: 'Failed to load plans.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, plan } = body
    if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })

    const db = createServerClient()
    const { data: user } = await db
      .from('users')
      .select('id, campus, verified')
      .eq('email', email.toLowerCase())
      .single()

    if (!user) return NextResponse.json({ error: 'User not found.' }, { status: 404 })
    if (!user.verified) return NextResponse.json({ error: 'Email not verified.' }, { status: 403 })

    // Validate required fields
    const { activity, zone, timeWindow, exactLocation, exactTime, note, spots } = plan
    if (!activity || !zone || !timeWindow || !exactLocation || !exactTime) {
      return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
    }
    if (![1,2,3].includes(spots)) {
      return NextResponse.json({ error: 'Spots must be 1–3.' }, { status: 400 })
    }
    if (note && note.length > 120) {
      return NextResponse.json({ error: 'Note too long.' }, { status: 400 })
    }

    // Rate limit: max 2 active plans
    const { count } = await db
      .from('plans')
      .select('*', { count: 'exact', head: true })
      .eq('creator_id', user.id)
      .eq('is_active', true)

    if ((count ?? 0) >= 2) {
      return NextResponse.json(
        { error: 'You already have 2 active plans. Wait for one to expire or match.' },
        { status: 429 }
      )
    }

    const expiresAt = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString()

    const { data: newPlan, error } = await db
      .from('plans')
      .insert({
        creator_id:     user.id,
        campus:         user.campus,
        activity,
        zone,
        time_window:    timeWindow,
        exact_location: exactLocation,
        exact_time:     exactTime,
        note:           note ?? null,
        spots:          spots ?? 1,
        expires_at:     expiresAt,
      })
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ plan: newPlan })
  } catch (err) {
    console.error('POST /api/plans error:', err)
    return NextResponse.json({ error: 'Failed to create plan.' }, { status: 500 })
  }
}
