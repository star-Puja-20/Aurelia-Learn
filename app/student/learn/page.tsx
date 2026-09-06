'use client'
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Star, ChevronRight, ChevronLeft, Volume2, Home, RotateCcw, Check, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { ALPHABET_DATA, WORD_CATEGORIES, SENTENCE_PATTERNS, STORIES } from '@/lib/constants'
import type { LearningLevel } from '@/lib/types'

function speak(text: string) {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel()
    const u = new SpeechSynthesisUtterance(text)
    u.rate = 0.82
    u.lang = 'en-GB'
    window.speechSynthesis.speak(u)
  }
}

// ── Shared progress dots ─────────────────────────────────────
function ProgressDots({ total, current, color = '#4FC3F7' }: { total: number; current: number; color?: string }) {
  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className="h-2 rounded-full transition-all duration-300"
          style={{ width: i <= current ? 24 : 8, backgroundColor: i <= current ? color : '#e5e7eb' }} />
      ))}
    </div>
  )
}

// ── Letter exercise ──────────────────────────────────────────
function LetterExercise({ onDone }: { onDone: (stars: number) => void }) {
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
function WordExercise({ onDone }: { onDone: (stars: number) => void }) {
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
function SentenceExercise({ onDone }: { onDone: (stars: number) => void }) {
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
function StoryExercise({ onDone }: { onDone: (stars: number) => void }) {
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

// ── Complete screen ──────────────────────────────────────────
function CompleteScreen({ stars, onHome, onRetry }: { stars: number; onHome: () => void; onRetry: () => void }) {
  useEffect(() => { speak('Amazing work! You are a star!') }, [])
  return (
    <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-5 text-center">
      <motion.div animate={{ rotate: [0, -10, 10, -5, 5, 0] }} transition={{ duration: 0.8, delay: 0.3 }}
        className="text-8xl">🎉</motion.div>
      <h2 className="font-display text-4xl text-white drop-shadow">Amazing work!</h2>
      <div className="flex gap-3">
        {[1, 2, 3].map(i => (
          <motion.div key={i} initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.3 + i * 0.15, type: 'spring', damping: 10 }}>
            <Star className={`h-12 w-12 drop-shadow-lg ${i <= stars ? 'text-gold-400 fill-gold-400' : 'text-white/30 fill-white/20'}`} />
          </motion.div>
        ))}
      </div>
      <p className="text-sky-100 text-lg">You earned <strong>{stars}</strong> {stars === 1 ? 'star' : 'stars'}!</p>
      <div className="flex gap-3 flex-wrap justify-center mt-2">
        <button onClick={onRetry}
          className="flex items-center gap-2 bg-white/20 text-white border border-white/30 px-6 py-3 rounded-2xl font-display text-lg hover:bg-white/30 active:scale-95 transition-all">
          <RotateCcw className="h-4 w-4" /> Again
        </button>
        <button onClick={onHome}
          className="flex items-center gap-2 bg-white text-sky-600 px-6 py-3 rounded-2xl font-display text-lg shadow-md hover:bg-sky-50 active:scale-95 transition-all">
          <Home className="h-4 w-4" /> Home
        </button>
      </div>
    </motion.div>
  )
}

// ── Activity picker ──────────────────────────────────────────
const ACTIVITIES = [
  { id: 'letter',   label: 'Letters',   emoji: '🔤', color: 'from-sky-400 to-sky-500',    level: 'letter' as LearningLevel },
  { id: 'word',     label: 'Words',     emoji: '📝', color: 'from-mint-400 to-mint-500',  level: 'word' as LearningLevel },
  { id: 'sentence', label: 'Sentences', emoji: '💬', color: 'from-gold-400 to-gold-500',  level: 'sentence' as LearningLevel },
  { id: 'story',    label: 'Story',     emoji: '📖', color: 'from-coral-400 to-coral-500',level: 'story' as LearningLevel },
]

type Activity = 'home' | 'letter' | 'word' | 'sentence' | 'story' | 'complete'

const CURRENT_LEARNING_DAY = 4

export default function StudentLearnPage() {
  const router = useRouter()
  const [activity, setActivity] = useState<Activity>('home')
  const [stars, setStars] = useState(0)

  function finish(s: number) { setStars(s); setActivity('complete') }
  function goHome() { setActivity('home'); setStars(0) }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-500 to-sky-700 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <button onClick={() => { if (activity === 'home') router.push('/student/login'); else goHome() }}
          className="text-white/80 hover:text-white flex items-center gap-1 text-sm font-semibold transition-colors">
          {activity === 'home' ? <><Home className="h-4 w-4" /> Exit</> : <><ChevronLeft className="h-4 w-4" /> Menu</>}
        </button>
        <div className="flex items-center gap-1.5 text-white font-display text-lg">
          <Star className="h-5 w-5 fill-gold-400 text-gold-400" /> Aurelia Learn
        </div>
        <div className="w-16" />
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            {activity === 'home' && (
              <motion.div key="home" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">⭐</div>
                  <h1 className="font-display text-3xl text-white drop-shadow">What shall we learn?</h1>
                    <p className="text-sky-100 text-sm mt-2 font-semibold">Day {CURRENT_LEARNING_DAY}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 w-full">
                  {ACTIVITIES.map(act => (
                    <motion.button key={act.id} whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }}
                      onClick={() => setActivity(act.id as Activity)}
                      className={`bg-gradient-to-br ${act.color} p-5 rounded-2xl shadow-lg text-center`}>
                      <div className="text-4xl mb-1">{act.emoji}</div>
                      <p className="font-display text-white text-lg drop-shadow">{act.label}</p>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {activity === 'letter' && (
              <motion.div key="letter" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-display text-2xl text-white drop-shadow text-center mb-6">Letters 🔤</h2>
                <LetterExercise onDone={finish} />
              </motion.div>
            )}

            {activity === 'word' && (
              <motion.div key="word" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-display text-2xl text-white drop-shadow text-center mb-6">Word Cards 📝</h2>
                <WordExercise onDone={finish} />
              </motion.div>
            )}

            {activity === 'sentence' && (
              <motion.div key="sentence" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-display text-2xl text-white drop-shadow text-center mb-6">Sentences 💬</h2>
                <SentenceExercise onDone={finish} />
              </motion.div>
            )}

            {activity === 'story' && (
              <motion.div key="story" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
                <h2 className="font-display text-2xl text-white drop-shadow text-center mb-4">Story Time 📖</h2>
                <StoryExercise onDone={finish} />
              </motion.div>
            )}

            {activity === 'complete' && (
              <motion.div key="complete" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <CompleteScreen stars={stars} onHome={goHome} onRetry={() => setActivity('home')} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
