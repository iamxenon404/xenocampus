// !! DELETE THIS FILE AFTER CREATING YOUR ADMIN ACCOUNT !!
import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

export async function POST(req: NextRequest) {
  const { seedKey } = await req.json()

  // Protect with JWT secret so only you can call this
  if (seedKey !== process.env.JWT_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const name = process.env.ADMIN_NAME
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD not set in .env.local' }, { status: 400 })
  }

  const hash = await hashPassword(password)

  await query(`
    INSERT INTO admins (name, email, password_hash)
    VALUES ($1, $2, $3)
    ON CONFLICT (email) DO UPDATE SET
      name = EXCLUDED.name,
      password_hash = EXCLUDED.password_hash
  `, [name, email, hash])

  return NextResponse.json({ 
    success: true, 
    message: `Admin ${email} created. DELETE THIS ROUTE NOW.` 
  })
}