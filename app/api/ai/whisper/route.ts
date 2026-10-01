import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedTeacherWorkspace } from '@/lib/server-auth'
import { allowRequest } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedTeacherWorkspace()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!allowRequest(`ai-whisper:${user.id}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const formData = await req.formData()
    const audio = formData.get('audio') as File | null

    if (!audio) {
      return NextResponse.json({ error: 'No audio file provided' }, { status: 400 })
    }
    if (!audio.type.startsWith('audio/') || audio.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Audio must be an audio file smaller than 10 MB' }, { status: 400 })
    }

    if (!process.env.GROQ_API_KEY) {
      // Mock transcript for dev without API key
      const mockTranscripts = [
        "The cat sat on the mat.",
        "I can see a big red apple.",
        "She likes to play in the garden.",
        "My name is Ben and I am six years old.",
        "The sun is bright and the sky is blue.",
      ]
      await new Promise(r => setTimeout(r, 800))
      return NextResponse.json({
        text: mockTranscripts[Math.floor(Math.random() * mockTranscripts.length)],
        source: 'mock',
      })
    }

    const groqForm = new FormData()
    groqForm.append('file', audio, audio.name || 'recording.webm')
    groqForm.append('model', 'whisper-large-v3')
    groqForm.append('language', 'en')
    groqForm.append('response_format', 'json')

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.GROQ_API_KEY}` },
      body: groqForm,
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Groq error: ${res.status} ${err}`)
    }

    const data = await res.json()
    return NextResponse.json({ text: data.text, source: 'groq' })
  } catch (err) {
    console.error('[Whisper]', err)
    return NextResponse.json({ error: 'Transcription failed' }, { status: 500 })
  }
}
