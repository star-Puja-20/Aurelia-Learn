import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Routes that require authentication
const PROTECTED_TEACHER = ['/teacher']
const PROTECTED_ADMIN = ['/admin']
const AUTH_ROUTES = ['/auth/login', '/auth/admin', '/auth/register', '/auth/forgot-password']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Demo mode: bypass Supabase auth entirely
  const demoSession = request.cookies.get('demo_session')?.value

  const supabaseConfigured = [
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  ].every(value => value && !value.startsWith('your_'))

  // Demo mode can run locally without Supabase credentials.
  const { supabaseResponse, user } = supabaseConfigured
    ? await updateSession(request)
    : { supabaseResponse: NextResponse.next(), user: null }

  const isAuthenticated = !!user || (process.env.NODE_ENV !== 'production' && !!demoSession)

  const isTeacherRoute = PROTECTED_TEACHER.some(r => pathname.startsWith(r))
  const isAdminRoute = PROTECTED_ADMIN.some(r => pathname.startsWith(r))
  const isAuthRoute = AUTH_ROUTES.some(r => pathname.startsWith(r))
  const isStudentLearnRoute = pathname === '/student/learn'
  const studentSession = request.cookies.get('aurelia_student')?.value

  // Not logged in → redirect to login
  if ((isTeacherRoute || isAdminRoute) && !isAuthenticated && pathname !== '/teacher/login' && pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }
  if (isStudentLearnRoute && !studentSession) return NextResponse.redirect(new URL('/student/login', request.url))
  if (pathname === '/student/login' && studentSession) return NextResponse.redirect(new URL('/student/learn', request.url))

  // Admin-only protection
  if (isAdminRoute && isAuthenticated) {
    const demoRole = request.cookies.get('demo_role')?.value
    if (demoRole === 'teacher') {
      return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
    }
  }

  // Logged in → redirect away from auth pages
  if (isAuthRoute && isAuthenticated) {
    const demoRole = request.cookies.get('demo_role')?.value
    if (demoRole === 'administrator') {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
    return NextResponse.redirect(new URL('/teacher/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
