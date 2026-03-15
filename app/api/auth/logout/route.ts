import { NextResponse } from 'next/server'

export async function POST() {
  const response = NextResponse.json({ success: true })

  // Clear school token
  response.cookies.set('xeno_school_token', '', {
    httpOnly: true,
    expires: new Date(0),
    path: '/',
  })

  return response
}