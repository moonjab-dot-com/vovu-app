import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { sendMatchReveal } from '@/lib/email'
import { ACTIVITY_META } from '@/lib/constants'
import { ActivityType } from '@/lib/types'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const { email, applicant_id } = await req.json()
    if (!email || !applicant_id) {
      return NextResponse.json({ error: 'Missing fields.' }, { status: 400 })
    }

    const db = createServerClient()

    // Verify caller is creator
    const { data: creator } = await db
      .from('users')
      .select('id, email, first_name')
      .eq('email', email.toLowerCase())
      .single()
    if (!creator) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const { data: plan } = await db
      .from('plans')
      .select('*')
      .eq('id', id)
      .eq('creator_id', creator.id)
      .single()
    if (!plan) return NextResponse.json({ error: 'Plan not found or unauthorized.' }, { status: 403 })

    // Verify application
    const { data: app } = await db
      .from('applications')
      .select('*')
      .eq('plan_id', id)
      .eq('applicant_id', applicant_id)
      .eq('status', 'pending')
      .single()
    if (!app) return NextResponse.json({ error: 'Application not found.' }, { status: 404 })

    // Get applicant
    const { data: applicant } = await db
      .from('users')
      .select('id, email, first_name')
      .eq('id', applicant_id)
      .single()
    if (!applicant) return NextResponse.json({ error: 'Applicant not found.' }, { status: 404 })

    // Update application status → matched (for this simplified YES → immediate reveal flow)
    await db
      .from('applications')
      .update({ status: 'matched' })
      .eq('id', app.id)

    // Insert match record
    await db.from('matches').insert({
      plan_id:        id,
      creator_id:     creator.id,
      applicant_id:   applicant.id,
      activity:       plan.activity,
      exact_location: plan.exact_location,
      exact_time:     plan.exact_time,
    })

    // Close the plan
    await db.from('plans')
      .update({ is_matched: true, is_active: false })
      .eq('id', id)

    const activityLabel = ACTIVITY_META[plan.activity as ActivityType]?.label ?? plan.activity

    // Send reveal emails to BOTH parties simultaneously
    await Promise.all([
      sendMatchReveal({
        to:             creator.email,
        firstName:      creator.first_name ?? 'there',
        matchFirstName: applicant.first_name ?? 'your match',
        matchEmail:     applicant.email,
        activity:       activityLabel,
        exactLocation:  plan.exact_location,
        exactTime:      plan.exact_time,
      }),
      sendMatchReveal({
        to:             applicant.email,
        firstName:      applicant.first_name ?? 'there',
        matchFirstName: creator.first_name ?? 'your match',
        matchEmail:     creator.email,
        activity:       activityLabel,
        exactLocation:  plan.exact_location,
        exactTime:      plan.exact_time,
      }),
    ])

    return NextResponse.json({
      ok: true,
      match: {
        match_first_name: applicant.first_name,
        match_email:      applicant.email,
        exact_location:   plan.exact_location,
        exact_time:       plan.exact_time,
        activity:         activityLabel,
      },
    })
  } catch (err) {
    console.error('POST /yes error:', err)
    return NextResponse.json({ error: 'Failed to confirm match.' }, { status: 500 })
  }
}
