import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedTeacher } from '@/lib/server-auth'
import { allowRequest } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedTeacher()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!allowRequest(`ai-score:${user.id}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { transcript, expected, level } = await req.json()
    if (typeof transcript !== 'string' || typeof expected !== 'string' || transcript.length > 2000 || expected.length > 500) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      // Simple local scoring without API
      const score = localScore(transcript, expected)
      return NextResponse.json({ score, feedback: localFeedback(score), source: 'local' })
    }

    const prompt = `You are scoring a child's English speaking exercise.

Level: ${level}
Expected: "${expected}"
Child said: "${transcript}"

Score from 0-100 based on:
- Accuracy (correct words)
- Completeness (full sentence)
- Appropriateness for the level

Respond with ONLY a JSON object: {"score": number, "feedback": "one encouraging sentence"}`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
        }),
      }
    )

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}'
    const clean = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(clean)

    return NextResponse.json({ ...result, source: 'gemini' })
  } catch (err) {
    console.error('[Score]', err)
    return NextResponse.json({ score: 70, feedback: 'Good try! Keep practising.', source: 'fallback' })
  }
}

function localScore(transcript: string, expected: string): number {
  if (!transcript || !expected) return 0
  const t = transcript.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  const e = expected.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean)
  const matches = t.filter(w => e.includes(w)).length
  return Math.min(100, Math.round((matches / Math.max(e.length, 1)) * 100))
}

function localFeedback(score: number): string {
  if (score >= 90) return 'Amazing! You got it perfectly! ⭐'
  if (score >= 70) return 'Great job! Almost perfect! 🌟'
  if (score >= 50) return 'Good try! Let\'s practise a bit more. 💪'
  return 'Keep going — you\'re learning! 🚀'
}
