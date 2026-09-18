import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeUsername, USERNAME_PATTERN } from '@/lib/auth-validation'

export async function POST(request: NextRequest) {
  try {
    const { username, password, fullName, privacyConsent } = await request.json()
    const normalizedUsername = typeof username === 'string' ? normalizeUsername(username) : ''

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      return NextResponse.json({ error: 'Username must be 3-30 characters using letters, numbers, underscores, or hyphens.' }, { status: 400 })
    }
    if (typeof password !== 'string' || password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 })
    }
    if (typeof fullName !== 'string' || fullName.trim().length < 2) {
      return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 })
    }
    if (privacyConsent !== true) {
      return NextResponse.json({ error: 'Please agree before creating your account.' }, { status: 400 })
    }

    const supabase = createAdminClient()
    const { data: existingProfile, error: lookupError } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', normalizedUsername)
      .maybeSingle()
    if (lookupError) throw lookupError
    if (existingProfile) {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }

    const internalEmail = `${normalizedUsername}@accounts.aurelialearn.internal`
    const { data: signupData, error: signupError } = await supabase.auth.admin.createUser({
      email: internalEmail,
      password,
      email_confirm: true,
      user_metadata: {
        username: normalizedUsername,
        full_name: fullName.trim(),
        privacy_consent: true,
        privacy_consent_at: new Date().toISOString(),
        privacy_policy_version: '2026-09-03',
      },
    })

    if (signupError) {
      const duplicate = signupError.message.toLowerCase().includes('already')
      return NextResponse.json({ error: duplicate ? 'That username is already taken.' : signupError.message }, { status: duplicate ? 409 : 400 })
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      id: signupData.user.id,
      username: normalizedUsername,
      full_name: fullName.trim(),
      role: 'teacher',
      privacy_consent: true,
      privacy_consent_at: signupData.user.user_metadata.privacy_consent_at,
      privacy_policy_version: '2026-09-03',
    })

    if (profileError) {
      await supabase.auth.admin.deleteUser(signupData.user.id)
      if (profileError.code === '23505') {
        return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Unable to create your account.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to create your account.' }, { status: 500 })
  }
}
