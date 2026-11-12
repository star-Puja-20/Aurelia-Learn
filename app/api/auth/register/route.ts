import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { normalizeUsername, USERNAME_PATTERN } from '@/lib/auth-validation'
import { escapeLike } from '@/lib/input-validation'
import { allowRequest, clientIp } from '@/lib/rate-limit'
import { PRIVACY_POLICY_VERSION } from '@/lib/legal'

export async function POST(request: NextRequest) {
  try {
    if (!allowRequest(`register:${clientIp(request)}`, 5, 60 * 60_000)) {
      return NextResponse.json({ error: 'Too many sign-up attempts. Please try again later.' }, { status: 429 })
    }

    let body: Record<string, unknown>
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { username, password, fullName, privacyConsent } = body
    const normalizedUsername = typeof username === 'string' ? normalizeUsername(username) : ''

    if (!USERNAME_PATTERN.test(normalizedUsername)) {
      return NextResponse.json({ error: 'Use 3-30 letters, numbers, underscores, or hyphens for the username.' }, { status: 400 })
    }
    if (typeof password !== 'string' || password.length < 8 || password.length > 72) {
      return NextResponse.json({ error: 'Password must be between 8 and 72 characters.' }, { status: 400 })
    }
    if (password.toLowerCase() === normalizedUsername) {
      return NextResponse.json({ error: 'Password must not be the same as your username.' }, { status: 400 })
    }
    if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.length > 100) {
      return NextResponse.json({ error: 'Enter your full name.' }, { status: 400 })
    }
    if (privacyConsent !== true) {
      return NextResponse.json({ error: 'Please agree before creating your account.' }, { status: 400 })
    }
    const admin = createAdminClient()
    const { data: existing, error: lookupError } = await admin
      .from('profiles')
      .select('id')
      .ilike('username', escapeLike(normalizedUsername))
      .maybeSingle()
    if (lookupError) throw lookupError
    if (existing) {
      return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
    }

    const consentAt = new Date().toISOString()
    const { data: created, error: signupError } = await admin.auth.admin.createUser({
      email: `${normalizedUsername}@accounts.aurelialearn.internal`,
      password,
      email_confirm: true,
      user_metadata: {
        username: normalizedUsername,
        full_name: fullName.trim(),
        privacy_consent: true,
        privacy_consent_at: consentAt,
        privacy_policy_version: PRIVACY_POLICY_VERSION,
      },
    })
    if (signupError || !created.user) {
      const duplicate = signupError?.message?.toLowerCase().includes('already')
      return NextResponse.json(
        { error: duplicate ? 'That username is already taken.' : 'Unable to create your account.' },
        { status: duplicate ? 409 : 400 },
      )
    }

    const { error: profileError } = await admin.from('profiles').insert({
      id: created.user.id,
      username: normalizedUsername,
      full_name: fullName.trim(),
      role: 'teacher',
      privacy_consent: true,
      privacy_consent_at: consentAt,
      privacy_policy_version: PRIVACY_POLICY_VERSION,
    })
    if (profileError) {
      await admin.auth.admin.deleteUser(created.user.id)
      if (profileError.code === '23505') {
        return NextResponse.json({ error: 'That username is already taken.' }, { status: 409 })
      }
      return NextResponse.json({ error: 'Unable to create your account.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Unable to create your account.' }, { status: 500 })
  }
}
