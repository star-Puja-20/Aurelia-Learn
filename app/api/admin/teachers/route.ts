import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getAuthenticatedAdmin } from '@/lib/server-auth'
import { allowRequest } from '@/lib/rate-limit'

export async function GET() {
  try {
    const user = await getAuthenticatedAdmin()
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })

    const { data, error } = await createAdminClient()
      .from('profiles')
      .select('id, username, full_name, role, created_at')
      .order('created_at', { ascending: true })

    if (error) throw error
    return NextResponse.json({ teachers: data ?? [], currentUserId: user.id })
  } catch (error) {
    console.error('[Admin teachers GET]', error)
    return NextResponse.json({ error: 'Unable to load teacher accounts' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getAuthenticatedAdmin()
    if (!user) return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    if (!allowRequest(`admin-role:${user.id}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { userId, role } = await request.json()
    if (typeof userId !== 'string' || (role !== 'teacher' && role !== 'administrator')) {
      return NextResponse.json({ error: 'Invalid role change' }, { status: 400 })
    }
    if (userId === user.id && role === 'teacher') {
      return NextResponse.json({ error: 'You cannot remove your own administrator access.' }, { status: 400 })
    }

    const admin = createAdminClient()
    const { data: target, error: targetError } = await admin
      .from('profiles')
      .select('id, role')
      .eq('id', userId)
      .maybeSingle()
    if (targetError) throw targetError
    if (!target) return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    if (target.role === role) return NextResponse.json({ success: true, role })

    if (target.role === 'administrator' && role === 'teacher') {
      const { count, error: countError } = await admin
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .eq('role', 'administrator')
      if (countError) throw countError
      if ((count ?? 0) <= 1) {
        return NextResponse.json({ error: 'At least one administrator must remain.' }, { status: 409 })
      }
    }

    const { error } = await admin
      .from('profiles')
      .update({ role })
      .eq('id', userId)
    if (error) throw error

    return NextResponse.json({ success: true, role })
  } catch (error) {
    console.error('[Admin teachers PATCH]', error)
    return NextResponse.json({ error: 'Unable to update account access' }, { status: 500 })
  }
}