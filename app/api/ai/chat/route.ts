import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'
import { allowRequest } from '@/lib/rate-limit'

type ChatMessage = { role: 'user' | 'assistant'; content: string }

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!allowRequest(`ai-chat:${user.id}`, 30, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const body = await req.json()
    const { message, studentName, level, history } = body
    if (
      typeof message !== 'string' || !message.trim() || message.length > 2000 ||
      typeof studentName !== 'string' || studentName.length > 100 ||
      typeof level !== 'string' || level.length > 30 ||
      !isValidHistory(history)
    ) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ reply: createLocalReply(studentName, level, message), source: 'local' })
    }

    const model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: `You are Aurelia, a warm and practical English-teaching assistant for teachers supporting children. Help with teaching ideas, explanations, activities, and lesson planning. Keep responses clear, age-appropriate, and concise. Do not claim to know a student's ability beyond the teacher-provided context. The selected student is ${studentName}, currently learning at the ${level} level. The learning progression is Letter, Word, Sentence, Story, Conversation.` }],
          },
          contents: [
            ...history.map((item: ChatMessage) => ({
              role: item.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: item.content }],
            })),
            { role: 'user', parts: [{ text: message.trim() }] },
          ],
          generationConfig: { temperature: 0.7, maxOutputTokens: 700 },
        }),
      }
    )

    if (!response.ok) throw new Error(`Gemini error: ${response.status}`)

    const data = await response.json()
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (typeof reply !== 'string' || !reply.trim()) throw new Error('Gemini returned an empty reply')

    return NextResponse.json({ reply: reply.trim(), source: 'gemini' })
  } catch (err) {
    console.error('[AI Chat]', err)
    return NextResponse.json({ error: 'Failed to generate a reply' }, { status: 500 })
  }
}

function isValidHistory(history: unknown): history is ChatMessage[] {
  return Array.isArray(history) && history.length <= 16 && history.every((item: ChatMessage) =>
    item && (item.role === 'user' || item.role === 'assistant') &&
    typeof item.content === 'string' && item.content.length <= 2000
  )
}

function createLocalReply(studentName: string, level: string, message: string) {
  const topic = message.toLowerCase()
  if (topic.includes('lesson') || topic.includes('plan')) {
    return `For ${studentName}'s ${level}-level lesson, try a 5-minute warm-up, a short teacher-led activity, and a playful practice task. Keep each instruction brief, model an example first, and finish by asking ${studentName} to show one thing they learned.`
  }

  return `For ${studentName} at the ${level} level, try breaking this into one small step at a time. Model an example together, invite ${studentName} to try, then offer specific encouragement. What would you like to focus on next: vocabulary, speaking, reading, or a lesson idea?`
}