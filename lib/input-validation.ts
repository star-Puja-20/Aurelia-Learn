export const LEVELS = ['letter', 'word', 'sentence', 'story', 'conversation'] as const
export type Level = (typeof LEVELS)[number]

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value)
}

export function isLevel(value: unknown): value is Level {
  return typeof value === 'string' && (LEVELS as readonly string[]).includes(value)
}

// ISO-8601 timestamp that parses to a real date, or null
export function parseIsoDate(value: unknown): string | null {
  if (typeof value !== 'string' || value.length > 40) return null
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : new Date(time).toISOString()
}

// Escape LIKE/ILIKE wildcards so user text is matched literally (underscore is legal in usernames)
export function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, '\\$&')
}

export function isStringArray(value: unknown, maxItems: number, maxLength: number): value is string[] {
  return Array.isArray(value) && value.length <= maxItems &&
    value.every(item => typeof item === 'string' && item.length <= maxLength)
}
