'use client'
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Volume2 } from 'lucide-react'
import { ALPHABET_DATA, WORD_CATEGORIES, STORIES } from '@/lib/constants'
import { DIALOGUES } from '@/lib/exercises'
import { speak, ProgressDots } from './shared'

// ── Letter exercise ──────────────────────────────────────────
export function LetterExercise({ onDone }: { onDone: (stars: number) => void }) {
  const letters = ALPHABET_DATA.slice(0, 6)
  const [idx, setIdx] = useState(0)
  const [visible, setVisible] = useState(true)

  function next() {
    if (idx < letters.length - 1) {
      setVisible(false)
      setTimeout(() => { setIdx(i => i + 1); setVisible(true) }, 250)
    } else onDone(3)
  }

  const l = letters[idx]
  return (
    <div className="flex flex-col items-center gap-5">
      <AnimatePresence mode="wait">
        {visible && (
          <motion.div key={idx}
            initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center gap-4"
          >
            <div className="w-52 h-52 bg-white rounded-3xl shadow-xl border-4 border-sky-200 flex flex-col items-center justify-center gap-1">
              <span className="font-display text-8xl text-sky-500 leading-none">{l.uppercase}</span>
              <span className="font-display text-4xl text-sky-300">{l.letter}</span>
            </div>
            <div className="text-center">
              <div className="text-6xl mb-1">{l.emoji}</div>
              <p className="font-display text-2xl text-white drop-shadow">{l.word}</p>
              <p className="text-sky-200 text-sm mt-0.5">{l.phonetic}</p>
            </div>
            <button onClick={() => speak(`${l.uppercase}. ${l.phonetic}. ${l.word}`)}
              className="flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30">
              <Volume2 className="h-4 w-4" /> Hear it
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      <ProgressDots total={letters.length} current={idx} color="#ffffff" />
      <button onClick={next}
        className="flex items-center gap-2 bg-white text-sky-600 px-8 py-3.5 rounded-2xl font-display text-xl shadow-md hover:bg-sky-50 active:scale-95 transition-all">
        {idx < letters.length - 1 ? 'Next' : 'Finish!'} <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

// ── Word flashcard exercise ──────────────────────────────────
export function WordExercise({ onDone }: { onDone: (stars: number) => void }) {
  const entries = Object.entries(WORD_CATEGORIES).slice(0, 2).flatMap(([, cat]) => cat.words.slice(0, 3))
  const words = entries.slice(0, 6)
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const emojiMap: Record<string, string> = {
    cat:'🐱',dog:'🐶',bird:'🐦',fish:'🐟',lion:'🦁',bear:'🐻',
    red:'🔴',blue:'🔵',green:'🟢',yellow:'🟡',pink:'🩷',
  }
  const word = words[idx]

  function next() {
    setFlipped(false)
    if (idx < words.length - 1) setTimeout(() => setIdx(i => i + 1), 200)
    else onDone(3)
  }

  return (
    <div className="flex flex-col items-center gap-5">
      <p className="text-white/80 font-semibold text-sm">Tap the card to reveal!</p>
      <motion.div className="w-64 h-44 cursor-pointer" onClick={() => { setFlipped(f => !f); if (!flipped) speak(word) }}
        style={{ perspective: 1000 }}>
        <motion.div className="w-full h-full relative"
          animate={{ rotateY: flipped ? 180 : 0 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          style={{ transformStyle: 'preserve-3d' }}>
          <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border-4 border-white/50 flex items-center justify-center"
            style={{ backfaceVisibility: 'hidden' }}>
            <span className="text-7xl">{emojiMap[word] ?? '🔤'}</span>
          </div>
          <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border-4 border-mint-300 flex flex-col items-center justify-center gap-2"
            style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden' }}>
            <span className="font-display text-4xl text-navy-800">{word}</span>
            <button onClick={e => { e.stopPropagation(); speak(word) }}
              className="flex items-center gap-1 text-xs text-mint-600 bg-mint-100 px-3 py-1 rounded-full font-semibold">
              <Volume2 className="h-3 w-3" /> Say it
            </button>
          </div>
        </motion.div>
      </motion.div>
      <ProgressDots total={words.length} current={idx} color="#A5D6A7" />
      <button onClick={next} disabled={!flipped}
        className="flex items-center gap-2 bg-white text-mint-600 px-8 py-3.5 rounded-2xl font-display text-xl shadow-md hover:bg-mint-50 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
        {idx < words.length - 1 ? 'Next word' : 'Finish!'} <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}

// ── Sentence exercise (fill-in-the-blank) ───────────────────
export function SentenceExercise({ onDone }: { onDone: (stars: number) => void }) {
  const items = [
    { pattern: 'I am ___', options: ['happy', 'running', 'quickly', 'apple'], answer: 'happy', emoji: '😊' },
    { pattern: 'I can ___', options: ['swim', 'blue', 'said', 'table'], answer: 'swim', emoji: '🏊' },
    { pattern: 'The cat is ___', options: ['big', 'running', 'ate', 'when'], answer: 'big', emoji: '🐱' },
    { pattern: 'I like to ___', options: ['draw', 'quickly', 'apple', 'the'], answer: 'draw', emoji: '🎨' },
    { pattern: 'She has a ___', options: ['book', 'running', 'happy', 'and'], answer: 'book', emoji: '📚' },
  ]
  const [idx, setIdx] = useState(0)
  const [chosen, setChosen] = useState<string | null>(null)
  const [correct, setCorrect] = useState(0)
  const item = items[idx]
  const isCorrect = chosen === item.answer

  function pick(opt: string) {
    if (chosen) return
    setChosen(opt)
    if (opt === item.answer) setCorrect(c => c + 1)
    speak(item.pattern.replace('___', opt))
  }

  function next() {
    setChosen(null)
    if (idx < items.length - 1) setIdx(i => i + 1)
    else {
      const stars = correct + (chosen === item.answer ? 1 : 0) >= 4 ? 3 : correct >= 3 ? 2 : 1
      onDone(stars)
    }
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <div className="text-5xl">{item.emoji}</div>
      <div className="bg-white/20 rounded-2xl px-6 py-4 text-center border border-white/30 w-full">
        <p className="font-display text-2xl text-white drop-shadow">
          {item.pattern.replace('___', chosen ? `[${chosen}]` : '___')}
        </p>
      </div>
      <p className="text-white/70 text-sm">Pick the right word</p>
      <div className="grid grid-cols-2 gap-3 w-full">
        {item.options.map(opt => {
          let style = 'bg-white text-navy-800 hover:bg-sky-50'
          if (chosen) {
            if (opt === item.answer) style = 'bg-mint-400 text-white'
            else if (opt === chosen) style = 'bg-coral-400 text-white'
            else style = 'bg-white/40 text-white/60'
          }
          return (
            <motion.button key={opt} whileTap={{ scale: 0.95 }} onClick={() => pick(opt)}
              className={`${style} py-3 rounded-2xl font-display text-lg shadow-md transition-colors`}>
              {opt}
            </motion.button>
          )
        })}
      </div>
      <ProgressDots total={items.length} current={idx} color="#FFD54F" />
      {chosen && (
        <motion.button initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          onClick={next}
          className="flex items-center gap-2 bg-white text-gold-600 px-8 py-3.5 rounded-2xl font-display text-xl shadow-md active:scale-95 transition-all">
          {idx < items.length - 1 ? 'Next' : 'See results'} <ChevronRight className="h-5 w-5" />
        </motion.button>
      )}
    </div>
  )
}

// ── Story reader exercise ────────────────────────────────────
export function StoryExercise({ onDone }: { onDone: (stars: number) => void }) {
  const story = STORIES[0]
  const [page, setPage] = useState(-1) // -1 = cover
  const [quizIdx, setQuizIdx] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [phase, setPhase] = useState<'cover' | 'read' | 'quiz' | 'done'>('cover')

  function startReading() { setPhase('read'); setPage(0) }
  function nextPage() {
    if (page < story.pages.length - 1) { setPage(p => p + 1); speak(story.pages[page + 1].text) }
    else setPhase('quiz')
  }
  function prevPage() { if (page > 0) setPage(p => p - 1) }

  function answerQ(ans: string) {
    const next = [...answers, ans]
    setAnswers(next)
    if (quizIdx < story.comprehension.length - 1) setQuizIdx(i => i + 1)
    else {
      const correct = next.filter((a, i) => a === story.comprehension[i].answer).length
      const stars = correct === 3 ? 3 : correct === 2 ? 2 : 1
      onDone(stars)
    }
  }

  if (phase === 'cover') return (
    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5">
      <div className="w-48 h-48 bg-white rounded-3xl shadow-xl flex flex-col items-center justify-center gap-2">
        <span className="text-7xl">{story.coverEmoji}</span>
        <p className="font-display text-xl text-navy-800 text-center px-4">{story.title}</p>
      </div>
      <p className="text-white/70 text-sm">{story.pages.length} pages · {story.comprehension.length} questions</p>
      <button onClick={startReading}
        className="flex items-center gap-2 bg-white text-coral-600 px-8 py-3.5 rounded-2xl font-display text-xl shadow-md active:scale-95 transition-all">
        Read the story <ChevronRight className="h-5 w-5" />
      </button>
    </motion.div>
  )

  if (phase === 'read') {
    const p = story.pages[page]
    return (
      <div className="flex flex-col items-center gap-4 w-full max-w-sm">
        <AnimatePresence mode="wait">
          <motion.div key={page} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="bg-white rounded-3xl shadow-xl p-6 w-full text-center">
            <div className="text-6xl mb-4">{p.image}</div>
            <p className="text-navy-800 font-sans text-base leading-relaxed">{p.text}</p>
            <button onClick={() => speak(p.text)}
              className="mt-3 flex items-center gap-1 text-xs text-sky-500 bg-sky-50 px-3 py-1.5 rounded-full font-semibold mx-auto">
              <Volume2 className="h-3 w-3" /> Hear it
            </button>
          </motion.div>
        </AnimatePresence>
        <div className="flex items-center justify-between w-full">
          <button onClick={prevPage} disabled={page === 0}
            className="flex items-center gap-1 text-white/70 disabled:opacity-30 font-semibold text-sm">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <ProgressDots total={story.pages.length} current={page} color="#FF8A80" />
          <button onClick={nextPage}
            className="flex items-center gap-1 text-white font-semibold text-sm">
            {page < story.pages.length - 1 ? 'Next' : 'Quiz!'} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'quiz') {
    const q = story.comprehension[quizIdx]
    return (
      <div className="flex flex-col items-center gap-5 w-full max-w-sm">
        <div className="bg-white/20 rounded-2xl px-5 py-4 text-center border border-white/30 w-full">
          <p className="text-white/60 text-xs font-bold uppercase mb-1">Question {quizIdx + 1}</p>
          <p className="font-display text-xl text-white">{q.question}</p>
        </div>
        <div className="flex flex-col gap-3 w-full">
          {q.options.map(opt => (
            <motion.button key={opt} whileTap={{ scale: 0.97 }} onClick={() => answerQ(opt)}
              className="bg-white text-navy-800 py-3 px-5 rounded-2xl font-semibold text-left shadow-md hover:bg-sky-50 transition-colors">
              {opt}
            </motion.button>
          ))}
        </div>
        <ProgressDots total={story.comprehension.length} current={quizIdx} color="#FF8A80" />
      </div>
    )
  }

  return null
}


// ── Conversation: practise a short dialogue line by line ─────
export function DialogueExercise({ onDone }: { onDone: (stars: number) => void }) {
  const dialogue = DIALOGUES[0]
  const [idx, setIdx] = useState(0)
  const line = dialogue.lines[idx]
  const isLeft = line.speaker === dialogue.lines[0].speaker

  function next() {
    if (idx < dialogue.lines.length - 1) {
      speak(dialogue.lines[idx + 1].text)
      setIdx(i => i + 1)
    } else onDone(3)
  }

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-sm">
      <p className="text-white/80 text-sm font-semibold">{dialogue.title}</p>
      <div className="w-full space-y-2 min-h-[11rem]">
        {dialogue.lines.slice(0, idx + 1).map((l, i) => {
          const left = l.speaker === dialogue.lines[0].speaker
          return (
            <div key={i} className={`flex ${left ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow ${left ? 'bg-white text-navy-800' : 'bg-sky-100 text-navy-800'}`}>
                <span className="block text-[10px] font-bold uppercase text-gray-400">{l.speaker}</span>
                {l.text}
              </div>
            </div>
          )
        })}
      </div>
      <button onClick={() => speak(line.text)}
        className={`flex items-center gap-2 bg-white/20 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-white/30 transition-colors border border-white/30 ${isLeft ? '' : ''}`}>
        <Volume2 className="h-4 w-4" /> Hear it
      </button>
      <ProgressDots total={dialogue.lines.length} current={idx} color="#ffffff" />
      <button onClick={next}
        className="flex items-center gap-2 bg-white text-sky-600 px-8 py-3.5 rounded-2xl font-display text-xl shadow-md hover:bg-sky-50 active:scale-95 transition-all">
        {idx < dialogue.lines.length - 1 ? 'Next' : 'Finish!'} <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
