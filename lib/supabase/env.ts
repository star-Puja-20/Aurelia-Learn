// Browser-safe Supabase settings only: the project URL and the limited publishable (anon) key.
// Row Level Security is what protects data when this key is used.
// The service-role / secret key must never be read here or set as a NEXT_PUBLIC_ variable.

function looksLikeSecretKey(key: string) {
  if (key.startsWith('sb_secret_')) return true
  try {
    const payload = key.split('.')[1]
    if (!payload) return false
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return json?.role === 'service_role'
  } catch {
    return false
  }
}

export function getSupabasePublicConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

  if (key && looksLikeSecretKey(key)) {
    throw new Error('A Supabase secret/service-role key is set as a public key. Use the publishable (anon) key in NEXT_PUBLIC_ variables.')
  }

  const configured = !!url && !!key && !url.startsWith('your_') && !key.startsWith('your_')
  return { url, key, configured }
}
