import { createClient } from '@supabase/supabase-js'

export function createAdminClient() {
  // Service-role key must stay on the server. It is not a NEXT_PUBLIC_ variable, so it is never
  // sent to browsers; this guard also fails loudly if the client is ever imported into client code.
  if (typeof window !== 'undefined') {
    throw new Error('The admin Supabase client can only be used on the server.')
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase server configuration is missing.')
  }

  return createClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
