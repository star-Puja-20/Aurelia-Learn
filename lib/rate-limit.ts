// In-memory limiter. It is per server instance, so on serverless hosting it slows abuse but does not
// give a hard global limit. For a strict limit use a shared store (e.g. Upstash Redis or a Supabase table).
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_KEYS = 10_000

function prune(now: number) {
  const keys = Array.from(attempts.keys())
  for (const key of keys) {
    const entry = attempts.get(key)
    if (entry && entry.resetAt <= now) attempts.delete(key)
  }
  if (attempts.size > MAX_KEYS) {
    // Still too many live keys (a flood of distinct keys): drop the oldest 20% so memory stays bounded.
    const oldest = Array.from(attempts.keys()).slice(0, Math.ceil(attempts.size * 0.2))
    for (const key of oldest) attempts.delete(key)
  }
}

export function allowRequest(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  if (attempts.size > MAX_KEYS) prune(now)

  const entry = attempts.get(key)
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }
  if (entry.count >= limit) return false
  entry.count += 1
  return true
}

// First address in x-forwarded-for is the client on Vercel (the platform overwrites the header).
export function clientIp(request: Request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  return forwarded || request.headers.get('x-real-ip') || 'unknown'
}
