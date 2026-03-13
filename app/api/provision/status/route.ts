import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { query } from '@/lib/db'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')
  if (!sessionId) return NextResponse.json({ error: 'Missing session_id' }, { status: 400 })

  try {
    // Get the checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const schoolId = session.metadata?.schoolId
    if (!schoolId) return NextResponse.json({ error: 'Invalid session' }, { status: 400 })

    // Get the school's current status
    const result = await query(
      'SELECT id, name, subdomain, status FROM schools WHERE id = $1',
      [schoolId]
    )
    const school = result.rows[0]
    if (!school) return NextResponse.json({ error: 'School not found' }, { status: 404 })

    return NextResponse.json({ status: school.status, school })
  } catch (error) {
    console.error('Status check error:', error)
    return NextResponse.json({ error: 'Failed to check status' }, { status: 500 })
  }
}
