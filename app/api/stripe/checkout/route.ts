import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS, PlanName } from '@/lib/stripe'
import { query } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import { generateDbName, generateConnectionString } from '@/lib/provision'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const { adminName, email, password, schoolName, subdomain, plan } = await req.json()

    // Validate required fields
    if (!adminName || !email || !password || !schoolName || !subdomain || !plan) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }

    // Check subdomain is available
    const existing = await query('SELECT id FROM schools WHERE subdomain = $1', [subdomain])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'Subdomain already taken' }, { status: 400 })
    }

    // Check email is not already registered
    const existingEmail = await query('SELECT id FROM schools WHERE admin_email = $1', [email])
    if (existingEmail.rows.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const planConfig = PLANS[plan as PlanName]
    if (!planConfig) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Generate DB info
    const dbName = generateDbName(subdomain)
    const dbConnectionString = generateConnectionString(dbName)

    // Create school record in pending state
    const schoolResult = await query(`
      INSERT INTO schools (
        name, subdomain, admin_email, admin_password_hash, admin_name,
        plan, status, db_name, db_connection_string
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
      RETURNING id
    `, [schoolName, subdomain, email, passwordHash, adminName, plan, dbName, dbConnectionString])

    const schoolId = schoolResult.rows[0].id

    // Create Stripe customer
    const customer = await stripe.customers.create({
      email,
      name: schoolName,
      metadata: { schoolId, subdomain, plan },
    })

    // Update school with Stripe customer ID
    await query('UPDATE schools SET stripe_customer_id = $1 WHERE id = $2', [customer.id, schoolId])

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/signup?cancelled=true`,
      metadata: { schoolId, subdomain },
      subscription_data: {
        metadata: { schoolId, subdomain },
      },
    })

    return NextResponse.json({ url: session.url })

  } catch (error) {
    console.error('Checkout error:', error)
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 })
  }
}
