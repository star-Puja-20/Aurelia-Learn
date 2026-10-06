import { NextRequest, NextResponse } from 'next/server'
import { STUDENT_SESSION_COOKIE } from '@/lib/student-session'

function clearStudentSession(request: NextRequest) {
  const response = NextResponse.redirect(new URL('/student/login', request.url))
  response.cookies.set(STUDENT_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  })
  return response
}

export async function GET(request: NextRequest) {
  return clearStudentSession(request)
}

export async function POST(request: NextRequest) {
  return clearStudentSession(request)
}
