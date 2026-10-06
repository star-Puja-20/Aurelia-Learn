import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { hashPin, verifyPin } from '@/lib/pin-security'
import { createStudentSessionToken, STUDENT_SESSION_COOKIE, STUDENT_SESSION_MAX_AGE } from '@/lib/student-session'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const fullName = typeof body.fullName === 'string' ? body.fullName.trim() : ''
    const pin = typeof body.pin === 'string' ? body.pin : ''
    if (fullName.length < 2 || fullName.length > 100 || !/^\d{4,6}$/.test(pin)) {
      return NextResponse.json({ error: 'Enter your name and 4–6 digit learner PIN.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: students, error } = await admin
      .from('students')
      .select('id, pin_hash')
      .eq('full_name', fullName)
      .eq('is_active', true)
      .limit(20)

    if (error) throw error
    const student = students?.find((candidate) => candidate.pin_hash && verifyPin(pin, candidate.pin_hash))
    if (!student) return NextResponse.json({ error: 'That name and PIN did not match. Ask your teacher for help.' }, { status: 401 })

    const expiresAt = Math.floor(Date.now() / 1000) + STUDENT_SESSION_MAX_AGE
    const token = createStudentSessionToken(student.id, expiresAt)
    const response = NextResponse.json({ success: true })
    response.cookies.set(STUDENT_SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: STUDENT_SESSION_MAX_AGE,
    })
    return response
  } catch (error) {
    console.error('[Student login]', error)
    return NextResponse.json({ error: 'Unable to sign in right now. Please try again.' }, { status: 500 })
  }
}
