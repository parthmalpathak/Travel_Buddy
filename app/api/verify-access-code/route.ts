import { NextResponse, type NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const { code } = await request.json()
  const accessCode = process.env.ACCESS_CODE

  if (!accessCode || code !== accessCode) {
    return NextResponse.json({ error: 'Invalid access code' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('_journey_access', accessCode, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 15, // 15 minutes — enough to complete OAuth
    path: '/',
  })
  return response
}
