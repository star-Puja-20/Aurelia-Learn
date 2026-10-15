import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeUsername, USERNAME_PATTERN } from '@/lib/auth-validation'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, requiredRole } = await request.json()
    if (typeof identifier !== 'string' || typeof password !== 'string' || !password) {
      return NextResponse.json({ error: 'Enter your username and password.' }, { status: 400 })
    }
    if (requiredRole !== 'teacher' && requiredRole !== 'administrator') {
      return NextResponse.json({ error: 'Invalid account type.' }, { status: 400 })
    }

    const username = normalizeUsername(identifier)
    if (!USERNAME_PATTERN.test(username)) return NextResponse.json({ error: 'Enter a valid username.' }, { status: 400 })

    const admin = createAdminClient()
    const authEmail = `${username}@accounts.aurelialearn.internal`

    const response = NextResponse.json({ success: true })
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: cookiesToSet => cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
        },
      },
    )

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email: authEmail, password })
    if (signInError || !data.user) return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 })

    const { data: profile, error: roleError } = await admin
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()
    if (roleError || !profile || profile.role !== requiredRole) {
      await supabase.auth.signOut()
      return NextResponse.json({
        error: requiredRole === 'teacher' ? 'This account is not a teacher account.' : 'This account is not an administrator account.',
      }, { status: 403 })
    }

    return response
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to sign in.' }, { status: 500 })
  }
}
