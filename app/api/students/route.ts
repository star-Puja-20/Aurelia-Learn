import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { getAuthenticatedTeacher } from '@/lib/server-auth'

const STUDENT_COLUMNS = 'id, teacher_id, full_name, current_level, avatar_emoji, avatar_color, is_active, created_at, updated_at'

export async function GET() {
  try {
    const user = await getAuthenticatedTeacher()
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
    const user = await getAuthenticatedTeacher()
    if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })

    const body = await request.json()
    const { fullName, level, avatarEmoji, avatarColor } = body
    if (typeof fullName !== 'string' || fullName.length < 2 || fullName.length > 100 ||
      !['letter', 'word', 'sentence', 'story', 'conversation'].includes(level) ||
      typeof avatarEmoji !== 'string' || typeof avatarColor !== 'string') {
      return NextResponse.json({ error: 'Missing student details' }, { status: 400 })
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    if (!serviceKey || !supabaseUrl || serviceKey.startsWith('your_')) {
      return NextResponse.json({ error: 'Supabase server configuration is incomplete' }, { status: 500 })
    }

    const admin = createSupabaseClient(supabaseUrl, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

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

    if (error) throw error
    return NextResponse.json({ student }, { status: 201 })
  } catch (error) {
    console.error('[Students POST]', error)
    return NextResponse.json({ error: 'Unable to add student' }, { status: 500 })
  }
}
