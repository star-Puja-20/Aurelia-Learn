import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'

const STUDENT_COLUMNS = 'id, teacher_id, full_name, current_level, avatar_emoji, avatar_color, is_active, created_at, updated_at'

export async function GET() {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('students')
      .select(STUDENT_COLUMNS)
      .eq('teacher_id', user.id)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ students: data ?? [] })
  } catch (error) {
    console.error('[Students GET]', error)
    return NextResponse.json({ error: 'Unable to load students' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { fullName, level, avatarEmoji, avatarColor } = body
    if (typeof fullName !== 'string' || fullName.length < 2 || fullName.length > 100 ||
      !['letter', 'word', 'sentence', 'story', 'conversation'].includes(level) ||
      typeof avatarEmoji !== 'string' || typeof avatarColor !== 'string') {
      return NextResponse.json({ error: 'Missing student details' }, { status: 400 })
    }

    const admin = createAdminClient()

    const { data: student, error } = await admin
      .from('students')
      .insert({
        teacher_id: user.id,
        full_name: fullName,
        current_level: level,
        pin: null,
        pin_hash: null,
        avatar_emoji: avatarEmoji,
        avatar_color: avatarColor,
      })
      .select(STUDENT_COLUMNS)
      .single()

    if (error) {
      console.error('[Students POST insert]', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('[Students POST]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to add student' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { studentId, fullName, level, avatarEmoji, avatarColor, isActive } = body
    if (typeof studentId !== 'string' ||
      (fullName !== undefined && (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 100)) ||
      (level !== undefined && !['letter', 'word', 'sentence', 'story', 'conversation'].includes(level)) ||
      (avatarEmoji !== undefined && typeof avatarEmoji !== 'string') ||
      (avatarColor !== undefined && typeof avatarColor !== 'string') ||
      (isActive !== undefined && typeof isActive !== 'boolean')) {
      return NextResponse.json({ error: 'Invalid student details' }, { status: 400 })
    }

    const updates: Record<string, string | boolean> = {}
    if (fullName !== undefined) updates.full_name = fullName.trim()
    if (level !== undefined) updates.current_level = level
    if (avatarEmoji !== undefined) updates.avatar_emoji = avatarEmoji
    if (avatarColor !== undefined) updates.avatar_color = avatarColor
    if (isActive !== undefined) updates.is_active = isActive

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: student, error } = await admin
      .from('students')
      .update(updates)
      .eq('id', studentId)
      .eq('teacher_id', user.id)
      .select(STUDENT_COLUMNS)
      .maybeSingle()

    if (error) throw error
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 })
    return NextResponse.json({ student })
  } catch (error) {
    console.error('[Students PATCH]', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to update student' }, { status: 500 })
  }
}
