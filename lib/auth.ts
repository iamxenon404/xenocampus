import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'

const JWT_SECRET = process.env.JWT_SECRET!

export interface AdminTokenPayload {
  adminId: string
  email: string
  role: 'superadmin'
}

export interface SchoolTokenPayload {
  schoolId: string
  subdomain: string
}

// Hash a password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

// Compare password to hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// Sign a JWT token
export function signToken(payload: object, expiresIn = '7d'): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions)
}

// Verify a JWT token
export function verifyToken<T>(token: string): T | null {
  try {
    return jwt.verify(token, JWT_SECRET) as T
  } catch {
    return null
  }
}

// Get current school session from cookie
export function getSchoolSession(): SchoolTokenPayload | null {
  const cookieStore = cookies()
  const token = cookieStore.get('xeno_school_token')?.value
  if (!token) return null
  return verifyToken<SchoolTokenPayload>(token)
}

// Get current admin session from cookie
export function getAdminSession(): AdminTokenPayload | null {
  const cookieStore = cookies()
  const token = cookieStore.get('xeno_admin_token')?.value
  if (!token) return null
  return verifyToken<AdminTokenPayload>(token)
}
