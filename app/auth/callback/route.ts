import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (code || (tokenHash && type)) {
    const supabase = await createClient()
    const result = code
      ? await supabase.auth.exchangeCodeForSession(code)
      : await supabase.auth.verifyOtp({ token_hash: tokenHash!, type: type as 'signup' | 'email' | 'recovery' | 'invite' })

    if (!result.error) {
      await supabase.auth.signOut()
      const successUrl = new URL(`${origin}/auth/verify-email`)
      successUrl.searchParams.set('verified', '1')
      if (result.data.user?.email) successUrl.searchParams.set('email', result.data.user.email)
      return NextResponse.redirect(successUrl.toString())
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`)
}
