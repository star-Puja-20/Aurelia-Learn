import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeUsername, USERNAME_PATTERN } from '@/lib/auth-validation'
import { allowRequest } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const username = normalizeUsername(request.nextUrl.searchParams.get('username') ?? '')
    if (!USERNAME_PATTERN.test(username)) {
      return NextResponse.json({ available: false, valid: false })
    }
    if (!allowRequest(`username-check:${request.headers.get('x-forwarded-for') ?? 'anonymous'}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', username)
      .maybeSingle()

    if (error) throw error
    return NextResponse.json({ available: !data, valid: true })
  } catch (error) {
    console.error('[Username availability]', error)
    return NextResponse.json({ error: 'Unable to check username availability' }, { status: 500 })
  }
}
