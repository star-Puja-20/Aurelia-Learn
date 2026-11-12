import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { getSupabasePublicConfig } from '@/lib/supabase/env'

const PROTECTED_PREFIXES = ['/teacher', '/admin', '/student']
const AUTH_ROUTES = ['/auth/login', '/auth/register', '/auth/forgot-password']
const STATE_CHANGING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // CSRF defence in depth: browsers always send Origin on cross-site writes. Reject writes from other sites.
  if (STATE_CHANGING.has(request.method) && (pathname.startsWith('/api/') || pathname === '/auth/signout')) {
    const origin = request.headers.get('origin')
    if (origin) {
      let sameOrigin = false
      try {
        sameOrigin = new URL(origin).host === request.headers.get('host')
      } catch {
        sameOrigin = false
      }
      if (!sameOrigin) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
  }

  const supabaseConfigured = getSupabasePublicConfig().configured
  const { supabaseResponse, user } = supabaseConfigured
    ? await updateSession(request)
    : { supabaseResponse: NextResponse.next({ request }), user: null }

  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname === prefix || pathname.startsWith(`${prefix}/`))
  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route))

  if (isProtected && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.search = ''
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/teacher/dashboard'
    url.search = ''
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'],
}
