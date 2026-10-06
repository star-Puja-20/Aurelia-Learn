import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

export const STUDENT_SESSION_COOKIE = 'aurelia_student'
export const STUDENT_SESSION_MAX_AGE = 60 * 60 * 12

function getSigningKey() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('Student session signing key is not configured.')
  return key
}

export function createStudentSessionToken(studentId: string, expiresAt: number) {
  const payload = `${studentId}.${expiresAt}`
  const signature = createHmac('sha256', getSigningKey()).update(payload).digest('base64url')
  return `${payload}.${signature}`
}

export function verifyStudentSessionToken(token: string | undefined) {
  if (!token) return null
  const [studentId, expiry, suppliedSignature, extra] = token.split('.')
  if (!studentId || !expiry || !suppliedSignature || extra !== undefined || !/^\d+$/.test(expiry)) return null

  const expiresAt = Number(expiry)
  if (!Number.isSafeInteger(expiresAt) || expiresAt <= Math.floor(Date.now() / 1000)) return null

  const payload = `${studentId}.${expiry}`
  const expectedSignature = createHmac('sha256', getSigningKey()).update(payload).digest()
  const actualSignature = Buffer.from(suppliedSignature, 'base64url')
  if (actualSignature.length !== expectedSignature.length || !timingSafeEqual(actualSignature, expectedSignature)) return null

  return studentId
}

export async function getStudentIdFromCookie() {
  const token = (await cookies()).get(STUDENT_SESSION_COOKIE)?.value
  return verifyStudentSessionToken(token)
}
