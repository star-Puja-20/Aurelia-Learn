import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { getAuthenticatedTeacher } from '@/lib/server-auth'
import { createStudentSessionToken, STUDENT_SESSION_COOKIE, STUDENT_SESSION_MAX_AGE } from '@/lib/student-session'

export async function POST(request: NextRequest) {
  try {
    const teacher = await getAuthenticatedTeacher()
    if (!teacher) return NextResponse.json({ error: 'A teacher must sign in before choosing a learner.' }, { status: 401 })

    const body = await request.json()
    const studentId = typeof body.studentId === 'string' ? body.studentId : ''
    if (!studentId) {
      return NextResponse.json({ error: 'Choose a learner from your class.' }, { status: 400 })
    }

    const supabase = await createServerClient()
    const { data: student, error } = await supabase
      .from('students')
      .select('id')
      .eq('id', studentId)
      .eq('teacher_id', teacher.id)
      .eq('is_active', true)
      .maybeSingle()

    if (error) throw error
    if (!student) return NextResponse.json({ error: 'That learner is not available in your class.' }, { status: 404 })

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
