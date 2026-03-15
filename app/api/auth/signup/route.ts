import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword, signToken } from '@/lib/auth'
import { generateDbName, generateConnectionString } from '@/lib/provision'

export async function POST(req: NextRequest) {
  try {
    const { adminName, email, password, schoolName, subdomain, plan } = await req.json()

    // ── Validate required fields ─────────────────────────
    if (!adminName || !email || !password || !schoolName || !subdomain || !plan) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const subdomainRegex = /^[a-z0-9]{3,20}$/
    if (!subdomainRegex.test(subdomain)) {
      return NextResponse.json({ error: 'Subdomain must be 3-20 lowercase letters or numbers' }, { status: 400 })
    }

    // ── Check subdomain availability ─────────────────────
    const existingSubdomain = await query(
      'SELECT id FROM schools WHERE subdomain = $1',
      [subdomain]
    )
    if (existingSubdomain.rows.length > 0) {
      return NextResponse.json({ error: 'That subdomain is already taken' }, { status: 400 })
    }

    // ── Check email availability ─────────────────────────
    const existingEmail = await query(
      'SELECT id FROM schools WHERE admin_email = $1',
      [email.toLowerCase()]
    )
    if (existingEmail.rows.length > 0) {
      return NextResponse.json({ error: 'An account with that email already exists' }, { status: 400 })
    }

    // ── Validate plan ────────────────────────────────────
    const validPlans = ['starter', 'growth', 'pro']
    if (!validPlans.includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan selected' }, { status: 400 })
    }

    // ── Create school record ─────────────────────────────
    const passwordHash = await hashPassword(password)
    const dbName = generateDbName(subdomain)
    const dbConnectionString = generateConnectionString(dbName)

    const result = await query(`
      INSERT INTO schools (
        name, subdomain, admin_email, admin_password_hash,
        admin_name, plan, status, db_name, db_connection_string
      ) VALUES ($1, $2, $3, $4, $5, $6, 'pending', $7, $8)
      RETURNING id, name, subdomain, plan, status
    `, [
      schoolName,
      subdomain,
      email.toLowerCase(),
      passwordHash,
      adminName,
      plan,
      dbName,
      dbConnectionString
    ])

    const school = result.rows[0]

    // ── Sign JWT and set cookie ──────────────────────────
    const token = signToken({
      schoolId: school.id,
      subdomain: school.subdomain,
    })

    const response = NextResponse.json({
      success: true,
      school: {
        id: school.id,
        name: school.name,
        subdomain: school.subdomain,
        plan: school.plan,
        status: school.status,
      }
    }, { status: 201 })

    response.cookies.set('xeno_school_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 })
  }
}

// Check subdomain availability (called live as user types)
export async function GET(req: NextRequest) {
  const subdomain = req.nextUrl.searchParams.get('subdomain')
  if (!subdomain) return NextResponse.json({ error: 'Missing subdomain' }, { status: 400 })

  const result = await query(
    'SELECT id FROM schools WHERE subdomain = $1',
    [subdomain]
  )

  return NextResponse.json({ available: result.rows.length === 0 })
}