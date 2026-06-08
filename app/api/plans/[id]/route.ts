export const dynamic = 'force-static'
export function generateStaticParams() { return [] }
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase-server'
import { getInitial } from '@/lib/utils'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const { searchParams } = new URL(req.url)
  const email = searchParams.get('email')?.toLowerCase()
  if (!email) return NextResponse.json({ error: 'Missing email.' }, { status: 400 })

  try {
    const db = createServerClient()

    const { data: viewer } = await db
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    if (!viewer) return NextResponse.json({ error: 'User not found.' }, { status: 404 })

    const { data: plan } = await db
      .from('plans')
      .select('*')
      .eq('id', id)
      .single()
    if (!plan) return NextResponse.json({ error: 'Plan not found.' }, { status: 404 })

    const isCreator = plan.creator_id === viewer.id

    // Strip private fields unless creator
    const planOut = {
      ...plan,
      exact_location: isCreator ? plan.exact_location : null,
      exact_time:     isCreator ? plan.exact_time     : null,
    }

    // Get applications with anonymous profile data
    const { data: apps } = await db
      .from('applications')
      .select('id, applicant_id, status, created_at')
      .eq('plan_id', id)
      .order('created_at', { ascending: true })

    const applicants = await Promise.all(
      (apps ?? []).map(async app => {
        const { data: appUser } = await db
          .from('users')
          .select('first_name')
          .eq('id', app.applicant_id)
          .single()
        const { data: profile } = await db
          .from('profiles')
          .select('activities, follow_through, openness')
          .eq('id', app.applicant_id)
          .single()

        return {
          id:             app.id,
          applicant_id:   app.applicant_id,
          status:         app.status,
          // SECURITY: only return first letter, never full name
          initial:        getInitial(appUser?.first_name ?? null),
          activities:     profile?.activities ?? [],
          follow_through: profile?.follow_through ?? 3,
          openness:       profile?.openness ?? 3,
          is_me:          app.applicant_id === viewer.id,
        }
      })
    )

    return NextResponse.json({ plan: planOut, applicants, is_creator: isCreator })
  } catch (err) {
    console.error('GET /api/plans/[id] error:', err)
    return NextResponse.json({ error: 'Failed.' }, { status: 500 })
  }
}
