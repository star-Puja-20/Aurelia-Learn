export const USERNAME_PATTERN = /^[a-zA-Z0-9_-]{3,30}$/

export function normalizeUsername(value: string) {
  return value.trim().toLowerCase()
}
