import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { verifyPassword, signToken } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
    }

    // Find school by admin email
    const result = await query(
      'SELECT * FROM schools WHERE admin_email = $1',
      [email]
    )
    const school = result.rows[0]

    if (!school) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Verify password
    const valid = await verifyPassword(password, school.admin_password_hash)
    if (!valid) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    // Check school status
    if (school.status === 'suspended') {
      return NextResponse.json({ error: 'Your account is suspended. Please update your billing.' }, { status: 403 })
    }
    if (school.status === 'cancelled') {
      return NextResponse.json({ error: 'Your subscription has been cancelled.' }, { status: 403 })
    }
    // Note: pending/provisioning allowed through — provisioning runs in background

    // Sign JWT
    const token = await signToken({
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
      }
    })

    response.cookies.set('xeno_school_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}