import { NextRequest, NextResponse } from 'next/server'

const DIRECTUS_URL =
  process.env.DIRECTUS_INTERNAL_URL || 'http://databas-directus:8055'

/** Läser `exp` ur en JWT utan att verifiera signaturen. */
function jwtExp(token: string): number | null {
  try {
    const payload = JSON.parse(
      Buffer.from(token.split('.')[1], 'base64').toString('utf8'),
    )
    return typeof payload.exp === 'number' ? payload.exp : null
  } catch {
    return null
  }
}

function clearAndLogin(req: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', req.url))
  res.cookies.delete('directus_token')
  res.cookies.delete('directus_refresh')
  return res
}

export async function middleware(request: NextRequest) {
  const isLogin = request.nextUrl.pathname.startsWith('/login')
  const access = request.cookies.get('directus_token')?.value
  const refresh = request.cookies.get('directus_refresh')?.value

  if (isLogin) {
    // redan inloggad med giltig token → till dashboarden
    const exp = access ? jwtExp(access) : null
    if (access && exp && exp * 1000 > Date.now() + 5000) {
      return NextResponse.redirect(new URL('/', request.url))
    }
    return NextResponse.next()
  }

  const exp = access ? jwtExp(access) : null
  const expiringSoon = !access || !exp || exp * 1000 < Date.now() + 60_000

  if (!expiringSoon) return NextResponse.next()

  // Försök förnya sessionen
  if (!refresh) return clearAndLogin(request)
  try {
    const r = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refresh, mode: 'json' }),
    })
    if (!r.ok) return clearAndLogin(request)
    const { data } = await r.json()
    // uppdatera request-cookies så att RSC-rendern i samma request ser ny token
    request.cookies.set('directus_token', data.access_token)
    request.cookies.set('directus_refresh', data.refresh_token)
    const res = NextResponse.next({ request: { headers: request.headers } })
    res.cookies.set('directus_token', data.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })
    res.cookies.set('directus_refresh', data.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })
    return res
  } catch {
    return clearAndLogin(request)
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/health|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
