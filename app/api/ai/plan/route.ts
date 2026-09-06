import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedTeacher } from '@/lib/server-auth'
import { allowRequest } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthenticatedTeacher()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    if (!allowRequest(`ai-plan:${user.id}`, 10, 60_000)) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const { studentName, level, notes, sessionHistory } = await req.json()

    if (typeof studentName !== 'string' || studentName.length > 100 || typeof level !== 'string' ||
      !Array.isArray(notes) || notes.length > 20 || !Array.isArray(sessionHistory) || sessionHistory.length > 50) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    if (!Array.isArray(notes) || notes.length === 0 || notes.every(note => !String(note).trim())) {
      return NextResponse.json({ error: 'A teacher observation is required before generating a plan.' }, { status: 400 })
    }

    if (!process.env.GEMINI_API_KEY) {
      // Return mock plan if no API key configured
      return NextResponse.json({
        plan: generateMockPlan(studentName, level),
        source: 'mock',
      })
    }

    const prompt = buildPrompt(studentName, level, notes, sessionHistory)

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 800 },
        }),
      }
    )

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`)

    const data = await res.json()
    const plan = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return NextResponse.json({ plan, source: 'gemini' })
  } catch (err) {
    console.error('[AI Plan]', err)
    return NextResponse.json({ error: 'Failed to generate plan' }, { status: 500 })
  }
}

function buildPrompt(name: string, level: string, notes: string[], history: string[]) {
  return `You are an expert English teacher assistant for a children's learning platform called Aurelia Learn.

Generate a structured lesson plan for a student named ${name} who is at the "${level}" level of English learning.

The five levels are: Letter → Word → Sentence → Story → Conversation.

Teacher observations provided by the teacher:
${notes.join('\n')}

Previous session topics:
${history.length ? history.join('\n') : 'This is the first session.'}

Generate a clear, engaging lesson plan with:
1. Warm-up activity (5 min)
2. Main learning activity (20 min)
3. Practice exercise (10 min)
4. Wrap-up (5 min)

Keep it child-friendly, specific to the ${level} level, and avoid repeating anything from previous sessions. Use emojis to make it engaging. Format in markdown.`
}

function generateMockPlan(name: string, level: string) {
  const activities: Record<string, string> = {
    letter: `## 📝 Session Plan for ${name} — Letter Level\n\n**Warm-up (5 min)**\nSing the ABC song together and point to each letter on the alphabet chart. Focus on letters the student has recently learned.\n\n**Main Activity (20 min)**\n🔤 Introduce 3 new letters with their sounds and an emoji helper:\n- Letter P → /p/ → 🐧 Penguin\n- Letter Q → /kw/ → 👸 Queen  \n- Letter R → /r/ → 🌈 Rainbow\n\nTrace each letter, say the sound, name the emoji.\n\n**Practice (10 min)**\n✏️ Worksheet: Match the letter to its picture. Write each letter 3 times.\n\n**Wrap-up (5 min)**\n⭐ Review today's 3 letters. Give a star sticker for each one remembered correctly.`,
    word: `## 📚 Session Plan for ${name} — Word Level\n\n**Warm-up (5 min)**\nFlashcard review of 5 sight words from the last session. Quick-fire round!\n\n**Main Activity (20 min)**\n📖 Introduce 5 new sight words:\n- *they* · *said* · *have* · *like* · *some*\n\nFor each word: show card → read aloud → use in a simple sentence → ${name} repeats.\n\n**Practice (10 min)**\n🎯 Word matching game — match word cards to picture cards. Then write each new word once.\n\n**Wrap-up (5 min)**\n⭐ "Word of the day" — ${name} picks their favourite new word and draws a picture for it.`,
    sentence: `## 💬 Session Plan for ${name} — Sentence Level\n\n**Warm-up (5 min)**\nVerb mime game — teacher mimes an action, ${name} calls out the verb (run, jump, swim, draw).\n\n**Main Activity (20 min)**\n✍️ Focus pattern: **"I can ___"**\n\nStep 1: Build 3 sentences together on the whiteboard.\nStep 2: ${name} writes 3 of their own sentences independently.\nStep 3: Read them aloud with expression.\n\n**Practice (10 min)**\n📝 Sentence scramble — unscramble 4 mixed-up sentences using today's pattern.\n\n**Wrap-up (5 min)**\n⭐ ${name} teaches YOU one sentence — explaining what it means.`,
    story: `## 📖 Session Plan for ${name} — Story Level\n\n**Warm-up (5 min)**\nQuick recap of last story. Ask: "Who was the main character? What happened at the end?"\n\n**Main Activity (20 min)**\n📚 Read "The Friendly Dragon" together:\n- Page by page, ${name} reads aloud\n- Pause at key moments: "What do you think will happen next?"\n\n**Practice (10 min)**\n❓ Comprehension questions:\n1. What colour is Pip?\n2. What did Pip breathe instead of fire?\n3. Why did the animals need Pip's help?\n\n**Wrap-up (5 min)**\n⭐ ${name} draws their favourite scene from the story.`,
    conversation: `## 🗣️ Session Plan for ${name} — Conversation Level\n\n**Warm-up (5 min)**\nFree chat in English for 5 minutes — how was your week? Any favourite topic.\n\n**Main Activity (20 min)**\n💬 Dialogue practice: "At the shops"\n\nRole-play a shopping scenario. ${name} plays the customer:\n- Asking for items\n- Asking for the price\n- Saying thank you and goodbye\n\nSwitch roles halfway.\n\n**Practice (10 min)**\n🎙️ Describe a picture scene using at least 5 sentences. Focus on connectors: *first, then, after that, finally*.\n\n**Wrap-up (5 min)**\n⭐ ${name} records a 30-second voice message in English about their favourite thing.`,
  }
  return activities[level] ?? activities['word']
}
