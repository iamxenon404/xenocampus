import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'

const PUBLIC_PATHS = ['/', '/signup', '/login', '/pricing', '/features', '/api/auth/login', '/api/stripe/webhook', '/api/stripe/checkout']
const ADMIN_PATHS = ['/admin']
const DASHBOARD_PATHS = ['/dashboard']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hostname = req.headers.get('host') || ''

  // ── Subdomain detection ──────────────────────────────────
  // In production: afe.xenocampus.com → subdomain = 'afe'
  // In dev: localhost:3000 → no subdomain
  const appDomain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost:3000'
  const subdomain = hostname.replace(`.${appDomain}`, '')
  const isSubdomain = subdomain !== hostname && subdomain !== 'www' && subdomain !== ''

  if (isSubdomain) {
    // This is a school subdomain visit → rewrite to school handler
    // e.g. afe.xenocampus.com/dashboard → /school/[subdomain]/dashboard
    return NextResponse.rewrite(
      new URL(`/school/${subdomain}${pathname}`, req.url)
    )
  }

  // ── Admin protection ────────────────────────────────────
  if (ADMIN_PATHS.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get('xeno_admin_token')?.value
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url))

    const session = verifyToken(token)
    if (!session) return NextResponse.redirect(new URL('/admin/login', req.url))

    return NextResponse.next()
  }

  // ── Dashboard protection ─────────────────────────────────
if (DASHBOARD_PATHS.some(p => pathname.startsWith(p))) {
    const token = req.cookies.get('xeno_school_token')?.value
    console.log('token found:', !!token)
    if (!token) return NextResponse.redirect(new URL('/login', req.url))

    const session = verifyToken(token)
    console.log('session valid:', !!session)
    if (!session) return NextResponse.redirect(new URL('/login', req.url))

    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
